"use client";

import { useState } from "react";
import { SymptomPicker } from "@/components/prediction/SymptomPicker";
import { PredictionCard } from "@/components/prediction/PredictionCard";
import { ScanningAnimation } from "@/components/prediction/ScanningAnimation";
import { AIInsight } from "@/components/prediction/AIInsight";
import { ImageScanner } from "@/components/prediction/ImageScanner";
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
    const [mode, setMode] = useState<"symptoms" | "imaging">("symptoms");
    const [visionResult, setVisionResult] = useState<any | null>(null);

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

    const handleVisionComplete = (result: any) => {
        setVisionResult(result);
        
        // Map vision result to general prediction format for UI consistency
        const mappedPrediction: PredictionResult = {
            disease: result.prediction,
            confidence: result.confidence,
            severity: "high", // Default for detected anomalies
            description: result.findings,
            precautions: result.solutions,
            matchedSymptoms: ["Imaging Analysis"]
        };
        
        setPredictions([mappedPrediction]);
        
        setAiAnalysis({
            summary: result.findings,
            riskAssessment: "Based on local CNN analysis of the clinical scan.",
            recommendedActions: result.solutions,
            disclaimer: "Local Vision Engine analysis. Precision: " + (result.metrics.precision * 100).toFixed(1) + "%"
        });

        // Save to history
        addHistoryEntry({
            symptoms: ["Clinical Scan: " + result.prediction],
            predictions: [mappedPrediction],
            topDisease: result.prediction,
            topConfidence: result.confidence,
            topSeverity: "high",
            aiSummary: result.findings
        });
    };

    const handleNewAnalysis = () => {
        setSelectedSymptoms([]);
        setPredictions(null);
        setAiAnalysis(null);
        setVisionResult(null);
        setError(null);
    };

    const hasResults = predictions !== null;

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-1000">
            {/* Header — always visible */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tighter">
                        <span className="text-primary drop-shadow-[0_0_8px_var(--neon-dim)]">Multimodal</span>{" "}
                        <span className="text-slate-900 dark:text-slate-100">Intelligence</span>
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-500 font-medium">
                        {hasResults
                            ? "Neural analysis complete. Review your clinical profile below."
                            : mode === "symptoms" 
                                ? "Input your symptoms for a high-precision medical analysis."
                                : "Upload medical scans for advanced visual diagnostic overrides."
                        }
                    </p>
                </div>

                {!hasResults && !isAnalyzing && (
                    <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <button
                            onClick={() => setMode("symptoms")}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                                ${mode === "symptoms" ? "bg-primary text-white shadow-lg" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            Clinical Text
                        </button>
                        <button
                            onClick={() => setMode("imaging")}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                                ${mode === "imaging" ? "bg-primary text-white shadow-lg" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            Visual Imaging
                        </button>
                    </div>
                )}

                {hasResults && (
                    <button
                        onClick={handleNewAnalysis}
                        className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest
                            bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400
                            border border-slate-200 dark:border-slate-800
                            hover:bg-primary/10 hover:text-primary hover:border-primary/20
                            transition-all duration-300 flex items-center gap-2 shadow-sm"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        New Analysis
                    </button>
                )}
            </div>

            {/* ── STEP 1: Input (Symptoms or Imaging) ── */}
            {!hasResults && (
                <div className="space-y-10">
                    {isAnalyzing ? (
                        <div className="py-20 flex flex-col items-center justify-center animate-in fade-in duration-700">
                             <ScanningAnimation />
                             <p className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse">
                                Neural Pattern Recognition in Progress...
                             </p>
                        </div>
                    ) : (
                        mode === "symptoms" ? (
                            <>
                                <SymptomPicker
                                    selectedSymptoms={selectedSymptoms}
                                    onSymptomsChange={setSelectedSymptoms}
                                />

                                <div className="flex flex-col items-center gap-4 pt-4">
                                    <button
                                        id="predict-button"
                                        onClick={handlePredict}
                                        disabled={selectedSymptoms.length === 0}
                                        className="group relative w-full max-w-sm px-8 py-5 rounded-2xl font-black text-lg uppercase tracking-widest
                                            bg-gradient-to-br from-primary to-primary/80 text-white
                                            shadow-[0_4px_20px_rgba(0,177,64,0.3)] hover:shadow-[0_8px_30px_rgba(0,177,64,0.5)]
                                            dark:shadow-[0_4px_20px_rgba(0,177,64,0.15)] dark:hover:shadow-[0_8px_40px_rgba(0,177,64,0.3)]
                                            disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:shadow-none
                                            transition-all duration-300 active:scale-[0.97]
                                            flex items-center justify-center gap-3 overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                        <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                        </svg>
                                        Run Analysis {selectedSymptoms.length > 0 ? `[${selectedSymptoms.length}]` : ""}
                                    </button>
                                    {selectedSymptoms.length === 0 ? (
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 animate-pulse">
                                            Awaiting Symptom Input
                                        </p>
                                    ) : (
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">
                                            Ready for Neural Processing
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <ImageScanner 
                                onAnalysisComplete={handleVisionComplete}
                                onScanningStateChange={setIsAnalyzing}
                                onError={setError}
                            />
                        )
                    )}
                </div>
            )}

            {/* Remove old standalone analyzing block below */}

            {/* ── STEP 3: Results ── */}
            {hasResults && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    {/* Error */}
                    {error && (
                        <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20 glass-card">
                            <p className="text-sm font-bold text-red-500 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                </svg>
                                {error}
                            </p>
                        </div>
                    )}

                    {/* AI Insight */}
                    {aiAnalysis && <AIInsight analysis={aiAnalysis} />}

                    {/* Prediction Cards */}
                    {predictions && predictions.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">
                                    {mode === "imaging" ? "Imaging Analytics" : "Clinical Correlations"}
                                </h2>
                                <div className="flex-1 h-px bg-slate-200/50 dark:bg-slate-800/50" />
                            </div>
                            
                            {/* V5.0 Imaging Results Display */}
                            {mode === "imaging" && visionResult && (
                                <div className="space-y-6 pb-6">
                                    {/* Primary Metrics */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: "Accuracy", value: (visionResult.metrics.accuracy * 100).toFixed(1) + "%" },
                                            { label: "Precision", value: (visionResult.metrics.precision * 100).toFixed(1) + "%" },
                                            { label: "Recall", value: (visionResult.metrics.recall * 100).toFixed(1) + "%" },
                                            { label: "F1 Score", value: visionResult.metrics.f1 ? (visionResult.metrics.f1 * 100).toFixed(1) + "%" : "–" },
                                        ].map((m) => (
                                            <div key={m.label} className="p-5 rounded-2xl neon-border glass-card flex flex-col items-center justify-center space-y-1">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{m.label}</p>
                                                <p className="text-2xl font-black italic text-primary">{m.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Model Provenance */}
                                    <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Model Provenance</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Architecture</p>
                                                <p className="text-xs font-black text-primary">{visionResult.model_type || "CNN"}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Training Dataset</p>
                                                <p className="text-xs font-black text-slate-700 dark:text-slate-200">{visionResult.dataset || "Kaggle Medical Imaging"}</p>
                                            </div>
                                        </div>
                                        {visionResult.description && (
                                            <p className="text-[10px] text-slate-500 font-bold leading-relaxed pt-2 border-t border-slate-200 dark:border-slate-800 mt-2">
                                                {visionResult.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Probability Distribution */}
                                    {visionResult.all_probabilities && (
                                        <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">Class Probability Distribution</p>
                                            <div className="space-y-3">
                                                {Object.entries(visionResult.all_probabilities as Record<string, number>)
                                                    .sort(([, a], [, b]) => b - a)
                                                    .map(([cls, prob]) => (
                                                        <div key={cls} className="space-y-1">
                                                            <div className="flex justify-between items-center">
                                                                <span className={`text-[10px] font-black ${cls === visionResult.prediction ? "text-primary" : "text-slate-600 dark:text-slate-400"}`}>
                                                                    {cls === visionResult.prediction && "→ "}{cls}
                                                                </span>
                                                                <span className="text-[10px] font-black text-slate-500">{(prob * 100).toFixed(1)}%</span>
                                                            </div>
                                                            <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-700 ${cls === visionResult.prediction ? "bg-primary" : "bg-slate-400 dark:bg-slate-600"}`}
                                                                    style={{ width: `${prob * 100}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Image Quality Indicators */}
                                    {visionResult.image_quality && (
                                        <div className="grid grid-cols-3 gap-3">
                                            {Object.entries(visionResult.image_quality as Record<string, number>).map(([k, v]) => (
                                                <div key={k} className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-center">
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">{k}</p>
                                                    <p className="text-sm font-black text-slate-700 dark:text-slate-200">{v.toFixed(1)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Clinical Solutions */}
                                    {visionResult.solutions && visionResult.solutions.length > 0 && (
                                        <div className="p-5 rounded-2xl neon-border glass-card">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">Clinical Action Protocol</p>
                                            <ul className="space-y-3">
                                                {visionResult.solutions.map((s: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-3">
                                                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[9px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            {i + 1}
                                                        </span>
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{s}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                        <div className="text-center py-20 rounded-3xl neon-border glass-card border-dashed">
                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-700">
                                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">No Matching Conditions</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                Our engine couldn't correlate your current symptom profile with known disease patterns.
                            </p>
                        </div>
                    )}

                    {/* Bottom Action */}
                    <div className="flex flex-col items-center gap-4 pt-6">
                        <button
                            onClick={handleNewAnalysis}
                            className="group px-10 py-4 rounded-2xl text-sm font-black uppercase tracking-widest
                                neon-border glass-card text-primary
                                hover:bg-primary/5 hover:border-primary/40
                                transition-all duration-300 flex items-center gap-3 shadow-md"
                        >
                            <svg className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                            </svg>
                            Reset System Data
                        </button>
                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                            Session ID: {Math.random().toString(36).substring(7).toUpperCase()}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
