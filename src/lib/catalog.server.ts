import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { seedDiseases, seedSymptoms } from "@/db/seed";
import type {
    CatalogData,
    CatalogDisease,
    CatalogDiseaseSymptom,
    CatalogSummary,
    Severity,
} from "@/lib/catalog-types";

const GENERATED_CATALOG_PATH = path.join(process.cwd(), "ml", "generated", "catalog.json");
const GENERATED_MODEL_META_PATH = path.join(process.cwd(), "ml", "generated", "model_meta.json");

let cachedCatalog: CatalogData | null = null;
let cachedCatalogMtimeMs = -1;
let cachedModelMetaMtimeMs = -1;

function normalizeTerm(value: string): string {
    return value
        .normalize("NFKD")
        .replace(/[^\x00-\x7F]/g, "")
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9+\-/(),;:\n\r ]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/^[,;: ]+|[,;: ]+$/g, "");
}

function normalizeDiseaseName(value: string): string {
    return normalizeTerm(value).replace(/\s+-\s+\d+$/, "").replace(/-\d+$/, "");
}

function dedupe<T>(values: T[]): T[] {
    return Array.from(new Set(values));
}

function buildLegacyCatalog(): CatalogData {
    const coreSymptoms = seedSymptoms.map((symptom) => ({
        id: symptom.id,
        key: normalizeTerm(symptom.name),
        name: symptom.name,
        category: symptom.category,
        aliases: [normalizeTerm(symptom.name)],
        source: "core" as const,
    }));

    const symptomById = new Map(seedSymptoms.map((symptom) => [symptom.id, symptom]));
    const diseases: CatalogDisease[] = seedDiseases.map((disease) => ({
        id: disease.id,
        key: normalizeDiseaseName(disease.name),
        name: disease.name,
        aliases: [normalizeDiseaseName(disease.name)],
        severity: disease.severity,
        description: disease.description,
        precautions: disease.precautions,
        treatments: disease.treatments,
        rowCount: 1,
        symptoms: disease.symptoms
            .map((entry): CatalogDiseaseSymptom | null => {
                const symptom = symptomById.get(entry.symptomId);
                if (!symptom) {
                    return null;
                }
                return {
                    key: normalizeTerm(symptom.name),
                    name: symptom.name,
                    weight: entry.weight,
                    source: "core",
                };
            })
            .filter((entry): entry is CatalogDiseaseSymptom => entry !== null),
    }));

    return {
        generatedAt: new Date(0).toISOString(),
        counts: {
            diseases: diseases.length,
            coreSymptoms: coreSymptoms.length,
            extendedSymptoms: 0,
            rows: diseases.length,
        },
        coreSymptoms,
        extendedSymptoms: [],
        symptomAliases: Object.fromEntries(coreSymptoms.map((symptom) => [symptom.key, symptom.key])),
        diseases,
        diseaseInfo: Object.fromEntries(
            diseases.map((disease) => [
                disease.name,
                {
                    severity: disease.severity,
                    symptoms: disease.symptoms.slice(0, 10).map((symptom) => symptom.name),
                },
            ])
        ),
        metrics: {
            accuracy: 0,
            precision: 0,
            recall: 0,
            f1: 0,
            top3: 0,
            top5: 0,
        },
    };
}

async function readGeneratedMetrics(): Promise<CatalogData["metrics"] | null> {
    try {
        const file = await fs.readFile(GENERATED_MODEL_META_PATH, "utf-8");
        const parsed = JSON.parse(file) as { metrics?: CatalogData["metrics"] };
        return parsed.metrics ?? null;
    } catch {
        return null;
    }
}

function mergeCatalogMetrics(
    catalog: CatalogData,
    generatedMetrics: CatalogData["metrics"] | null
): CatalogData {
    const mergedMetrics = generatedMetrics
        ? {
            accuracy: catalog.metrics?.accuracy ?? generatedMetrics.accuracy ?? 0,
            precision: catalog.metrics?.precision ?? generatedMetrics.precision ?? 0,
            recall: catalog.metrics?.recall ?? generatedMetrics.recall ?? 0,
            f1: catalog.metrics?.f1 ?? generatedMetrics.f1 ?? 0,
            top3: catalog.metrics?.top3 ?? generatedMetrics.top3 ?? 0,
            top5: catalog.metrics?.top5 ?? generatedMetrics.top5 ?? 0,
        }
        : catalog.metrics;

    return {
        ...catalog,
        metrics: mergedMetrics,
    };
}

function enrichGeneratedCatalog(catalog: CatalogData): CatalogData {
    const seedDiseaseMap = new Map(
        seedDiseases.map((disease) => [normalizeDiseaseName(disease.name), disease])
    );
    const seedSymptomMap = new Map(
        seedSymptoms.map((symptom) => [normalizeTerm(symptom.name), symptom])
    );

    const coreSymptoms = catalog.coreSymptoms.map((symptom) => {
        const seedSymptom = seedSymptomMap.get(symptom.key);
        return {
            ...symptom,
            category: seedSymptom?.category ?? symptom.category ?? "General",
            aliases: dedupe([symptom.key, symptom.name.toLowerCase(), ...symptom.aliases]),
        };
    });

    const extendedSymptoms = catalog.extendedSymptoms.map((symptom) => ({
        ...symptom,
        category: symptom.category || "Extended Library",
        aliases: dedupe([symptom.key, symptom.name.toLowerCase(), ...symptom.aliases]),
    }));

    const diseases = catalog.diseases.map((disease) => {
        const seedDisease = seedDiseaseMap.get(normalizeDiseaseName(disease.name));
        return {
            ...disease,
            aliases: dedupe([normalizeDiseaseName(disease.name), ...disease.aliases]),
            severity: disease.severity || (seedDisease?.severity as Severity | undefined) || "medium",
            description: disease.description || seedDisease?.description || "",
            precautions:
                disease.precautions.length > 0
                    ? disease.precautions
                    : seedDisease?.precautions ?? [],
            treatments: dedupe([
                ...disease.treatments,
                ...(seedDisease?.treatments ?? []),
            ]).slice(0, 8),
        };
    });

    return {
        ...catalog,
        coreSymptoms,
        extendedSymptoms,
        diseases,
        diseaseInfo: Object.fromEntries(
            diseases.map((disease) => [
                disease.name,
                {
                    severity: disease.severity,
                    symptoms: disease.symptoms.slice(0, 10).map((symptom) => symptom.name),
                },
            ])
        ),
    };
}

export async function loadCatalog(): Promise<CatalogData> {
    try {
        const [catalogStat, modelMetaStat] = await Promise.all([
            fs.stat(GENERATED_CATALOG_PATH),
            fs.stat(GENERATED_MODEL_META_PATH).catch(() => null),
        ]);

        if (
            cachedCatalog &&
            cachedCatalogMtimeMs === catalogStat.mtimeMs &&
            cachedModelMetaMtimeMs === (modelMetaStat?.mtimeMs ?? -1)
        ) {
            return cachedCatalog;
        }

        const [catalogFile, generatedMetrics] = await Promise.all([
            fs.readFile(GENERATED_CATALOG_PATH, "utf-8"),
            readGeneratedMetrics(),
        ]);
        const parsed = JSON.parse(catalogFile) as CatalogData;
        cachedCatalog = enrichGeneratedCatalog(mergeCatalogMetrics(parsed, generatedMetrics));
        cachedCatalogMtimeMs = catalogStat.mtimeMs;
        cachedModelMetaMtimeMs = modelMetaStat?.mtimeMs ?? -1;
        return cachedCatalog;
    } catch {
        cachedCatalog = buildLegacyCatalog();
        cachedCatalogMtimeMs = -1;
        cachedModelMetaMtimeMs = -1;
    }

    return cachedCatalog;
}

export async function loadCatalogSummary(): Promise<CatalogSummary> {
    const catalog = await loadCatalog();
    return {
        generatedAt: catalog.generatedAt,
        counts: catalog.counts,
        metrics: catalog.metrics,
    };
}

export function normalizeCatalogInputSymptoms(symptoms: string[], catalog: CatalogData): string[] {
    const symptomNameMap = new Map(
        [...catalog.coreSymptoms, ...catalog.extendedSymptoms].map((symptom) => [
            normalizeTerm(symptom.name),
            symptom.key,
        ])
    );

    const normalized: string[] = [];
    for (const symptom of symptoms) {
        const term = normalizeTerm(symptom);
        const key = catalog.symptomAliases[term] ?? symptomNameMap.get(term);
        if (key && !normalized.includes(key)) {
            normalized.push(key);
        }
    }
    return normalized;
}

export function scoreCatalogPredictions(symptomKeys: string[], catalog: CatalogData) {
    const querySet = new Set(symptomKeys);
    const predictions = catalog.diseases
        .map((disease) => {
            const matched = disease.symptoms.filter((symptom) => querySet.has(symptom.key));
            if (matched.length === 0) {
                return null;
            }

            const totalWeight =
                disease.symptoms.reduce((sum, symptom) => sum + symptom.weight, 0) || 1;
            const matchedWeight = matched.reduce((sum, symptom) => sum + symptom.weight, 0);
            const coverage = matched.length / Math.max(querySet.size, 1);
            const confidence = Math.min(0.99, matchedWeight / totalWeight * 0.75 + coverage * 0.25);

            return {
                disease: disease.name,
                confidence: Number(confidence.toFixed(4)),
                severity: disease.severity,
                description: disease.description,
                precautions: disease.precautions,
                treatments: disease.treatments,
                matchedSymptoms: matched.map((symptom) => symptom.name),
            };
        })
        .filter(
            (
                prediction
            ): prediction is {
                disease: string;
                confidence: number;
                severity: Severity;
                description: string;
                precautions: string[];
                treatments: string[];
                matchedSymptoms: string[];
            } => prediction !== null
        )
        .sort((left, right) => right.confidence - left.confidence)
        .slice(0, 6);

    return predictions;
}
