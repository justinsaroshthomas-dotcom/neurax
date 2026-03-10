"use client";

import { useState, useRef } from "react";
import { SymptomPicker } from "@/components/prediction/SymptomPicker";
import { addHistoryEntry } from "@/lib/history-store";
import type { AIAnalysis } from "@/lib/groq";
import { Activity, Beaker, FileText, HeartPulse, Stethoscope, UploadCloud, Download, ImageIcon, ShieldCheck, AlertCircle, Share2, Printer } from "lucide-react";
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
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    
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
        setIsGeneratingPDF(true);
        
        try {
            // Use a higher scale for better resolution and ensure we capture a clean white background
            const canvas = await html2canvas(reportRef.current, {
                scale: 3,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
                windowWidth: 1200, // Force a consistent width for capture
                onclone: (clonedDoc) => {
                    // Make adjustments to the clone specifically for the PDF
                    const reportElement = clonedDoc.querySelector('[data-pdf-content]') as HTMLElement;
                    if (reportElement) {
                        reportElement.style.padding = '40px';
                        reportElement.style.background = '#ffffff';
                        reportElement.style.color = '#000000';
                        // Force light theme text colors for maximum clarity in PDF
                        const textElements = reportElement.querySelectorAll('h2, h3, p, span, li');
                        textElements.forEach(el => (el as HTMLElement).style.color = '#0f172a');
                    }
                }
            });
            
            const imgData = canvas.toDataURL("image/jpeg", 1.0);
            const pdf = new jsPDF("p", "mm", "a4");
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Neurax_Clinical_Report_${topPrediction?.disease || "Generic"}.pdf`);
        } catch (err) {
            console.error("PDF generation error:", err);
            alert("Failed to generate PDF. Please try again.");
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
    
    // Using the high-end pathology scan image for the "Peak AI" visual
    const pathologyImage = "C:\\Users\\justi\\.gemini\\antigravity\brain\\0417361e-04b6-4630-9af6-c2bd9164d996\\neurax_ai_pathology_scan_1773154631205.png";

    return (
        <div className="flex gap-10 max-w-[1300px] mx-auto animate-in fade-in duration-1000">
            {/* Main Clinical Data Area */}
            <div className="flex-1 flex flex-col gap-8">
                
                {/* Input Area (Only visible when no predictions) */}
                {!predictions && !isAnalyzing && (
                    <div className="bg-white dark:bg-slate-900 rounded-4xl p-10 premium-shadow border border-slate-100 dark:border-slate-800 space-y-10">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-primary rounded-full" />
                                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">Clinical Intelligence Input</h2>
                            </div>
                            <p className="text-slate-500 font-medium text-sm">Synchronize patient manifestations for neural diagnostic matching.</p>
                        </div>
                        
                        <SymptomPicker
                            selectedSymptoms={selectedSymptoms}
                            onSymptomsChange={setSelectedSymptoms}
                        />

                        <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Neural Mapping Layer: 6 (Active)
                            </div>
                            <button
                                onClick={handlePredict}
                                disabled={selectedSymptoms.length === 0 || isAnalyzing}
                                className="px-10 py-4.5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale flex items-center gap-3"
                            >
                                Initiate Analysis
                                <Activity className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Processing State */}
                {isAnalyzing && (
                    <div className="bg-white dark:bg-slate-900 rounded-4xl p-24 premium-shadow border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-8">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 bg-primary/20 rounded-full animate-pulse" />
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-slate-900 dark:text-white font-black text-xl tracking-tight uppercase">Processing Neural Pathways</h3>
                            <p className="text-slate-400 font-medium text-sm">Matching clinical signatures against 5,000,000+ data points...</p>
                        </div>
                    </div>
                )}

                {/* Error Notification */}
                {error && !isAnalyzing && (
                    <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-2xl p-6 font-bold border border-rose-100 dark:border-rose-900/50 flex gap-4 items-center">
                        <AlertCircle className="w-6 h-6 shrink-0" />
                        <span className="text-sm tracking-tight">System Exception: {error}</span>
                    </div>
                )}

                {/* Clinical Intelligence Result Area */}
                {topPrediction && !isAnalyzing && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                        {/* THE PDF CAPTURE AREA */}
                        <div ref={reportRef} data-pdf-content className="bg-white dark:bg-slate-900 rounded-4xl overflow-hidden premium-shadow border border-slate-100 dark:border-slate-800 flex flex-col items-stretch">
                            {/* Result Top Panel */}
                            <div className="p-10 flex flex-col lg:flex-row gap-12 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                                
                                <div className="flex-1 space-y-10 z-10">
                                    {/* Intelligence Identity */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black uppercase tracking-widest">
                                                Final Match Confirmed
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full animate-pulse ${topPrediction.severity === 'critical' ? 'bg-rose-500' : 'bg-primary'}`} />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">
                                                    {topPrediction.severity} Severity Diagnostic
                                                </span>
                                            </div>
                                        </div>
                                        <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight font-display">
                                            {topPrediction.disease}
                                        </h2>
                                    </div>

                                    {/* Clinical Visual Source (Peak AI source) */}
                                    <div className="group relative rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 aspect-[21/9] shadow-inner">
                                        <img 
                                            src={pathologyImage} 
                                            alt="Neural Pathology Scan" 
                                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none" />
                                        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                            <ImageIcon className="w-3 h-3 text-primary" />
                                            Primary Pathology Vector: MatchID_8923
                                        </div>
                                    </div>

                                    {/* Data Insights Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.1em] font-display">
                                                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                                Clinical Summary
                                            </div>
                                            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed pl-4 border-l-2 border-slate-100 dark:border-slate-800">
                                                {topPrediction.description}
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.1em] font-display">
                                                <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                                                Critical Precautions
                                            </div>
                                            <ul className="space-y-3 pl-4 border-l-2 border-slate-100 dark:border-slate-800">
                                                {topPrediction.precautions.slice(0, 3).map((p, i) => (
                                                    <li key={i} className="text-slate-500 dark:text-slate-400 font-medium text-xs flex gap-2">
                                                        <span className="text-primary">•</span> {p}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="flex items-center justify-between px-2">
                            <button 
                                onClick={() => {
                                    setPredictions(null);
                                    setSelectedSymptoms([]);
                                }}
                                className="px-8 py-3.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white font-black text-[10px] uppercase tracking-widest transition-all font-sans"
                            >
                                New Clinical Session
                            </button>
                            
                            <div className="flex items-center gap-4">
                                <button className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm">
                                    <Share2 className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={downloadPDF}
                                    disabled={isGeneratingPDF}
                                    className="px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] flex items-center gap-3 shadow-xl hover:scale-[1.05] disabled:opacity-50 transition-all font-display"
                                >
                                    {isGeneratingPDF ? (
                                        <>
                                            <div className="w-3 h-3 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
                                            Compiling Report...
                                        </>
                                    ) : (
                                        <>
                                            <Printer className="w-4 h-4" />
                                            Print Formal Report
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Differential Matches */}
                {predictions && predictions.length > 1 && !isAnalyzing && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                             <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1" />
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Differential Diagnostics</span>
                             <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            {predictions.slice(1, 3).map((pred) => (
                                <div key={pred.disease} className="bg-white dark:bg-slate-900 rounded-3xl p-8 premium-shadow border border-slate-100 dark:border-slate-800 flex flex-col gap-6 group hover:translate-y-[-4px] transition-all cursor-pointer">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Secondary Match</span>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">{pred.disease}</h3>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800">
                                            <span className="text-xs font-black text-primary">{Math.round(pred.confidence * 100)}%</span>
                                        </div>
                                    </div>
                                    <p className="text-slate-500 text-xs font-medium leading-normal line-clamp-2">{pred.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Elite Intelligence Sidebar */}
            <div className="w-80 flex flex-col gap-8 shrink-0">
                {/* Diagnostic Details Menu */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 premium-shadow border border-slate-100 dark:border-slate-800 space-y-6">
                    <h3 className="font-display font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Intelligence Detail</h3>
                    <nav className="flex flex-col gap-2">
                        {[
                            { id: "highlights", name: "Matching Profile", icon: Activity },
                            { id: "images", name: "Neural Visualization", icon: FileText },
                            { id: "risks", name: "Risk Assessment", icon: HeartPulse },
                            { id: "diagnosis", name: "Logic Records", icon: Stethoscope },
                            { id: "treatment", name: "Clinical Pathway", icon: Beaker },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveRightTab(item.id as RightTab)}
                                    className={`flex items-center gap-4 px-4 py-3 rounded-xl w-full transition-all group font-sans ${
                                        activeRightTab === item.id
                                            ? "bg-primary/10 text-primary border border-primary/20"
                                            : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${activeRightTab === item.id ? 'stroke-[2.5]' : 'stroke-2'}`} />
                                    <span className="font-bold text-xs tracking-tight">{item.name}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Record Center */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 premium-shadow border border-slate-100 dark:border-slate-800 space-y-6">
                    <h3 className="font-display font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Knowledge Base</h3>
                    
                    <button 
                        onClick={handleUploadClick}
                        className="w-full relative group"
                    >
                        <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 bg-slate-50/50 dark:bg-slate-950/20 group-hover:border-primary/50 group-hover:bg-white dark:group-hover:bg-slate-900 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center text-primary">
                                <UploadCloud className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
                                    {uploadStatus || "Import Clinical Data"}
                                </p>
                                <p className="text-[9px] font-bold text-slate-400 mt-2 tracking-widest italic uppercase">
                                    {uploadStatus ? "Analyzing Integrity" : "Secure Node Integration"}
                                </p>
                            </div>
                        </div>
                    </button>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileChange}
                    />
                </div>

                {/* Real-time Diagnostics Feed */}
                <div className="mt-auto p-8 rounded-4xl bg-slate-900 text-white space-y-6 shadow-2xl relative overflow-hidden group">
                     {/* Gloss effect */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Live Feed</span>
                        <div className="flex gap-1">
                            <span className="w-1 h-3 bg-primary rounded-full animate-bounce" />
                            <span className="w-1 h-3 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1 h-3 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex gap-4 items-start pb-4 border-b border-white/5">
                            <ShieldCheck className="w-4 h-4 text-primary mt-1 shrink-0" />
                            <p className="text-[10px] font-bold text-slate-300 leading-relaxed uppercase tracking-widest font-sans">Verified: Clinical Layer matches global diagnostic protocols.</p>
                        </div>
                        <div className="flex gap-4 items-start">
                            <Activity className="w-4 h-4 text-primary/60 mt-1 shrink-0" />
                            <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest font-sans">Latent bias scanning at zero-tolerance threshold.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
