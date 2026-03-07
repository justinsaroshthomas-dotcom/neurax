import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { module, imageB64, mediaType } = await req.json();

    if (!imageB64 || !module) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const systemPrompt = `You are NeuraMed v5.0 Vision Core — a professional medical imaging AI. Analyze the uploaded medical scan and respond ONLY with a valid JSON object (no markdown, no backticks, no extra text). The JSON must follow this exact schema:

{
  "predicted_class": "<one of the module classes exactly>",
  "confidence": <number 0-100>,
  "urgency": "<critical|warning|normal|info>",
  "probabilities": [
    {"class": "<class name>", "probability": <number 0-100>}
  ],
  "clinical_note": "<2-3 sentence radiological impression>",
  "imaging_features": ["<feature 1>", "<feature 2>"],
  "action": "<one-sentence recommended clinical action>",
  "time_sensitivity": "<null or string if urgent time window>",
  "extra": {
    "icd10": "<code or null>",
    "cdr_score": "<score or null>",
    "rt_pcr": "<recommendation or null>",
    "affected_levels": ["<level>" or null]
  }
}

Module context: ${module.prompt}
Classes available: ${module.classes.join(", ")}

Be clinically precise. Confidence should reflect genuine image analysis. Urgency mapping: critical=life-threatening, warning=needs prompt attention, normal=no significant pathology, info=mild findings.
IMPORTANT: You MUST return ONLY valid JSON. Start with { and end with }. Do not include \`\`\`json or any conversational text.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: `Analyze this ${module.modality} scan using the ${module.label} module and return the JSON report.` },
            {
              type: "image_url",
              image_url: { url: `data:${mediaType};base64,${imageB64}` }
            }
          ],
        },
      ],
      model: "llama-3.2-90b-vision-preview",
      temperature: 0.1,
      max_tokens: 1024,
    });

    const content = chatCompletion.choices[0]?.message?.content || "{}";
    
    // Attempt to parse and clean
    const cleanJson = content.replace(/```json|```/gi, "").trim();
    const result = JSON.parse(cleanJson);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Vision API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
