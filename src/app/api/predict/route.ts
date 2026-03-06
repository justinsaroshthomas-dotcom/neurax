import { NextRequest, NextResponse } from "next/server";
import { seedDiseases, seedSymptoms } from "@/db/seed";
import { analyzeSymptoms } from "@/lib/groq";

// ─────────────────────────────────────────
// POST /api/predict
// Body: { symptoms: string[] }
// Returns: { predictions: PredictionResult[], aiAnalysis: AIAnalysis | null }
// ─────────────────────────────────────────

interface PredictionResult {
    disease: string;
    confidence: number;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    precautions: string[];
    matchedSymptoms: string[];
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

        // Normalize input symptom names to lowercase for matching
        const inputSymptoms = symptoms.map((s) => s.toLowerCase().trim());

        // Build a lookup of valid symptom names
        const validSymptomNames = new Set(
            seedSymptoms.map((s) => s.name.toLowerCase())
        );

        // Filter to only known symptoms
        const matchedInputSymptoms = inputSymptoms.filter((s) =>
            validSymptomNames.has(s)
        );

        if (matchedInputSymptoms.length === 0) {
            return NextResponse.json({
                predictions: [],
                aiAnalysis: null,
                message: "No recognized symptoms provided.",
            });
        }

        // ── Prediction Engine ─────────────────
        // For each disease, calculate a weighted confidence score based on
        // how many of the user's symptoms match the disease's symptom list.
        const predictions: PredictionResult[] = [];

        for (const disease of seedDiseases) {
            // Map symptom IDs to names for this disease
            const diseaseSymptomEntries = disease.symptoms.map((ds) => {
                const symptom = seedSymptoms.find((s) => s.id === ds.symptomId);
                return {
                    name: symptom?.name.toLowerCase() || "",
                    weight: ds.weight,
                };
            });

            // Find matched symptoms
            const matched: string[] = [];
            let weightedScore = 0;
            let totalWeight = 0;

            for (const entry of diseaseSymptomEntries) {
                totalWeight += entry.weight;
                if (matchedInputSymptoms.includes(entry.name)) {
                    weightedScore += entry.weight;
                    // Get the original casing for display
                    const original = seedSymptoms.find(
                        (s) => s.name.toLowerCase() === entry.name
                    );
                    matched.push(original?.name || entry.name);
                }
            }

            if (matched.length === 0) continue;

            // Confidence = weighted match / total possible weight
            // Boosted slightly by the ratio of matched vs. user-provided symptoms
            const baseConfidence = totalWeight > 0 ? weightedScore / totalWeight : 0;
            const coverageBonus =
                matched.length / matchedInputSymptoms.length * 0.15;
            const confidence = Math.min(
                baseConfidence + coverageBonus,
                0.99
            );

            predictions.push({
                disease: disease.name,
                confidence: parseFloat(confidence.toFixed(3)),
                severity: disease.severity,
                description: disease.description,
                precautions: disease.precautions,
                matchedSymptoms: matched,
            });
        }

        // Sort by confidence (desc) and take top 6
        predictions.sort((a, b) => b.confidence - a.confidence);
        const topPredictions = predictions.slice(0, 6);

        // ── Run AI analysis + audit log in parallel (non-blocking) ──
        const [aiAnalysis] = await Promise.all([
            analyzeSymptoms(symptoms, topPredictions),
            // MongoDB audit log (best effort)
            logToMongoDB(symptoms, topPredictions).catch((err) =>
                console.warn("[Audit] MongoDB log failed:", err)
            ),
        ]);

        return NextResponse.json({
            predictions: topPredictions,
            aiAnalysis,
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
async function logToMongoDB(
    symptoms: string[],
    predictions: PredictionResult[]
) {
    if (!process.env.MONGODB_URI) return;

    try {
        const { connectMongoDB } = await import("@/lib/mongodb");
        const { PatientLog } = await import("@/db/patient-log");

        const conn = await connectMongoDB();
        if (!conn) return;

        const top = predictions[0];
        await PatientLog.create({
            userId: "anonymous", // Replace with Clerk userId when auth is wired
            symptoms,
            prediction: top
                ? {
                    disease: top.disease,
                    confidence: top.confidence,
                    severity: top.severity,
                }
                : { disease: "none", confidence: 0, severity: "low" },
            allPredictions: predictions.map((p) => ({
                disease: p.disease,
                confidence: p.confidence,
                severity: p.severity,
            })),
            metadata: {},
        });
    } catch (err) {
        console.warn("[Audit] Failed to log:", err);
    }
}
