import { NextRequest, NextResponse } from "next/server";
import { seedDiseases, seedSymptoms } from "@/db/seed";
import { analyzeSymptoms } from "@/lib/groq";

// ─────────────────────────────────────────
// POST /api/predict
// Tries Python ML server first (localhost:5000),
// falls back to seed-based weighted matching.
// ─────────────────────────────────────────

interface PredictionResult {
    disease: string;
    confidence: number;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    precautions: string[];
    matchedSymptoms: string[];
}

// ── Try Python ML Server ──────────────────

async function predictWithMLServer(symptoms: string[]): Promise<{
    predictions: PredictionResult[];
    aiAnalysis: Record<string, unknown>;
    model_metrics: Record<string, number>;
} | null> {
    try {
        const res = await fetch("http://localhost:5000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symptoms }),
            signal: AbortSignal.timeout(3000),
        });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null; // ML server not running — use fallback
    }
}

// ── Seed-based Prediction (Fallback) ──────

function predictWithSeedData(symptoms: string[]): PredictionResult[] {
    const inputSymptoms = symptoms.map((s) => s.toLowerCase().trim());
    const validSymptomNames = new Set(seedSymptoms.map((s) => s.name.toLowerCase()));
    const matchedInputSymptoms = inputSymptoms.filter((s) => validSymptomNames.has(s));

    if (matchedInputSymptoms.length === 0) return [];

    const predictions: PredictionResult[] = [];

    for (const disease of seedDiseases) {
        const diseaseSymptomEntries = disease.symptoms.map((ds) => {
            const symptom = seedSymptoms.find((s) => s.id === ds.symptomId);
            return { name: symptom?.name.toLowerCase() || "", weight: ds.weight };
        });

        const matched: string[] = [];
        let weightedScore = 0;
        let totalWeight = 0;

        for (const entry of diseaseSymptomEntries) {
            totalWeight += entry.weight;
            if (matchedInputSymptoms.includes(entry.name)) {
                weightedScore += entry.weight;
                const original = seedSymptoms.find((s) => s.name.toLowerCase() === entry.name);
                matched.push(original?.name || entry.name);
            }
        }

        if (matched.length === 0) continue;

        const baseConfidence = totalWeight > 0 ? weightedScore / totalWeight : 0;
        const coverageBonus = matched.length / matchedInputSymptoms.length * 0.15;
        const confidence = Math.min(baseConfidence + coverageBonus, 0.99);

        predictions.push({
            disease: disease.name,
            confidence: parseFloat(confidence.toFixed(3)),
            severity: disease.severity,
            description: disease.description,
            precautions: disease.precautions,
            matchedSymptoms: matched,
        });
    }

    predictions.sort((a, b) => b.confidence - a.confidence);
    return predictions.slice(0, 6);
}

// ── Main Handler ──────────────────────────

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

        // Try ML server first
        const mlResult = await predictWithMLServer(symptoms);

        if (mlResult && mlResult.predictions.length > 0) {
            // Enrich ML predictions with seed descriptions/precautions
            for (const pred of mlResult.predictions) {
                const seedDisease = seedDiseases.find(
                    (d) => d.name.toLowerCase() === pred.disease.toLowerCase()
                );
                if (seedDisease) {
                    pred.description = pred.description || seedDisease.description;
                    pred.precautions =
                        pred.precautions.length > 0 ? pred.precautions : seedDisease.precautions;
                }
            }

            return NextResponse.json({
                predictions: mlResult.predictions,
                aiAnalysis: mlResult.aiAnalysis,
                mlMetrics: mlResult.model_metrics,
                source: "ml_model",
            });
        }

        // Fallback to seed-based prediction
        const topPredictions = predictWithSeedData(symptoms);
        const aiAnalysis = await analyzeSymptoms(symptoms, topPredictions);

        // Background audit log (best effort)
        logToMongoDB(symptoms, topPredictions).catch(() => { });

        return NextResponse.json({
            predictions: topPredictions,
            aiAnalysis,
            source: "seed_engine",
        });
    } catch (err) {
        console.error("[Predict API] Error:", err);
        return NextResponse.json(
            { error: "Internal server error during prediction." },
            { status: 500 }
        );
    }
}

// ── Background audit logging ──────────────
async function logToMongoDB(symptoms: string[], predictions: PredictionResult[]) {
    if (!process.env.MONGODB_URI) return;
    try {
        const { connectMongoDB } = await import("@/lib/mongodb");
        const { PatientLog } = await import("@/db/patient-log");
        const conn = await connectMongoDB();
        if (!conn) return;
        const top = predictions[0];
        await PatientLog.create({
            userId: "anonymous",
            symptoms,
            prediction: top
                ? { disease: top.disease, confidence: top.confidence, severity: top.severity }
                : { disease: "none", confidence: 0, severity: "low" },
            allPredictions: predictions.map((p) => ({
                disease: p.disease, confidence: p.confidence, severity: p.severity,
            })),
            metadata: {},
        });
    } catch (err) {
        console.warn("[Audit] Failed to log:", err);
    }
}
