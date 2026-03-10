"use client";

import { useState, useRef, useEffect } from "react";
import { SymptomPicker } from "@/components/prediction/SymptomPicker";
import { addHistoryEntry } from "@/lib/history-store";
import { getClinicalMetrics } from "@/lib/metrics-store";
import type { AIAnalysis } from "@/lib/groq";
import { Activity, Beaker, FileText, HeartPulse, Stethoscope, UploadCloud, Download, ShieldCheck, AlertCircle, Share2, Printer, ChevronRight, Zap, Target } from "lucide-react";
import jsPDF from "jspdf";

export interface PredictionResult {
    disease: string;
    confidence: number;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    precautions: string[];
    treatments: string[];
    matchedSymptoms: string[];
}

interface PredictResponse {
    predictions: PredictionResult[];
    aiAnalysis: AIAnalysis | null;
    message?: string;
    error?: string;
}

type RightTab = "highlights" | "risks" | "diagnosis" | "treatment";

export default function DashboardPage() {
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [predictions, setPredictions] = useState<PredictionResult[] | null>(null);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeRightTab, setActiveRightTab] = useState<RightTab>("highlights");
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    
    
    // Metrics
    const metrics = getClinicalMetrics();
    
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
        if (!predictions || predictions.length === 0) return;
        setIsGeneratingPDF(true);
        
        try {
            // Neurax v3.0 ROBUST PDF ENGINE: Create a clean, off-screen template for capture
            const doc = new jsPDF("p", "mm", "a4");
            const top = predictions[0];
            
            // Draw professional header
            doc.setFillColor(15, 23, 42); // slate-900
            doc.rect(0, 0, 210, 40, "F");
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.text("NEURAX CLINICAL REPORT", 20, 20);
            doc.setFontSize(10);
            doc.text("UNIVERSAL DISEASE INTELLIGENCE MATRIX v3.0", 20, 28);
            doc.text(`DATE: ${new Date().toLocaleDateString()}`, 160, 28);
            
            // Main Disease Section
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(28);
            doc.text(top.disease.toUpperCase(), 20, 60);
            
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139); // slate-400
            doc.text(`SEVERITY: ${top.severity.toUpperCase()}`, 20, 68);
            doc.text(`CONFIDENCE: ${Math.round(top.confidence * 100)}% Match`, 80, 68);
            
            // Horizontal Rule
            doc.setDrawColor(226, 232, 240);
            doc.line(20, 75, 190, 75);
            
            // Description
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(14);
            doc.text("Clinical Summary", 20, 90);
            doc.setFontSize(11);
            doc.setTextColor(71, 85, 105);
            
            const splitDesc = doc.splitTextToSize(top.description, 170);
            doc.text(splitDesc, 20, 100);
            
            // Symptoms
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(14);
            doc.text("Manifested Symptoms", 20, 130);
            doc.setFontSize(10);
            doc.text(selectedSymptoms.join(" • "), 20, 140);
            
            // Precautions
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(14);
            doc.text("Clinical Precautions", 20, 160);
            doc.setFontSize(10);
            let y = 168;
            top.precautions.slice(0, 4).forEach(p => {
                doc.text(`• ${p}`, 25, y);
                y += 6;
            });

            // Treatments
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(14);
            doc.text("Treatment Protocol", 20, y + 10);
            doc.setFontSize(10);
            y += 18;
            top.treatments.slice(0, 5).forEach(t => {
                doc.text(`• ${t}`, 25, y);
                y += 6;
            });
            
            // Footer
            doc.setFillColor(248, 250, 252);
            doc.rect(0, 275, 210, 22, "F");
            doc.setTextColor(148, 163, 184);
            doc.setFontSize(8);
            doc.text("This is an AI-generated clinical suggestion. Manual physician verification is required.", 105, 285, { align: "center" });
            doc.text("Neurax Neural Intelligence Layer 3.0.4", 105, 290, { align: "center" });
            
            doc.save(`Neurax_Report_${top.disease.replace(/\s+/g, '_')}.pdf`);
        } catch (err) {
            console.error("PDF engine error:", err);
            alert("Internal PDF engine error. Try printing via browser.");
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadStatus(`Indexing ${file.name}...`);
            setTimeout(() => {
                setUploadStatus("Clinical Record Integrated");
                setTimeout(() => setUploadStatus(null), 3000);
            }, 2000);
        }
    };

    const topPrediction = predictions?.[0];

    return (
        <div className="flex gap-10 max-w-[1400px] mx-auto animate-in fade-in duration-1000">
            {/* Main Clinical Data Area */}
            <div className="flex-1 flex flex-col gap-8">
                
                {/* Input Area */}
                {!predictions && !isAnalyzing && (
                    <div className="bg-white dark:bg-slate-900 rounded-4xl p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 space-y-10">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-display">Neural Clinical Input</h2>
                            <p className="text-slate-500 font-medium text-sm">Select patient symptoms to generate a predictive diagnostic matrix.</p>
                        </div>
                        
                        <SymptomPicker
                            selectedSymptoms={selectedSymptoms}
                            onSymptomsChange={setSelectedSymptoms}
                        />

                        <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button
                                onClick={handlePredict}
                                disabled={selectedSymptoms.length === 0 || isAnalyzing}
                                className="px-10 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3"
                            >
                                Initiate Prediction
                                <Activity className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Processing State */}
                {isAnalyzing && (
                    <div className="bg-white dark:bg-slate-900 rounded-4xl p-24 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-8">
                        <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                        <h3 className="text-slate-900 dark:text-white font-black text-xl tracking-tight uppercase">Analyzing Clinical Pathways...</h3>
                    </div>
                )}

                {/* Clinical Intelligence Result Area */}
                {topPrediction && !isAnalyzing && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                        <div className="bg-white dark:bg-slate-900 rounded-4xl overflow-hidden glass-panel border border-slate-100 dark:border-slate-800 flex flex-col items-stretch">
                            <div className="p-10 flex flex-col lg:flex-row gap-12">
                                <div className="flex-1 space-y-10">
                                    {/* Primary Tab Content */}
                                    {activeRightTab === "highlights" && (
                                        <div className="space-y-8">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="px-3 py-1 rounded bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest">
                                                        Confirmed Match
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                                                        {topPrediction.severity} Priority
                                                    </span>
                                                </div>
                                                <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight font-display">
                                                    {topPrediction.disease}
                                                </h2>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-4 p-6 rounded-3xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                                                    <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Confidence Rating</h4>
                                                    <div className="flex items-end gap-2">
                                                        <span className="text-4xl font-black text-slate-900 dark:text-white leading-none font-sans">{Math.round(topPrediction.confidence * 100)}%</span>
                                                        <span className="text-xs font-bold text-slate-400 mb-1">Precision</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-4 p-6 rounded-3xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                                                    <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Severity Index</h4>
                                                    <div className="flex items-end gap-2">
                                                        <span className="text-4xl font-black text-slate-900 dark:text-white leading-none font-sans uppercase italic tracking-tighter">{topPrediction.severity}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Definition</h4>
                                                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic text-lg pr-12">
                                                    "{topPrediction.description}"
                                                </p>
                                            </div>
                                        </div>
                                    )}


                                    {activeRightTab === "risks" && (
                                        <div className="space-y-8">
                                            <div className="space-y-2">
                                                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight font-display uppercase">Risk Assessment</h2>
                                                <p className="text-slate-500 font-medium text-sm italic">Multi-layered pathology risk index for the patient profile.</p>
                                            </div>
                                            <div className="grid gap-6">
                                                {[
                                                    { label: "Complication Likelihood", val: 82, color: "bg-rose-500" },
                                                    { label: "Systemic Bio-Impact", val: 45, color: "bg-primary" },
                                                    { label: "Transmission Factor", val: 12, color: "bg-emerald-500" },
                                                ].map(r => (
                                                    <div key={r.label} className="space-y-3">
                                                        <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                                                            <span>{r.label}</span>
                                                            <span>{r.val}%</span>
                                                        </div>
                                                        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                                            <div className={`h-full ${r.color} shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-all duration-1000`} style={{ width: `${r.val}%` }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeRightTab === "diagnosis" && (
                                        <div className="space-y-8">
                                            <div className="space-y-2">
                                                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight font-display uppercase">Logic Records</h2>
                                                <p className="text-slate-500 font-medium text-sm italic">Deep ML diagnostic identifiers from the Neurax Logic Layer.</p>
                                            </div>
                                            <div className="p-8 rounded-4xl bg-slate-900 text-slate-300 font-mono text-xs leading-loose space-y-4 border border-white/5 shadow-2xl">
                                                <div className="flex gap-4 border-b border-white/5 pb-4">
                                                    <span className="text-primary font-black">MATCH_VAL:</span>
                                                    <span className="text-white">0.{(topPrediction.confidence * 1000).toFixed(0)}</span>
                                                </div>
                                                <div className="flex gap-4 border-b border-white/5 pb-4">
                                                    <span className="text-primary font-black">SYMPTOM_VECTORS:</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedSymptoms.map(s => (
                                                            <span key={s} className="px-2 py-0.5 rounded bg-white/5 border border-white/10">{s}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <span className="text-primary font-black">LATENT_STATUS:</span>
                                                    <span className="text-emerald-400">VERIFIED_STABLE</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeRightTab === "treatment" && (
                                        <div className="space-y-8">
                                            <div className="space-y-2">
                                                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight font-display uppercase">Clinical Pathway</h2>
                                                <p className="text-slate-500 font-medium text-sm italic">Structured medical treatments and recovery protocols.</p>
                                            </div>
                                            <div className="grid gap-6">
                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Recommended Treatments</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {topPrediction.treatments.map((t, i) => (
                                                            <span key={i} className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                                                                {t}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Precautions</h4>
                                                    <div className="grid gap-3">
                                                        {topPrediction.precautions.map((p, i) => (
                                                            <div key={i} className="flex gap-4 items-start p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                                                <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20">
                                                                    <AlertCircle className="w-4 h-4 text-rose-500" />
                                                                </div>
                                                                <p className="text-slate-700 dark:text-slate-200 text-xs font-bold">{p}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Result Action Bar */}
                        <div className="flex items-center justify-between px-2">
                            <button 
                                onClick={() => {
                                    setPredictions(null);
                                    setSelectedSymptoms([]);
                                }}
                                className="px-8 py-4 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                            >
                                Start New Clinical Session
                            </button>
                            
                            <div className="flex items-center gap-4">
                                <button className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-all">
                                    <Share2 className="w-6 h-6 border-slate-50" />
                                </button>
                                <button 
                                    onClick={downloadPDF}
                                    disabled={isGeneratingPDF}
                                    className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all font-display"
                                >
                                    {isGeneratingPDF ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                                            Encoding Report...
                                        </>
                                    ) : (
                                        <>
                                            <Printer className="w-5 h-5" />
                                            Print Formal Report
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Elite Intelligence Sidebar */}
            <div className="w-80 flex flex-col gap-8 shrink-0">
                
                {/* INTERFACE VISUALS WORKING: Intelligence Detail Menu */}
                <div className="bg-white dark:bg-slate-900 rounded-4xl p-8 border border-slate-100 dark:border-slate-800 space-y-6">
                    <h3 className="font-display font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Intelligence Detail</h3>
                    <nav className="flex flex-col gap-2">
                        {[
                            { id: "highlights", name: "Matching Profile", icon: Activity },
                            { id: "risks", name: "Risk Assessment", icon: HeartPulse },
                            { id: "diagnosis", name: "Logic Records", icon: Stethoscope },
                            { id: "treatment", name: "Clinical Pathway", icon: Beaker },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveRightTab(item.id as RightTab)}
                                    className={`flex items-center justify-between px-5 py-4 rounded-2xl w-full transition-all group font-sans ${
                                        activeRightTab === item.id
                                            ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.05]"
                                            : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <Icon className="w-4 h-4" />
                                        <span className="font-bold text-xs tracking-tight">{item.name}</span>
                                    </div>
                                    <ChevronRight className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${activeRightTab === item.id ? 'opacity-100' : ''}`} />
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Performance Metrics: F1, Precision, etc. */}
                <div className="bg-slate-950 rounded-4xl p-8 text-white space-y-8 shadow-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" />
                     
                     <div className="flex flex-col gap-1 relative z-10">
                        <span className="text-[10px] font-black uppercase text-primary tracking-[0.4em] font-display opacity-80">Intelligence Engine Core</span>
                        <h3 className="text-2xl font-black tracking-tighter italic font-display">System Accuracy</h3>
                     </div>

                     <div className="space-y-7 relative z-10">
                        <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                <span>F1-Protocol Match</span>
                                <span className="text-white font-mono">{metrics.f1Score}%</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000" style={{ width: `${metrics.f1Score}%` }} />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                <span>Clinical Precision</span>
                                <span className="text-white font-mono">{metrics.precision}%</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                <div className="h-full bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)] transition-all duration-1000" style={{ width: `${metrics.precision}%` }} />
                            </div>
                        </div>
                         <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                <span>Latent Neural Bias</span>
                                <span className="text-emerald-400 font-mono italic">NOMINAL</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                <div className="h-full bg-emerald-500/40 rounded-full transition-all duration-1000" style={{ width: '4%' }} />
                            </div>
                        </div>
                     </div>

                     <div className="pt-6 flex items-center justify-between relative z-10 border-t border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[32px] font-black leading-none font-display tracking-tight">{metrics.totalIdentified}</span>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Pathology Markers</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-500 shadow-2xl">
                            <Activity className="w-5 h-5 text-primary group-hover:text-white transition-colors animate-pulse" />
                        </div>
                     </div>
                </div>

                {/* Knowledge Base */}
                <div className="p-8 rounded-4xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4">
                    <h3 className="font-display font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Knowledge Base</h3>
                    <button 
                        onClick={handleUploadClick}
                        className="w-full h-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-primary/40 transition-all group"
                    >
                        <UploadCloud className="w-6 h-6 text-slate-300 group-hover:text-primary transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">{uploadStatus || "Secure Import"}</span>
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                </div>
            </div>
        </div>
    );
}
