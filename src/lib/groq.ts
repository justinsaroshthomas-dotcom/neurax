import Groq from "groq-sdk";

// ─────────────────────────────────────────
// Groq AI Client (Singleton)
// ─────────────────────────────────────────

let groqClient: Groq | null = null;

function getGroqClient(): Groq | null {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.warn("[Groq] No GROQ_API_KEY — AI analysis disabled");
        return null;
    }

    if (!groqClient) {
        groqClient = new Groq({ apiKey });
    }
    return groqClient;
}

// ─────────────────────────────────────────
// AI Analysis Types
// ─────────────────────────────────────────

export interface AIAnalysis {
    summary: string;
    riskAssessment: string;
    recommendedActions: string[];
    disclaimer: string;
}

interface PredictionInput {
    disease: string;
    confidence: number;
    severity: string;
    matchedSymptoms: string[];
}

// ─────────────────────────────────────────
// Analyze Symptoms with Groq AI
// ─────────────────────────────────────────

export async function analyzeSymptoms(
    symptoms: string[],
    predictions: PredictionInput[]
): Promise<AIAnalysis | null> {
    const client = getGroqClient();
    if (!client) return null;

    const topPredictions = predictions.slice(0, 3);
    const predictionsContext = topPredictions
        .map(
            (p, i) =>
                `${i + 1}. ${p.disease} (${Math.round(p.confidence * 100)}% confidence, ${p.severity} severity) — matched symptoms: ${p.matchedSymptoms.join(", ")}`
        )
        .join("\n");

    const systemPrompt = `You are NeuraMed AI, a medical analysis assistant integrated into a disease prediction dashboard. Your role is to provide helpful, educational health information based on symptom analysis results.

IMPORTANT RULES:
- You are NOT a doctor. Always recommend consulting a healthcare professional.
- Provide clear, concise analysis in a professional medical tone.
- Be informative but cautious — never make definitive diagnoses.
- Focus on education and awareness.
- Keep responses structured and scannable.

Respond in this exact JSON format (no markdown, just raw JSON):
{
  "summary": "A 2-3 sentence overview of the symptom pattern and what the analysis suggests. Be specific about the symptom combinations and their clinical significance.",
  "riskAssessment": "A 1-2 sentence assessment of urgency level and whether immediate medical attention may be warranted.",
  "recommendedActions": ["Action 1", "Action 2", "Action 3", "Action 4"],
  "disclaimer": "This AI analysis is for educational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional for diagnosis and treatment."
}`;

    const userPrompt = `Analyze the following patient symptom report:

REPORTED SYMPTOMS: ${symptoms.join(", ")}

PREDICTION ENGINE RESULTS:
${predictionsContext}

Provide your AI analysis of this symptom pattern.`;

    try {
        const completion = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            temperature: 0.3,
            max_tokens: 600,
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
            console.warn("[Groq] Empty response from AI");
            return null;
        }

        const parsed = JSON.parse(content) as AIAnalysis;

        // Validate the response structure
        if (
            !parsed.summary ||
            !parsed.riskAssessment ||
            !Array.isArray(parsed.recommendedActions)
        ) {
            console.warn("[Groq] Invalid response structure:", parsed);
            return null;
        }

        // Always enforce the disclaimer
        parsed.disclaimer =
            "This AI analysis is for educational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional for diagnosis and treatment.";

        return parsed;
    } catch (err) {
        console.error("[Groq] AI analysis failed:", err);
        return null;
    }
}
