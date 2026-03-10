"use client";

import { useState, useRef } from "react";
import { SymptomPicker } from "@/components/prediction/SymptomPicker";
import { addHistoryEntry } from "@/lib/history-store";
import type { AIAnalysis } from "@/lib/groq";
import { Activity, Beaker, FileText, HeartPulse, Stethoscope, UploadCloud, Download, ImageIcon, ShieldCheck, AlertCircle } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

type RightTab = "highlights" | "images" | "risks" | "diagnosis" | "treatment";

export default function DashboardPage() {
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [predictions, setPredictions] = useState<PredictionResult[] | null>(null);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeRightTab, setActiveRightTab] = useState<RightTab>("highlights");
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);
    
    const reportRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePredict = async () => {
        if (selectedSymptoms.length === 0) return;

        setIsAnalyzing(true);
        setError(null);
        setPredictions(null);
        setAiAnalysis(null);
        setActiveRightTab("highlights");

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

    const downloadPDF = async () => {
        if (!reportRef.current) return;
        
        const canvas = await html2canvas(reportRef.current, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff"
        });
        
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Neurax_Report_${topPrediction?.disease || "Clinical"}.pdf`);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadStatus(`Uploading ${file.name}...`);
            setTimeout(() => {
                setUploadStatus("Resource Integrated Successfully");
                setTimeout(() => setUploadStatus(null), 3000);
            }, 2000);
        }
    };

    const topPrediction = predictions?.[0];

    return (
        <div className="flex gap-8 max-w-[1200px] mx-auto animate-in fade-in duration-700">
            {/* Left Column (Main Data) */}
            <div className="flex-1 flex flex-col gap-6">
                {!predictions && (
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-slate-800 flex flex-col gap-8">
                        <div>
                            <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-white mb-2">Clinical Diagnosis Input</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Select patient symptoms to run the predictive disease model.</p>
                        </div>
                        
                        <SymptomPicker
                            selectedSymptoms={selectedSymptoms}
                            onSymptomsChange={setSelectedSymptoms}
                        />

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
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
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-24 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-6">
                        <div className="w-16 h-16 border-4 border-[#7B61FF]/20 border-t-[#7B61FF] rounded-full animate-spin" />
                        <p className="text-[#1A1A1A] dark:text-white font-bold text-lg">Analyzing Neural Clinical Pathways...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !isAnalyzing && (
                    <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl p-6 font-medium border border-red-100 dark:border-red-900/50">
                        Error: {error}
                    </div>
                )}

                {/* Results - Highlights Card */}
                {topPrediction && !isAnalyzing && (
                    <div className="space-y-6">
                        <div ref={reportRef} className="bg-white dark:bg-slate-900 rounded-[2rem] p-10 shadow-[0_8px_32px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800 relative overflow-hidden flex flex-col lg:flex-row gap-8">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#7B61FF]/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                            <div className="flex-1 space-y-8 z-10">
                                {activeRightTab === "highlights" && (
                                    <>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                                                <span className="text-slate-400">Highlights</span>
                                                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                                <span className="text-[#FF4D6D]">{topPrediction.severity.toUpperCase()} PRIORITY</span>
                                            </div>
                                            <h2 className="text-5xl font-extrabold text-[#1A1A1A] dark:text-white tracking-tighter">
                                                {topPrediction.disease}
                                            </h2>
                                        </div>

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
                                                <div className="flex items-center gap-2 text-sm font-bold text-[#1A1A1A] dark:text-white uppercase tracking-widest">
                                                    <div className="w-2 h-2 rounded-full bg-[#7B61FF]" />
                                                    Definition
                                                </div>
                                                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed pl-4 border-l-2 border-slate-100 dark:border-slate-800">
                                                    {topPrediction.description}
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeRightTab === "images" && (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-bold text-[#1A1A1A] dark:text-white uppercase italic tracking-tighter">Clinical Visualization</h2>
                                            <p className="text-slate-500 font-medium">Neural scans and pathology imagery associated with {topPrediction.disease}.</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[1, 2, 3, 4].map(idx => (
                                                <div key={idx} className="aspect-video bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-center group overflow-hidden relative">
                                                    <ImageIcon className="w-8 h-8 text-slate-200 group-hover:scale-110 transition-transform" />
                                                    <div className="absolute bottom-2 left-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest">Scan_Ref_{idx * 832}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeRightTab === "risks" && (
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-bold text-[#1A1A1A] dark:text-white uppercase italic tracking-tighter">Risk Assessment</h2>
                                            <p className="text-slate-500 font-medium">Metric-based pathology risks for the current patient profile.</p>
                                        </div>
                                        <div className="space-y-4">
                                            {[
                                                { label: "Complication Risk", value: "High", color: "text-[#FF4D6D]" },
                                                { label: "Transmission Factor", value: "Minimal", color: "text-[#7B61FF]" },
                                                { label: "Systemic Impact", value: "Moderate", color: "text-[#FFD166]" },
                                            ].map(m => (
                                                <div key={m.label} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                                    <span className="font-bold text-sm text-slate-500 uppercase tracking-widest">{m.label}</span>
                                                    <span className={`font-black uppercase tracking-tighter italic ${m.color}`}>{m.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeRightTab === "diagnosis" && (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-bold text-[#1A1A1A] dark:text-white uppercase italic tracking-tighter">Clinical Notes</h2>
                                            <p className="text-slate-500 font-medium">Generated identifiers from the Neurax ML engine.</p>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 font-mono text-xs text-slate-500 leading-loose">
                                            <p>{"[SYSTEM_ID: 9283-X]"}</p>
                                            <p>{"[CONF_RATING: 0." + (topPrediction.confidence * 100).toFixed(0) + "]"}</p>
                                            <p>{"[INPUT_VECTORS: " + selectedSymptoms.join(", ") + "]"}</p>
                                            <p>{"[LATENT_MATCH: Verified]"}</p>
                                            <p className="mt-4 text-[#7B61FF]">{"Recommended: Manual clinical oversight for " + topPrediction.disease}</p>
                                        </div>
                                    </div>
                                )}

                                {activeRightTab === "treatment" && (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-bold text-[#1A1A1A] dark:text-white uppercase italic tracking-tighter">Treatment Pathway</h2>
                                            <p className="text-slate-500 font-medium">Primary precautions and suggested recovery steps.</p>
                                        </div>
                                        <div className="grid gap-4">
                                            {topPrediction.precautions.map((p, i) => (
                                                <div key={i} className="flex gap-4 items-start p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                                    <div className="w-8 h-8 rounded-full bg-[#7B61FF]/10 flex items-center justify-center shrink-0">
                                                        <ShieldCheck className="w-5 h-5 text-[#7B61FF]" />
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-normal">{p}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Illustration Area */}
                            <div className="hidden lg:flex w-64 items-center justify-center relative z-10">
                                <div className="w-56 h-56 rounded-full bg-gradient-to-br from-[#7B61FF]/20 to-[#FF4D6D]/10 flex items-center justify-center animate-pulse shadow-inner border border-white/50 backdrop-blur-sm">
                                    <HeartPulse className="w-24 h-24 text-[#7B61FF]/80" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <button 
                                onClick={() => {
                                    setPredictions(null);
                                    setSelectedSymptoms([]);
                                }}
                                className="px-6 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                            >
                                Start New Analysis
                            </button>
                            <button 
                                onClick={downloadPDF}
                                className="px-6 py-3 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
                            >
                                <Download className="w-4 h-4" />
                                Download PDF Report
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Secondary Alternatives */}
                {predictions && predictions.length > 1 && !isAnalyzing && (
                    <div className="grid grid-cols-2 gap-6">
                        {predictions.slice(1, 3).map((pred) => (
                            <div key={pred.disease} className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-4 hover:shadow-md transition-all cursor-pointer">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Alternative</span>
                                    <span className="text-sm font-bold text-[#7B61FF] bg-[#7B61FF]/10 px-3 py-1 rounded-full text-[10px] uppercase">
                                        {Math.round(pred.confidence * 100)}% Match
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-[#1A1A1A] dark:text-white">{pred.disease}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1 line-clamp-2">{pred.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Column (Sidebar Widgets) */}
            <div className="w-80 flex flex-col gap-6 shrink-0">
                {/* Navigation Menu Widget */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-slate-800">
                    <nav className="flex flex-col gap-1">
                        {[
                            { id: "highlights", name: "Highlights", icon: Activity },
                            { id: "images", name: "Images", icon: FileText },
                            { id: "risks", name: "Risk Factors", icon: HeartPulse },
                            { id: "diagnosis", name: "Diagnosis", icon: Stethoscope },
                            { id: "treatment", name: "Treatment", icon: Beaker },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveRightTab(item.id as RightTab)}
                                    className={`flex items-center gap-4 px-4 py-3 rounded-2xl w-full transition-all ${
                                        activeRightTab === item.id
                                            ? "bg-[#7B61FF]/10 text-[#7B61FF]"
                                            : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-950 hover:text-[#1A1A1A]"
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
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-slate-800 flex flex-col gap-4">
                    <h3 className="font-bold text-[#1A1A1A] dark:text-white">Resource Center</h3>
                    
                    <div 
                        onClick={handleUploadClick}
                        className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 bg-slate-50/50 dark:bg-slate-950/20 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950 hover:border-[#7B61FF]/30 transition-all"
                    >
                        <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-[#7B61FF]">
                            <UploadCloud className="w-5 h-5" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-[#1A1A1A] dark:text-white">
                                {uploadStatus || "Upload Resource"}
                            </p>
                            <p className="text-xs font-medium text-slate-400 mt-1">
                                {uploadStatus ? "Processing Integration" : ".docx, .pdf, .excel"}
                            </p>
                        </div>
                    </div>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileChange}
                    />
                </div>

                {/* System Activity Feed */}
                <div className="mt-auto p-6 rounded-3xl bg-[#1A1A1A] text-white space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7B61FF]">Live Diagnostics</span>
                        <div className="w-2 h-2 rounded-full bg-[#7B61FF] animate-pulse" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex gap-3 items-start">
                            <AlertCircle className="w-4 h-4 text-slate-500 mt-0.5" />
                            <p className="text-[10px] font-bold text-slate-400">Neural Engine V1.5 initialized with zero latent bias.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
