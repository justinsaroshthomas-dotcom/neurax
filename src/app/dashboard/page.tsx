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

    const handleNewAnalysis = () => {
        setSelectedSymptoms([]);
        setPredictions(null);
        setAiAnalysis(null);
        setError(null);
    };

    const hasResults = predictions !== null;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header — always visible */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">
                    <span className="neon-text">Symptom</span>{" "}
                    <span className="text-foreground">Checker</span>
                </h1>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    {hasResults
                        ? "Here are your results based on the symptoms you selected."
                        : "Select your symptoms, then tap Analyze."
                    }
                </p>
            </div>

            {/* ── STEP 1: Select Symptoms ── */}
            {!hasResults && !isAnalyzing && (
                <div className="space-y-6">
                    <SymptomPicker
                        selectedSymptoms={selectedSymptoms}
                        onSymptomsChange={setSelectedSymptoms}
                    />

                    {/* Analyze Button — prominent, centered */}
                    <div className="flex flex-col items-center gap-3 pt-2">
                        <button
                            id="predict-button"
                            onClick={handlePredict}
                            disabled={selectedSymptoms.length === 0}
                            className="w-full max-w-xs px-8 py-4 rounded-2xl font-semibold text-base
                                bg-[var(--neon)] text-[var(--cyber-bg)]
                                hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]
                                disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none
                                transition-all duration-300 active:scale-[0.98]
                                flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                            Analyze {selectedSymptoms.length > 0 ? `(${selectedSymptoms.length})` : ""}
                        </button>
                        {selectedSymptoms.length === 0 && (
                            <p className="text-xs text-[var(--muted-foreground)]">
                                Select at least one symptom above
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* ── STEP 2: Analyzing ── */}
            {isAnalyzing && <ScanningAnimation />}

            {/* ── STEP 3: Results ── */}
            {hasResults && (
                <div className="space-y-6">
                    {/* Error */}
                    {error && (
                        <div className="p-4 rounded-xl bg-[rgba(255,62,108,0.05)] border border-[rgba(255,62,108,0.3)]">
                            <p className="text-sm text-[var(--destructive)]">{error}</p>
                        </div>
                    )}

                    {/* AI Insight */}
                    {aiAnalysis && <AIInsight analysis={aiAnalysis} />}

                    {/* Prediction Cards */}
                    {predictions && predictions.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                                Possible Conditions
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
                        <div className="text-center py-12 rounded-2xl neon-border bg-[var(--cyber-surface)]">
                            <p className="text-[var(--muted-foreground)]">
                                No matching conditions found.
                            </p>
                        </div>
                    )}

                    {/* New Analysis Button */}
                    <div className="flex justify-center pt-4">
                        <button
                            onClick={handleNewAnalysis}
                            className="px-8 py-3 rounded-2xl text-sm font-medium
                                neon-border text-[var(--neon)]
                                hover:bg-[rgba(0,240,255,0.05)]
                                transition-all duration-300 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                            </svg>
                            Start New Analysis
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
