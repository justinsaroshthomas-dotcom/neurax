import { NextRequest, NextResponse } from "next/server";
import { seedDiseases } from "@/db/seed";
import { loadCatalog, normalizeCatalogInputSymptoms, scoreCatalogPredictions } from "@/lib/catalog.server";
import { analyzeSymptoms } from "@/lib/groq";

interface PredictionResult {
    disease: string;
    confidence: number;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    precautions: string[];
    treatments: string[];
    matchedSymptoms: string[];
}

interface PredictionEngineResponse {
    predictions: PredictionResult[];
    aiAnalysis: Record<string, unknown> | null;
    model_metrics: Record<string, number>;
}

function normalizeDiseaseName(value: string): string {
    return value
        .normalize("NFKD")
        .replace(/[^\x00-\x7F]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9+\-/(),;:\n\r ]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\s+-\s+\d+$/, "")
        .replace(/-\d+$/, "");
}

async function predictWithMLServer(symptoms: string[]): Promise<PredictionEngineResponse | null> {
    try {
        const res = await fetch("http://localhost:5000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symptoms }),
            signal: AbortSignal.timeout(3000),
        });
        if (!res.ok) {
            return null;
        }
        return (await res.json()) as PredictionEngineResponse;
    } catch {
        return null;
    }
}

function enrichPredictions(predictions: PredictionResult[]): PredictionResult[] {
    const seedLookup = new Map(
        seedDiseases.map((disease) => [normalizeDiseaseName(disease.name), disease])
    );

    return predictions.map((prediction) => {
        const seedDisease = seedLookup.get(normalizeDiseaseName(prediction.disease));
        if (!seedDisease) {
            return prediction;
        }

        return {
            ...prediction,
            description: prediction.description || seedDisease.description,
            precautions:
                prediction.precautions.length > 0
                    ? prediction.precautions
                    : seedDisease.precautions,
            treatments:
                prediction.treatments.length > 0
                    ? prediction.treatments
                    : seedDisease.treatments,
        };
    });
}

async function predictWithCatalog(symptoms: string[]): Promise<PredictionResult[]> {
    const catalog = await loadCatalog();
    const normalizedSymptoms = normalizeCatalogInputSymptoms(symptoms, catalog);
    if (normalizedSymptoms.length === 0) {
        return [];
    }

    return scoreCatalogPredictions(normalizedSymptoms, catalog);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { symptoms } = body as { symptoms: string[] };

        if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
            return NextResponse.json(
                { error: "Please provide at least one symptom." },
                { status: 400 }
            );
        }

        const mlResult = await predictWithMLServer(symptoms);
        if (mlResult && mlResult.predictions.length > 0) {
            return NextResponse.json({
                predictions: enrichPredictions(mlResult.predictions),
                aiAnalysis: mlResult.aiAnalysis,
                mlMetrics: mlResult.model_metrics,
                source: "ml_model",
            });
        }

        const topPredictions = enrichPredictions(await predictWithCatalog(symptoms));
        const aiAnalysis = await analyzeSymptoms(symptoms, topPredictions);

        logToMongoDB(symptoms, topPredictions).catch(() => {});

        return NextResponse.json({
            predictions: topPredictions,
            aiAnalysis,
            source: "catalog_overlap",
        });
    } catch (err) {
        console.error("[Predict API] Error:", err);
        return NextResponse.json(
            { error: "Internal server error during prediction." },
            { status: 500 }
        );
    }
}

async function logToMongoDB(symptoms: string[], predictions: PredictionResult[]) {
    if (!process.env.MONGODB_URI) {
        return;
    }

    try {
        const { connectMongoDB } = await import("@/lib/mongodb");
        const { PatientLog } = await import("@/db/patient-log");
        const conn = await connectMongoDB();
        if (!conn) {
            return;
        }

        const top = predictions[0];
        await PatientLog.create({
            userId: "anonymous",
            symptoms,
            prediction: top
                ? { disease: top.disease, confidence: top.confidence, severity: top.severity }
                : { disease: "none", confidence: 0, severity: "low" },
            allPredictions: predictions.map((prediction) => ({
                disease: prediction.disease,
                confidence: prediction.confidence,
                severity: prediction.severity,
            })),
            metadata: {},
        });
    } catch (err) {
        console.warn("[Audit] Failed to log:", err);
    }
}
