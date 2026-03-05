"use client";

import { useState } from "react";
import { SymptomPicker } from "@/components/prediction/SymptomPicker";
import { PredictionCard } from "@/components/prediction/PredictionCard";
import { ScanningAnimation } from "@/components/prediction/ScanningAnimation";
import { AIInsight } from "@/components/prediction/AIInsight";
import { addHistoryEntry } from "@/lib/history-store";
import type { AIAnalysis } from "@/lib/groq";

export interface PredictionResult {
    disease: string;
    confidence: number;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    precautions: string[];
    matchedSymptoms: string[];
}

interface PredictResponse {
    predictions: PredictionResult[];
    aiAnalysis: AIAnalysis | null;
    message?: string;
    error?: string;
}

export default function DashboardPage() {
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [predictions, setPredictions] = useState<PredictionResult[] | null>(null);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handlePredict = async () => {
        if (selectedSymptoms.length === 0) return;

        setIsAnalyzing(true);
        setError(null);
        setPredictions(null);
        setAiAnalysis(null);

        try {
            const res = await fetch("/api/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ symptoms: selectedSymptoms }),
            });

            if (!res.ok) {
                throw new Error(`Prediction failed: ${res.statusText}`);
            }

            const data: PredictResponse = await res.json();
            setPredictions(data.predictions);
            setAiAnalysis(data.aiAnalysis ?? null);

            // Auto-save to local history
            if (data.predictions.length > 0) {
                const top = data.predictions[0];
                addHistoryEntry({
                    symptoms: selectedSymptoms,
                    predictions: data.predictions.map((p) => ({
                        disease: p.disease,
                        confidence: p.confidence,
                        severity: p.severity,
                        matchedSymptoms: p.matchedSymptoms,
                    })),
                    topDisease: top.disease,
                    topConfidence: top.confidence,
                    topSeverity: top.severity,
                    aiSummary: data.aiAnalysis?.summary ?? null,
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
            console.error("[Predict]", err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleClear = () => {
        setSelectedSymptoms([]);
        setPredictions(null);
        setAiAnalysis(null);
        setError(null);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    <span className="neon-text">Disease</span>{" "}
                    <span className="text-foreground">Prediction</span>
                </h1>
                <p className="text-sm text-[var(--muted-foreground)]">
                    Select your symptoms below and let the AI engine analyze potential conditions.
                </p>
            </div>

            {/* Symptom Picker */}
            <SymptomPicker
                selectedSymptoms={selectedSymptoms}
                onSymptomsChange={setSelectedSymptoms}
            />

            {/* Action Bar */}
            <div className="flex items-center gap-4">
                <button
                    id="predict-button"
                    onClick={handlePredict}
                    disabled={selectedSymptoms.length === 0 || isAnalyzing}
                    className="relative px-8 py-3 rounded-xl font-semibold text-sm
            bg-[var(--neon)] text-[var(--cyber-bg)]
            hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none
            transition-all duration-300 active:scale-95
            flex items-center gap-2"
                >
                    {isAnalyzing ? (
                        <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                            </svg>
                            Analyze Symptoms
                        </>
                    )}
                </button>

                {selectedSymptoms.length > 0 && (
                    <button
                        onClick={handleClear}
                        className="px-6 py-3 rounded-xl font-medium text-sm
              neon-border text-[var(--muted-foreground)]
              hover:text-[var(--neon)] hover:bg-[rgba(0,240,255,0.03)]
              transition-all duration-300"
                    >
                        Clear All
                    </button>
                )}

                <div className="flex-1" />

                <span className="text-xs text-[var(--muted-foreground)] font-mono">
                    {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? "s" : ""} selected
                </span>
            </div>

            {/* Scanning Animation Overlay */}
            {isAnalyzing && <ScanningAnimation />}

            {/* Error */}
            {error && (
                <div className="p-4 rounded-xl neon-border bg-[rgba(255,62,108,0.05)] border-[rgba(255,62,108,0.3)]">
                    <p className="text-sm text-[var(--destructive)] flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>
                        {error}
                    </p>
                </div>
            )}

            {/* AI Insight Panel */}
            {aiAnalysis && <AIInsight analysis={aiAnalysis} />}

            {/* Prediction Results */}
            {predictions && predictions.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <svg className="w-5 h-5 text-[var(--neon)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.745 3.745 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                        </svg>
                        Analysis Results
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {predictions.map((prediction, i) => (
                            <PredictionCard
                                key={prediction.disease}
                                prediction={prediction}
                                rank={i + 1}
                                isTop={i === 0}
                            />
                        ))}
                    </div>
                </div>
            )}

            {predictions && predictions.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-[var(--muted-foreground)] text-sm">
                        No matching conditions found for the selected symptoms.
                    </p>
                </div>
            )}
        </div>
    );
}
