"use client";

import { useState } from "react";
import { SymptomPicker } from "@/components/prediction/SymptomPicker";
import { addHistoryEntry } from "@/lib/history-store";
import type { AIAnalysis } from "@/lib/groq";
import { Activity, Beaker, FileText, HeartPulse, Stethoscope, UploadCloud } from "lucide-react";

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

            if (data.predictions.length > 0) {
                const top = data.predictions[0];
                addHistoryEntry({
                    symptoms: selectedSymptoms,
                    predictions: data.predictions,
                    topDisease: top.disease,
                    topConfidence: top.confidence,
                    topSeverity: top.severity,
                    aiSummary: data.aiAnalysis?.summary ?? null,
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const topPrediction = predictions?.[0];

    return (
        <div className="flex gap-8 max-w-[1200px] mx-auto animate-in fade-in duration-700">
            {/* Left Column (Main Data) */}
            <div className="flex-1 flex flex-col gap-6">
                {!predictions && (
                    <div className="bg-white rounded-[2rem] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col gap-8">
                        <div>
                            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Clinical Diagnosis Input</h2>
                            <p className="text-slate-500 font-medium text-sm">Select patient symptoms to run the predictive disease model.</p>
                        </div>
                        
                        <SymptomPicker
                            selectedSymptoms={selectedSymptoms}
                            onSymptomsChange={setSelectedSymptoms}
                        />

                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={handlePredict}
                                disabled={selectedSymptoms.length === 0 || isAnalyzing}
                                className="px-8 py-4 bg-[#7B61FF] text-white rounded-2xl font-bold uppercase tracking-widest text-sm shadow-[0_8px_20px_rgba(123,97,255,0.3)] hover:shadow-[0_12px_24px_rgba(123,97,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                            >
                                {isAnalyzing ? "Processing..." : "Run Analysis"}
                                {!isAnalyzing && <Activity className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isAnalyzing && (
                    <div className="bg-white rounded-[2rem] p-24 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col items-center justify-center gap-6">
                        <div className="w-16 h-16 border-4 border-[#7B61FF]/20 border-t-[#7B61FF] rounded-full animate-spin" />
                        <p className="text-[#1A1A1A] font-bold text-lg">Analyzing Neural Clinical Pathways...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !isAnalyzing && (
                    <div className="bg-red-50 text-red-600 rounded-2xl p-6 font-medium border border-red-100">
                        Error: {error}
                    </div>
                )}

                {/* Results - Highlights Card */}
                {topPrediction && !isAnalyzing && (
                    <div className="bg-white rounded-[2rem] p-10 shadow-[0_8px_32px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden flex flex-col lg:flex-row gap-8">
                        {/* Background illustration gradient */ }
                        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#7B61FF]/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <div className="flex-1 space-y-8 z-10">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                                    <span className="text-slate-400">Highlights</span>
                                    <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                    <span className="text-[#FF4D6D]">{topPrediction.severity.toUpperCase()} PRIORITY</span>
                                </div>
                                <h2 className="text-5xl font-extrabold text-[#1A1A1A] tracking-tighter">
                                    {topPrediction.disease}
                                </h2>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-3">
                                {topPrediction.matchedSymptoms.slice(0, 2).map((sym) => (
                                    <span key={sym} className="px-4 py-2 rounded-full bg-[#7B61FF]/10 text-[#7B61FF] font-bold text-xs uppercase tracking-wider">
                                        {sym}
                                    </span>
                                ))}
                                <span className="px-4 py-2 rounded-full bg-[#FF4D6D] text-white font-bold text-xs uppercase tracking-wider shadow-sm">
                                    {Math.round(topPrediction.confidence * 100)}% Confidence
                                </span>
                                <span className="px-4 py-2 rounded-full bg-[#FFD166]/20 text-[#d9aa34] font-bold text-xs uppercase tracking-wider">
                                    {topPrediction.severity} Risk
                                </span>
                            </div>

                            <div className="space-y-6 pt-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-bold text-[#1A1A1A] uppercase tracking-widest">
                                        <div className="w-2 h-2 rounded-full bg-[#7B61FF]" />
                                        Definition
                                    </div>
                                    <p className="text-slate-500 font-medium leading-relaxed pl-4 border-l-2 border-slate-100">
                                        {topPrediction.description}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-bold text-[#1A1A1A] uppercase tracking-widest">
                                        <div className="w-2 h-2 rounded-full bg-[#FFD166]" />
                                        Key Precautions
                                    </div>
                                    <ul className="space-y-2 pl-4 border-l-2 border-slate-100">
                                        {topPrediction.precautions.map((precaution, idx) => (
                                            <li key={idx} className="text-slate-500 font-medium flex items-start gap-2">
                                                <span className="text-slate-300 mt-0.5">•</span>
                                                {precaution}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Illustration Area */}
                        <div className="hidden lg:flex w-64 items-center justify-center relative z-10">
                            <div className="w-56 h-56 rounded-full bg-gradient-to-br from-[#7B61FF]/20 to-[#FF4D6D]/10 flex items-center justify-center animate-pulse shadow-inner border border-white/50 backdrop-blur-sm">
                                <HeartPulse className="w-24 h-24 text-[#7B61FF]/80" />
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Secondary Alternatives */}
                {predictions && predictions.length > 1 && !isAnalyzing && (
                    <div className="grid grid-cols-2 gap-6">
                        {predictions.slice(1, 3).map((pred) => (
                            <div key={pred.disease} className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-md transition-all cursor-pointer">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Alternative</span>
                                    <span className="text-sm font-bold text-[#7B61FF] bg-[#7B61FF]/10 px-3 py-1 rounded-full text-[10px] uppercase">
                                        {Math.round(pred.confidence * 100)}% Match
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-[#1A1A1A]">{pred.disease}</h3>
                                    <p className="text-slate-500 text-sm font-medium mt-1 line-clamp-2">{pred.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {predictions && !isAnalyzing && (
                    <button 
                        onClick={() => {
                            setPredictions(null);
                            setSelectedSymptoms([]);
                        }}
                        className="self-start px-6 py-3 rounded-xl border-2 border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors"
                    >
                        Start New Analysis
                    </button>
                )}
            </div>

            {/* Right Column (Sidebar Widgets) */}
            <div className="w-80 flex flex-col gap-6 shrink-0">
                {/* Navigation Menu Widget */}
                <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100">
                    <nav className="flex flex-col gap-1">
                        {[
                            { name: "Highlights", icon: Activity, active: true },
                            { name: "Images", icon: FileText, active: false },
                            { name: "Risk Factors", icon: HeartPulse, active: false },
                            { name: "Diagnosis", icon: Stethoscope, active: false },
                            { name: "Treatment", icon: Beaker, active: false },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.name}
                                    className={`flex items-center gap-4 px-4 py-3 rounded-2xl w-full transition-all ${
                                        item.active
                                            ? "bg-[#7B61FF]/10 text-[#7B61FF]"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-[#1A1A1A]"
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-bold text-sm">{item.name}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Resource Center Widget */}
                <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col gap-4">
                    <h3 className="font-bold text-[#1A1A1A]">Resource Center</h3>
                    
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 bg-slate-50/50 cursor-pointer hover:bg-slate-50 hover:border-[#7B61FF]/30 transition-all">
                        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-[#7B61FF]">
                            <UploadCloud className="w-5 h-5" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-[#1A1A1A]">Upload Resource</p>
                            <p className="text-xs font-medium text-slate-400 mt-1">.docx, .pdf, .excel</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
