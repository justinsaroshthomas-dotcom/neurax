from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

import joblib
import numpy as np
from flask import Flask, jsonify, request


ROOT_DIR = Path(__file__).resolve().parent
GENERATED_DIR = ROOT_DIR / "generated"
CATALOG_PATH = GENERATED_DIR / "catalog.json"
MODEL_PATH = GENERATED_DIR / "model.joblib"

app = Flask(__name__)


def normalize_text(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    value = value.lower().replace("_", " ").replace("/", " / ").replace("&", " and ")
    value = re.sub(r"[^a-z0-9+\-/(),;:\n\r ]+", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip(" ,;:")


def feature_token(symptom_key: str) -> str:
    return symptom_key.replace(" ", "_").replace("/", "_")


def load_catalog() -> dict[str, object]:
    return json.loads(CATALOG_PATH.read_text(encoding="utf-8"))


def load_model() -> dict[str, object]:
    return joblib.load(MODEL_PATH)


catalog = load_catalog()
model_bundle = load_model()
vectorizer = model_bundle["vectorizer"]
classifier = model_bundle["classifier"]
all_symptoms = {symptom["key"]: symptom["name"] for symptom in catalog["coreSymptoms"] + catalog["extendedSymptoms"]}
diseases_by_name = {disease["name"]: disease for disease in catalog["diseases"]}


def normalize_input_symptoms(symptoms: list[str]) -> list[str]:
    alias_map = catalog["symptomAliases"]
    normalized: list[str] = []
    for symptom in symptoms:
        key = alias_map.get(normalize_text(symptom))
        if key and key not in normalized:
            normalized.append(key)
    return normalized


def score_overlap(symptom_keys: list[str]) -> dict[str, float]:
    scores: dict[str, float] = {}
    query_set = set(symptom_keys)
    for disease in catalog["diseases"]:
        matched = [symptom for symptom in disease["symptoms"] if symptom["key"] in query_set]
        if not matched:
            continue
        total_weight = sum(symptom["weight"] for symptom in disease["symptoms"]) or 1.0
        matched_weight = sum(symptom["weight"] for symptom in matched)
        coverage = len(matched) / max(len(query_set), 1)
        scores[disease["name"]] = min(0.99, matched_weight / total_weight * 0.75 + coverage * 0.25)
    return scores


def build_prediction(disease_name: str, score: float, query_set: set[str]) -> dict[str, object]:
    disease = diseases_by_name[disease_name]
    matched_symptoms = [
        all_symptoms[symptom["key"]]
        for symptom in disease["symptoms"]
        if symptom["key"] in query_set
    ]
    return {
        "disease": disease["name"],
        "confidence": round(float(score), 4),
        "severity": disease["severity"],
        "description": disease.get("description", ""),
        "precautions": disease.get("precautions", []),
        "treatments": disease.get("treatments", []),
        "matchedSymptoms": matched_symptoms,
    }


@app.get("/health")
def health() -> tuple[object, int]:
    return jsonify(
        {
            "status": "ok",
            "counts": catalog["counts"],
            "metrics": catalog.get("metrics", {}),
        }
    ), 200


@app.post("/predict")
def predict() -> tuple[object, int]:
    payload = request.get_json(silent=True) or {}
    symptoms = payload.get("symptoms")
    if not isinstance(symptoms, list) or not symptoms:
        return jsonify({"error": "Please provide symptoms as a non-empty list."}), 400

    symptom_keys = normalize_input_symptoms(symptoms)
    if not symptom_keys:
        return jsonify(
            {
                "predictions": [],
                "aiAnalysis": None,
                "model_metrics": catalog.get("metrics", {}),
            }
        ), 200

    overlap_scores = score_overlap(symptom_keys)
    feature_string = " ".join(feature_token(key) for key in symptom_keys)
    x_vector = vectorizer.transform([feature_string])
    probabilities = classifier.predict_proba(x_vector)[0]

    merged_scores: dict[str, float] = {}
    for class_name, probability in zip(classifier.classes_, probabilities):
        merged_scores[class_name] = max(merged_scores.get(class_name, 0.0), float(probability) * 0.65)
    for disease_name, overlap_score in overlap_scores.items():
        merged_scores[disease_name] = merged_scores.get(disease_name, 0.0) + overlap_score * 0.35

    top_scores = sorted(merged_scores.items(), key=lambda item: item[1], reverse=True)[:6]
    query_set = set(symptom_keys)
    predictions = [build_prediction(disease_name, score, query_set) for disease_name, score in top_scores]

    return jsonify(
        {
            "predictions": predictions,
            "aiAnalysis": None,
            "model_metrics": catalog.get("metrics", {}),
        }
    ), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
