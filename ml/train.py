"""
Neurax symptom catalog builder and local classifier trainer.

Builds a generated catalog from the curated Hugging Face splits downloaded into
`ml/data/raw/`, emits a repo-owned catalog artifact under `ml/generated/`, and
trains a lightweight local classifier for the optional Python prediction server.
"""

from __future__ import annotations

import json
import math
import os
import re
import unicodedata
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import SGDClassifier
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    top_k_accuracy_score,
)
from sklearn.model_selection import train_test_split


ROOT_DIR = Path(__file__).resolve().parent
RAW_DATA_DIR = ROOT_DIR / "data" / "raw"
GENERATED_DIR = ROOT_DIR / "generated"
CATALOG_PATH = GENERATED_DIR / "catalog.json"
MODEL_PATH = GENERATED_DIR / "model.joblib"
MODEL_META_PATH = GENERATED_DIR / "model_meta.json"
SEED_PATH = ROOT_DIR.parent / "src" / "db" / "seed.ts"

INCLUDED_SOURCES = {
    "QuyenAnh",
    "celikmus",
    "duxTecblic",
    "dhivyeshrk",
    "IndianServers",
    "itachi9604",
    "symptom2disease",
}
EXCLUDED_SOURCES = {"ventis"}
LIST_LIKE_SOURCES = {"QuyenAnh", "dhivyeshrk", "IndianServers", "itachi9604"}
MIN_DISEASE_ROWS = 5
EXTENDED_SYMPTOM_MIN_FREQUENCY = 20
EXTENDED_SYMPTOM_MIN_DISEASES = 3
MAX_DISEASE_SYMPTOMS = 12
MAX_TREATMENTS = 8

SEVERITY_RULES = {
    "critical": (
        "cancer",
        "carcinoma",
        "leukemia",
        "lymphoma",
        "glioblastoma",
        "myocardial infarction",
        "heart failure",
        "stroke",
        "ebola",
        "sepsis",
        "respiratory failure",
        "tuberculosis",
        "aids",
    ),
    "high": (
        "disease",
        "syndrome",
        "hepatitis",
        "angina",
        "pneumonia",
        "diabetes",
        "asthma",
        "colitis",
        "arthritis",
        "kidney",
        "renal",
        "multiple sclerosis",
    ),
    "low": (
        "allergy",
        "acne",
        "common cold",
        "dermatitis",
        "rash",
        "eczema",
        "tension headache",
    ),
}

NOISE_FRAGMENTS = {
    "open pop-up dialog box",
    "close",
    "show transcript",
    "view larger image",
    "click here",
    "nan",
    "none",
}

CORE_ALIAS_OVERRIDES = {
    "fever": "high fever",
    "high temperature": "high fever",
    "shortness of breath": "breathlessness",
    "difficulty breathing": "breathlessness",
    "difficulty in breathing": "breathlessness",
    "itchy skin": "itching",
    "itching of skin": "itching",
    "tiredness": "fatigue",
    "tired": "fatigue",
    "frequent urination": "polyuria",
    "urinating more than usual": "polyuria",
    "loss of appetite": "loss of appetite",
    "sore throat": "throat irritation",
    "palpitations": "palpitations",
    "hoarse voice": "hoarseness",
}


@dataclass(frozen=True)
class SymptomRecord:
    id: str
    key: str
    name: str
    category: str
    aliases: tuple[str, ...]
    source: str


def normalize_ascii(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    value = value.lower()
    value = value.replace("_", " ").replace("/", " / ")
    value = value.replace("&", " and ")
    value = re.sub(r"<[^>]+>", " ", value)
    value = re.sub(r"[^a-z0-9+\-/(),;:\n\r ]+", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip(" ,;:")


def canonicalize_disease_name(value: str) -> str:
    value = normalize_ascii(value)
    value = re.sub(r"\s+-\s+\d+$", "", value)
    value = re.sub(r"-\d+$", "", value)
    value = re.sub(r"\btype\s+([ivx]+)\b", r"type \1", value)
    return value.strip()


def canonicalize_symptom_phrase(value: str) -> str:
    value = normalize_ascii(value)
    value = value.replace("  ", " ")
    value = re.sub(r"\b(the|a|an)\b", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip(" ,;:-")


def title_case_phrase(value: str) -> str:
    return " ".join(part.capitalize() for part in value.split())


def is_valid_symptom_phrase(value: str) -> bool:
    if not value or value in NOISE_FRAGMENTS:
        return False
    if any(fragment in value for fragment in NOISE_FRAGMENTS):
        return False
    if len(value) < 2 or len(value) > 70:
        return False
    if value.isdigit():
        return False
    words = value.split()
    if len(words) > 9:
        return False
    if not any(ch.isalpha() for ch in value):
        return False
    return True


def split_fragments(value: str) -> list[str]:
    cleaned = value.replace(". ", ", ").replace(" and ", ", ")
    parts = re.split(r"[,;\n\r]+", cleaned)
    return [canonicalize_symptom_phrase(part) for part in parts if part.strip()]


def load_core_symptoms() -> list[SymptomRecord]:
    seed_text = SEED_PATH.read_text(encoding="utf-8", errors="ignore")
    matches = re.findall(
        r'\{ id: "([^"]+)", name: "([^"]+)", category: "([^"]+)" \}',
        seed_text,
    )
    symptoms: list[SymptomRecord] = []
    seen_keys: set[str] = set()
    for symptom_id, name, category in matches:
        key = canonicalize_symptom_phrase(name)
        if key in seen_keys:
            raise ValueError(f"Duplicate core symptom key detected: {key}")
        seen_keys.add(key)
        aliases = {key}
        for raw_alias, canonical_alias in CORE_ALIAS_OVERRIDES.items():
            if canonical_alias == key:
                aliases.add(raw_alias)
        symptoms.append(
            SymptomRecord(
                id=symptom_id,
                key=key,
                name=name,
                category=category,
                aliases=tuple(sorted(aliases)),
                source="core",
            )
        )
    return symptoms


def load_source_frames() -> dict[str, pd.DataFrame]:
    frames: dict[str, pd.DataFrame] = {}
    for file_path in sorted(RAW_DATA_DIR.glob("*.parquet")):
        source_name = file_path.name.split("-")[0]
        if source_name in EXCLUDED_SOURCES or source_name not in INCLUDED_SOURCES:
            continue
        frames[source_name] = pd.read_parquet(file_path)
    if not frames:
        raise FileNotFoundError("No parquet sources found in ml/data/raw")
    return frames


def extract_extended_candidates(
    frames: dict[str, pd.DataFrame], core_alias_map: dict[str, str]
) -> list[SymptomRecord]:
    frequency: Counter[str] = Counter()
    disease_coverage: defaultdict[str, set[str]] = defaultdict(set)

    for source_name, frame in frames.items():
        if source_name not in LIST_LIKE_SOURCES:
            continue
        for _, row in frame.iterrows():
            disease_key = canonicalize_disease_name(str(row["Disease"]))
            for fragment in split_fragments(str(row["Symptoms"])):
                if not is_valid_symptom_phrase(fragment):
                    continue
                canonical_key = core_alias_map.get(fragment, fragment)
                frequency[canonical_key] += 1
                disease_coverage[canonical_key].add(disease_key)

    extended: list[SymptomRecord] = []
    next_index = 1
    for key, count in frequency.most_common():
        if key in core_alias_map.values():
            continue
        if count < EXTENDED_SYMPTOM_MIN_FREQUENCY:
            continue
        if len(disease_coverage[key]) < EXTENDED_SYMPTOM_MIN_DISEASES:
            continue
        extended.append(
            SymptomRecord(
                id=f"x{next_index}",
                key=key,
                name=title_case_phrase(key),
                category="Extended Library",
                aliases=(key,),
                source="extended",
            )
        )
        next_index += 1
    return extended


def build_alias_map(symptoms: Iterable[SymptomRecord]) -> dict[str, str]:
    alias_map: dict[str, str] = {}
    for symptom in symptoms:
        alias_map[symptom.key] = symptom.key
        alias_map[symptom.name.lower()] = symptom.key
        for alias in symptom.aliases:
            alias_map[canonicalize_symptom_phrase(alias)] = symptom.key
    return alias_map


def parse_treatments(raw_value: str) -> list[str]:
    parts = [part.strip(" .") for part in re.split(r"[,;\n\r]+", raw_value) if part.strip()]
    treatments: list[str] = []
    for part in parts:
        cleaned = re.sub(r"\s+", " ", part).strip()
        if len(cleaned) < 3 or len(cleaned) > 120:
            continue
        treatments.append(cleaned)
    return treatments


def extract_symptom_keys(
    source_name: str,
    raw_text: str,
    alias_map: dict[str, str],
    searchable_terms: list[str],
) -> list[str]:
    normalized_text = canonicalize_symptom_phrase(raw_text)
    found_keys: list[str] = []

    for fragment in split_fragments(raw_text):
        if not is_valid_symptom_phrase(fragment):
            continue
        canonical_key = alias_map.get(fragment)
        if canonical_key and canonical_key not in found_keys:
            found_keys.append(canonical_key)

    if source_name in LIST_LIKE_SOURCES and found_keys:
        return found_keys

    compact_text = f" {normalized_text} "
    for term in searchable_terms:
        if f" {term} " in compact_text:
            canonical_key = alias_map[term]
            if canonical_key not in found_keys:
                found_keys.append(canonical_key)
    return found_keys


def determine_severity(disease_name: str) -> str:
    lowered = disease_name.lower()
    for severity, needles in SEVERITY_RULES.items():
        if any(needle in lowered for needle in needles):
            return severity
    return "medium"


def feature_token(symptom_key: str) -> str:
    return symptom_key.replace(" ", "_").replace("/", "_")


def build_catalog() -> tuple[dict[str, object], list[str], list[str]]:
    core_symptoms = load_core_symptoms()
    frames = load_source_frames()
    core_alias_map = build_alias_map(core_symptoms)
    extended_symptoms = extract_extended_candidates(frames, core_alias_map)
    symptom_registry = core_symptoms + extended_symptoms
    alias_map = build_alias_map(symptom_registry)
    searchable_terms = sorted(alias_map.keys(), key=len, reverse=True)
    symptom_lookup = {symptom.key: symptom for symptom in symptom_registry}

    rows: list[dict[str, object]] = []
    for source_name, frame in frames.items():
        for _, row in frame.iterrows():
            disease_key = canonicalize_disease_name(str(row["Disease"]))
            if not disease_key:
                continue
            symptom_keys = extract_symptom_keys(
                source_name,
                str(row["Symptoms"]),
                alias_map,
                searchable_terms,
            )
            if len(symptom_keys) < 2:
                continue
            rows.append(
                {
                    "source": source_name,
                    "disease_key": disease_key,
                    "disease_name": title_case_phrase(disease_key),
                    "symptom_keys": sorted(set(symptom_keys)),
                    "treatments": parse_treatments(str(row["Treatments"] or "")),
                }
            )

    disease_counts = Counter(row["disease_key"] for row in rows)
    kept_diseases = {key for key, count in disease_counts.items() if count >= MIN_DISEASE_ROWS}
    filtered_rows = [row for row in rows if row["disease_key"] in kept_diseases]

    disease_groups: defaultdict[str, list[dict[str, object]]] = defaultdict(list)
    for row in filtered_rows:
        disease_groups[str(row["disease_key"])].append(row)

    if len(disease_groups) <= 505:
        raise ValueError(
            f"Normalized disease count {len(disease_groups)} does not exceed 505. "
            "Review thresholds or source ingestion."
        )

    diseases_payload: list[dict[str, object]] = []
    disease_info: dict[str, dict[str, object]] = {}

    for index, (disease_key, disease_rows) in enumerate(sorted(disease_groups.items()), start=1):
        name_counter = Counter(str(row["disease_name"]) for row in disease_rows)
        display_name = name_counter.most_common(1)[0][0]
        symptom_counter: Counter[str] = Counter()
        treatment_counter: Counter[str] = Counter()

        for row in disease_rows:
            symptom_counter.update(row["symptom_keys"])
            treatment_counter.update(row["treatments"])

        top_symptoms = [
            {
                "key": key,
                "name": symptom_lookup[key].name,
                "weight": round(count / len(disease_rows), 4),
                "source": symptom_lookup[key].source,
            }
            for key, count in symptom_counter.most_common(MAX_DISEASE_SYMPTOMS)
        ]
        treatments = [name for name, _ in treatment_counter.most_common(MAX_TREATMENTS)]
        severity = determine_severity(display_name)
        disease_id = f"d{index}"
        aliases = sorted({display_name.lower(), disease_key})

        diseases_payload.append(
            {
                "id": disease_id,
                "key": disease_key,
                "name": display_name,
                "aliases": aliases,
                "severity": severity,
                "description": "",
                "precautions": [],
                "treatments": treatments,
                "symptoms": top_symptoms,
                "rowCount": len(disease_rows),
            }
        )
        disease_info[display_name] = {
            "severity": severity,
            "symptoms": [symptom["name"] for symptom in top_symptoms],
        }

    duplicate_aliases = [
        alias for alias, count in Counter(alias_map.keys()).items() if count > 1
    ]
    if duplicate_aliases:
        raise ValueError(f"Duplicate symptom aliases detected: {duplicate_aliases[:10]}")

    catalog = {
        "generatedAt": pd.Timestamp.utcnow().isoformat(),
        "counts": {
            "diseases": len(diseases_payload),
            "coreSymptoms": len(core_symptoms),
            "extendedSymptoms": len(extended_symptoms),
            "rows": len(filtered_rows),
        },
        "coreSymptoms": [
            {
                "id": symptom.id,
                "key": symptom.key,
                "name": symptom.name,
                "category": symptom.category,
                "aliases": list(symptom.aliases),
                "source": symptom.source,
            }
            for symptom in core_symptoms
        ],
        "extendedSymptoms": [
            {
                "id": symptom.id,
                "key": symptom.key,
                "name": symptom.name,
                "category": symptom.category,
                "aliases": list(symptom.aliases),
                "source": symptom.source,
            }
            for symptom in extended_symptoms
        ],
        "symptomAliases": alias_map,
        "diseases": diseases_payload,
        "diseaseInfo": disease_info,
        "trainingMetadata": {
            "includedSources": sorted(INCLUDED_SOURCES),
            "excludedSources": sorted(EXCLUDED_SOURCES),
            "minDiseaseRows": MIN_DISEASE_ROWS,
            "extendedSymptomMinFrequency": EXTENDED_SYMPTOM_MIN_FREQUENCY,
            "extendedSymptomMinDiseases": EXTENDED_SYMPTOM_MIN_DISEASES,
        },
    }

    features = [" ".join(feature_token(key) for key in row["symptom_keys"]) for row in filtered_rows]
    labels = [str(row["disease_name"]) for row in filtered_rows]
    return catalog, features, labels


def train_model(features: list[str], labels: list[str]) -> dict[str, float]:
    x_train, x_test, y_train, y_test = train_test_split(
        features,
        labels,
        test_size=0.2,
        random_state=42,
        stratify=labels,
    )

    vectorizer = TfidfVectorizer(lowercase=False, token_pattern=r"(?u)\b\S+\b")
    x_train_vectorized = vectorizer.fit_transform(x_train)
    x_test_vectorized = vectorizer.transform(x_test)

    classifier = SGDClassifier(
        loss="log_loss",
        max_iter=1000,
        tol=1e-3,
        random_state=42,
        early_stopping=True,
        n_iter_no_change=5,
    )
    classifier.fit(x_train_vectorized, y_train)
    predictions = classifier.predict(x_test_vectorized)
    probabilities = classifier.predict_proba(x_test_vectorized)

    metrics = {
        "accuracy": accuracy_score(y_test, predictions),
        "precision": precision_score(y_test, predictions, average="weighted", zero_division=0),
        "recall": recall_score(y_test, predictions, average="weighted", zero_division=0),
        "f1": f1_score(y_test, predictions, average="weighted", zero_division=0),
        "top3": top_k_accuracy_score(
            y_test,
            probabilities,
            k=min(3, len(classifier.classes_)),
            labels=classifier.classes_,
        ),
        "top5": top_k_accuracy_score(
            y_test,
            probabilities,
            k=min(5, len(classifier.classes_)),
            labels=classifier.classes_,
        ),
    }

    GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump({"vectorizer": vectorizer, "classifier": classifier}, MODEL_PATH)
    return metrics


def write_artifacts(catalog: dict[str, object], metrics: dict[str, float]) -> None:
    catalog["metrics"] = {key: round(value * 100, 2) for key, value in metrics.items()}
    CATALOG_PATH.write_text(json.dumps(catalog, indent=2), encoding="utf-8")
    MODEL_META_PATH.write_text(
        json.dumps(
            {
                "counts": catalog["counts"],
                "metrics": catalog["metrics"],
                "generatedAt": catalog["generatedAt"],
                "trainingMetadata": catalog["trainingMetadata"],
            },
            indent=2,
        ),
        encoding="utf-8",
    )


def main() -> None:
    print("==========================================================")
    print("  Neurax Clinical Catalog Builder")
    print("==========================================================")
    print()
    catalog, features, labels = build_catalog()
    print(
        f"[1/3] Catalog built: {catalog['counts']['diseases']} diseases, "
        f"{catalog['counts']['coreSymptoms']} core symptoms, "
        f"{catalog['counts']['extendedSymptoms']} extended symptoms"
    )
    print(f"[2/3] Training local classifier on {len(features)} normalized rows...")
    metrics = train_model(features, labels)
    print(
        "[3/3] Writing artifacts to ml/generated/ "
        f"(accuracy={metrics['accuracy'] * 100:.2f}%, f1={metrics['f1'] * 100:.2f}%)"
    )
    write_artifacts(catalog, metrics)
    print()
    print(f"Catalog artifact: {CATALOG_PATH}")
    print(f"Model artifact:   {MODEL_PATH}")
    print(f"Meta artifact:    {MODEL_META_PATH}")


if __name__ == "__main__":
    main()
