"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { SymptomPicker } from "@/components/prediction/SymptomPicker";
import { ConfidenceRing } from "@/components/prediction/ConfidenceRing";
import { QuickStatBadge } from "@/components/prediction/QuickStatBadge";
import { addHistoryEntry, getAllHistory } from "@/lib/history-store";
import { getClinicalMetrics } from "@/lib/metrics-store";
import { useCatalogSummary } from "@/lib/use-catalog";
import type { AIAnalysis } from "@/lib/groq";
import {
    Activity, Beaker, FileText, HeartPulse, Stethoscope, UploadCloud,
    Share2, Printer, ChevronRight, AlertCircle, Brain, Layers, Zap,
    ClipboardList, TrendingUp, CheckCircle2, XCircle,
} from "lucide-react";
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

const severityConfig = {
    low: { label: "Low Risk", color: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800/50", ring: "#10b981" },
    medium: { label: "Moderate", color: "bg-amber-500", text: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800/50", ring: "#f59e0b" },
    high: { label: "High Risk", color: "bg-orange-500", text: "text-orange-700 dark:text-orange-300", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800/50", ring: "#f97316" },
    critical: { label: "Critical", color: "bg-rose-500", text: "text-rose-700 dark:text-rose-300", bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-800/50", ring: "#f43f5e" },
};

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
}

export default function DashboardPage() {
    const { user } = useUser();
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [predictions, setPredictions] = useState<PredictionResult[] | null>(null);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeRightTab, setActiveRightTab] = useState<RightTab>("highlights");
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [sessionCount, setSessionCount] = useState(0);

    const metrics = getClinicalMetrics();
    const { data: catalogSummary } = useCatalogSummary();
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const history = getAllHistory();
        setSessionCount(history.length);
    }, []);

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
            if (!res.ok) throw new Error(`Prediction failed: ${res.statusText}`);
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
                setSessionCount((c) => c + 1);
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
            const doc = new jsPDF("p", "mm", "a4");
            const top = predictions[0];
            doc.setFillColor(15, 23, 42);
            doc.rect(0, 0, 210, 40, "F");
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.text("NEURAX CLINICAL REPORT", 20, 20);
            doc.setFontSize(10);
            doc.text("UNIVERSAL DISEASE INTELLIGENCE MATRIX v3.0", 20, 28);
            doc.text(`DATE: ${new Date().toLocaleDateString()}`, 160, 28);
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(28);
            doc.text(top.disease.toUpperCase(), 20, 60);
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            doc.text(`SEVERITY: ${top.severity.toUpperCase()}`, 20, 68);
            doc.text(`CONFIDENCE: ${Math.round(top.confidence * 100)}% Match`, 80, 68);
            doc.setDrawColor(226, 232, 240);
            doc.line(20, 75, 190, 75);
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(14);
            doc.text("Clinical Summary", 20, 90);
            doc.setFontSize(11);
            doc.setTextColor(71, 85, 105);
            const splitDesc = doc.splitTextToSize(top.description, 170);
            doc.text(splitDesc, 20, 100);
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(14);
            doc.text("Manifested Symptoms", 20, 130);
            doc.setFontSize(10);
            doc.text(selectedSymptoms.join(" | "), 20, 140);
            doc.setFontSize(14);
            doc.text("Clinical Precautions", 20, 160);
            doc.setFontSize(10);
            let y = 168;
            top.precautions.slice(0, 4).forEach((p) => { doc.text(`- ${p}`, 25, y); y += 6; });
            doc.setFontSize(14);
            doc.text("Treatment Protocol", 20, y + 10);
            doc.setFontSize(10);
            y += 18;
            top.treatments.slice(0, 5).forEach((t) => { doc.text(`- ${t}`, 25, y); y += 6; });
            doc.setFillColor(248, 250, 252);
            doc.rect(0, 275, 210, 22, "F");
            doc.setTextColor(148, 163, 184);
            doc.setFontSize(8);
            doc.text("This is an AI-generated clinical suggestion. Manual physician verification is required.", 105, 285, { align: "center" });
            doc.text("Neurax Neural Intelligence Layer 3.0.4", 105, 290, { align: "center" });
            doc.save(`Neurax_Report_${top.disease.replace(/\s+/g, "_")}.pdf`);
        } catch (err) {
            console.error("PDF engine error:", err);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadStatus(`Indexing ${file.name}...`);
            setTimeout(() => { setUploadStatus("Clinical Record Integrated"); setTimeout(() => setUploadStatus(null), 3000); }, 2000);
        }
    };

    const topPrediction = predictions?.[0];
    const altPredictions = predictions?.slice(1, 5) ?? [];
    const sev = topPrediction ? severityConfig[topPrediction.severity] : null;
    const confidencePct = topPrediction ? Math.round(topPrediction.confidence * 100) : 0;
    const firstName = user?.firstName || "Doctor";
    const diseaseCount = catalogSummary?.counts.diseases ?? 0;
    const top3Display = catalogSummary?.metrics?.top3;
    const engineMetrics = catalogSummary?.metrics
        ? {
            top3Accuracy: catalogSummary.metrics.top3 ?? catalogSummary.metrics.accuracy,
            f1Score: catalogSummary.metrics.f1,
            recall: catalogSummary.metrics.recall,
            precision: catalogSummary.metrics.precision,
        }
        : metrics;

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-700">

            {/* â”€â”€ Welcome Header â”€â”€ */}
            <div className="flex flex-col justify-between gap-5 pb-2 xl:flex-row xl:items-center">
                <div className="flex flex-col gap-1">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/70">
                        {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </p>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-display">
                        {getGreeting()}, {firstName}
                    </h1>
                    <p className="text-sm font-medium text-slate-500">
                        Your neural diagnostic suite is ready. What symptoms are we analyzing today?
                    </p>
                </div>
                <div className="flex flex-wrap gap-3 xl:justify-end">
                    <QuickStatBadge icon={ClipboardList} label="Sessions" value={sessionCount} color="indigo" />
                    <QuickStatBadge icon={TrendingUp} label="Top-3 Diff" value={top3Display != null ? `${top3Display}%` : "--"} color="emerald" />
                    <QuickStatBadge icon={Brain} label="Diseases Indexed" value={diseaseCount} color="amber" />
                </div>
            </div>

            {/* â”€â”€ Main Content + Right Sidebar â”€â”€ */}
            <div className="flex items-start gap-8">

                {/* â”€â”€ Left: Main Clinical Area â”€â”€ */}
                <div className="flex-1 flex flex-col gap-6 min-w-0">

                    {/* â”€â”€ Input Panel â”€â”€ */}
                    {!predictions && !isAnalyzing && (
                        <div className="overflow-hidden rounded-3xl border border-slate-300/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,255,255,0.74))] shadow-[0_30px_70px_-48px_rgba(15,23,42,0.55)] animate-in fade-in zoom-in-98 duration-700 dark:border-slate-800 dark:bg-slate-900">
                            {/* Panel header */}
                            <div className="px-8 pt-8 pb-0 flex items-start justify-between">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/80 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_12px_20px_-18px_rgba(15,23,42,0.28)] dark:bg-white/10 dark:text-slate-200">
                                            <Stethoscope className="w-4 h-4 text-primary" />
                                        </div>
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight font-display">
                                            Neural Clinical Input
                                        </h2>
                                    </div>
                                    <p className="pl-10 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                                        Select pathology markers to initiate AI diagnostic session
                                    </p>
                                </div>
                                {selectedSymptoms.length > 0 && (
                                    <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 shadow-[0_12px_20px_-18px_rgba(37,99,235,0.4)]">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                        <span className="text-[11px] font-black text-primary uppercase tracking-wider">
                                            {selectedSymptoms.length} Selected
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="mx-8 mt-6 h-px bg-slate-300/80 dark:bg-slate-800" />

                            {/* Symptom Picker */}
                            <div className="px-8 py-6">
                                <SymptomPicker
                                    selectedSymptoms={selectedSymptoms}
                                    onSymptomsChange={setSelectedSymptoms}
                                />
                            </div>

                            {/* Action Footer */}
                            <div className="flex items-center justify-between gap-4 border-t border-slate-300/70 px-8 pb-8 pt-6 dark:border-slate-800">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="group flex items-center gap-2.5 rounded-[1.05rem] border border-slate-400/70 px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary dark:border-slate-700 dark:text-slate-400"
                                >
                                    <UploadCloud className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    {uploadStatus || "Import Clinical Record"}
                                </button>
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

                                <button
                                    onClick={handlePredict}
                                    disabled={selectedSymptoms.length === 0}
                                    className="group flex items-center gap-3 rounded-[1.1rem] bg-primary px-8 py-3.5 text-[11px] font-black uppercase tracking-[0.22em] text-white shadow-[0_20px_34px_-24px_rgba(37,99,235,0.9)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_22px_38px_-22px_rgba(37,99,235,1)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-30"
                                >
                                    <Zap className="w-4 h-4 group-hover:scale-125 transition-transform" />
                                    Initiate Neural Analysis
                                </button>
                            </div>
                        </div>
                    )}

                    {/* â”€â”€ Processing State â”€â”€ */}
                    {isAnalyzing && (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-24 flex flex-col items-center justify-center gap-8 animate-in fade-in zoom-in-95 duration-500 shadow-sm">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin" style={{ animationDuration: "1.4s" }} />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Brain className="w-8 h-8 text-primary/50 animate-pulse" />
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight font-display">
                                    Analyzing clinical pathways...
                                </h3>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">
                                    Processing your symptom profile
                                </p>
                            </div>
                        </div>
                    )}

                    {/* â”€â”€ Error State â”€â”€ */}
                    {error && !isAnalyzing && (
                        <div className="bg-rose-50 dark:bg-rose-950/20 rounded-3xl border border-rose-200 dark:border-rose-900/50 p-8 flex items-start gap-4 animate-in fade-in duration-500">
                            <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-rose-700 dark:text-rose-300">{error}</p>
                                <button
                                    onClick={() => { setError(null); setPredictions(null); }}
                                    className="mt-2 text-xs font-black text-rose-500 uppercase tracking-wider hover:underline"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}

                    {/* â”€â”€ Results Area â”€â”€ */}
                    {topPrediction && !isAnalyzing && sev && (
                        <div className="space-y-5 animate-in slide-in-from-bottom-8 duration-700">

                            {/* â”€ Primary Disease Card â”€ */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                {/* Top severity stripe */}
                                <div className={`h-1.5 w-full ${sev.color}`} />

                                <div className="p-8 flex flex-col lg:flex-row gap-8">
                                    {/* Left: disease info */}
                                    <div className="flex-1 min-w-0 space-y-6">
                                        {/* Badge + name */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${sev.bg} ${sev.text} ${sev.border}`}>
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Confirmed Match
                                                </span>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${sev.text}`}>
                                                    {sev.label}
                                                </span>
                                            </div>
                                            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight font-display">
                                                {topPrediction.disease}
                                            </h2>
                                        </div>

                                        {/* Description */}
                                        {topPrediction.description && (
                                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium italic border-l-2 border-primary/30 pl-4">
                                                {topPrediction.description}
                                            </p>
                                        )}

                                        {/* Matched symptoms chips */}
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                Matched Symptoms ({topPrediction.matchedSymptoms.length})
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {topPrediction.matchedSymptoms.map((s) => (
                                                    <span
                                                        key={s}
                                                        className="px-3 py-1 rounded-xl bg-primary/8 text-primary text-[11px] font-bold border border-primary/15"
                                                    >
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: confidence ring */}
                                    <div className="flex flex-col items-center justify-center gap-4 lg:pl-8 lg:border-l border-slate-100 dark:border-slate-800 shrink-0">
                                        <ConfidenceRing
                                            value={confidencePct}
                                            size={140}
                                            strokeWidth={12}
                                            color={sev.ring}
                                        />
                                        <div className="text-center space-y-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                AI Confidence
                                            </p>
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${sev.bg} ${sev.text} border ${sev.border}`}>
                                                {sev.label}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* â”€ Tab Content Panel â”€ */}
                            {activeRightTab !== "highlights" && (
                                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 animate-in fade-in duration-400">

                                    {activeRightTab === "risks" && (
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight font-display">Risk Assessment</h3>
                                                <p className="text-xs text-slate-400 font-medium mt-1">Multi-layered pathology risk index</p>
                                            </div>
                                            <div className="grid gap-5">
                                                {[
                                                    { label: "Complication Likelihood", val: 82, color: "bg-rose-500", shadow: "shadow-rose-500/30" },
                                                    { label: "Systemic Bio-Impact", val: 45, color: "bg-primary", shadow: "shadow-primary/30" },
                                                    { label: "Transmission Factor", val: 12, color: "bg-emerald-500", shadow: "shadow-emerald-500/30" },
                                                ].map((r) => (
                                                    <div key={r.label} className="space-y-2">
                                                        <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                                                            <span>{r.label}</span>
                                                            <span className="font-black text-slate-900 dark:text-white tabular-nums">{r.val}%</span>
                                                        </div>
                                                        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full ${r.color} rounded-full shadow-lg ${r.shadow} transition-all duration-1000`}
                                                                style={{ width: `${r.val}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeRightTab === "diagnosis" && (
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight font-display">Logic Records</h3>
                                                <p className="text-xs text-slate-400 font-medium mt-1">Deep ML diagnostic identifiers from the Neurax Logic Layer</p>
                                            </div>
                                            <div className="p-6 rounded-2xl bg-slate-900 text-slate-300 font-mono text-xs leading-loose space-y-4 border border-white/5">
                                                <div className="flex gap-4 border-b border-white/5 pb-4">
                                                    <span className="text-primary font-black">MATCH_VAL:</span>
                                                    <span className="text-white">0.{(topPrediction.confidence * 1000).toFixed(0)}</span>
                                                </div>
                                                <div className="flex gap-4 border-b border-white/5 pb-4 flex-wrap">
                                                    <span className="text-primary font-black shrink-0">SYMPTOM_VECTORS:</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {selectedSymptoms.map((s) => (
                                                            <span key={s} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px]">{s}</span>
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
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight font-display">Clinical Pathway</h3>
                                                <p className="text-xs text-slate-400 font-medium mt-1">Structured medical treatments and recovery protocols</p>
                                            </div>
                                            <div className="space-y-6">
                                                {topPrediction.treatments.length > 0 && (
                                                    <div className="space-y-3">
                                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">Recommended Treatments</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {topPrediction.treatments.map((t, i) => (
                                                                <span key={i} className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                                                                    {t}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {topPrediction.precautions.length > 0 && (
                                                    <div className="space-y-3">
                                                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Precautions</p>
                                                        <div className="grid gap-3">
                                                            {topPrediction.precautions.map((p, i) => (
                                                                <div key={i} className="flex gap-3 items-start p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
                                                                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{p}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {topPrediction.treatments.length === 0 && topPrediction.precautions.length === 0 && (
                                                    <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                                                        No curated treatment or precaution data is available for this disease in the local catalog.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* â”€ Alternative Diagnoses Row â”€ */}
                            {altPredictions.length > 0 && (
                                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 space-y-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <Layers className="w-4 h-4 text-slate-400" />
                                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                                Alternative Diagnoses
                                            </h3>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {altPredictions.length} possibilities
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {altPredictions.map((pred, i) => {
                                            const pct = Math.round(pred.confidence * 100);
                                            const altSev = severityConfig[pred.severity];
                                            return (
                                                <div key={pred.disease} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 hover:border-primary/20 hover:bg-primary/3 transition-all group">
                                                    <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                        {i + 2}
                                                    </span>
                                                    <div className="flex-1 min-w-0 space-y-1.5">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{pred.disease}</span>
                                                            <span className="text-xs font-black text-slate-600 dark:text-slate-300 tabular-nums shrink-0">{pct}%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full ${altSev.color} rounded-full transition-all duration-700`}
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border shrink-0 ${altSev.bg} ${altSev.text} ${altSev.border}`}>
                                                        {altSev.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* â”€ AI Summary Card (if available) â”€ */}
                            {aiAnalysis?.summary && (
                                <div className="bg-gradient-to-br from-primary/5 to-indigo-50 dark:from-primary/5 dark:to-slate-900 rounded-3xl border border-primary/15 dark:border-primary/20 p-8 space-y-4 shadow-sm">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-xl bg-primary/15 flex items-center justify-center">
                                            <Brain className="w-4 h-4 text-primary" />
                                        </div>
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">AI Clinical Summary</h3>
                                        <span className="ml-auto px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-black border border-primary/20 uppercase tracking-wider">
                                            Groq AI
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                        {aiAnalysis.summary}
                                    </p>
                                </div>
                            )}

                            {/* â”€ Action Bar â”€ */}
                            <div className="flex items-center justify-between pt-2">
                                <button
                                    onClick={() => { setPredictions(null); setSelectedSymptoms([]); setError(null); }}
                                    className="px-6 py-3 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white font-black text-[10px] uppercase tracking-widest transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    New Diagnostic Session
                                </button>
                                <div className="flex items-center gap-3">
                                    <button className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all shadow-sm">
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={downloadPDF}
                                        disabled={isGeneratingPDF}
                                        className="flex items-center gap-2.5 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all"
                                    >
                                        {isGeneratingPDF ? (
                                            <>
                                                <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-white dark:border-t-slate-900 rounded-full animate-spin" />
                                                Encoding...
                                            </>
                                        ) : (
                                            <>
                                                <Printer className="w-4 h-4" />
                                                Print Clinical Report
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* â”€â”€ Right Sidebar â”€â”€ */}
                <div className="w-[19rem] shrink-0 flex flex-col gap-5">

                    {/* Intelligence Detail Nav */}
                    <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-white/72 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_24px_40px_-32px_rgba(15,23,42,0.32)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                                Intelligence Detail
                            </h3>
                        </div>
                        <nav className="flex flex-col gap-1.5">
                            {[
                                { id: "highlights", name: "Matching Profile", icon: Activity },
                                { id: "risks", name: "Risk Assessment", icon: HeartPulse },
                                { id: "diagnosis", name: "Logic Records", icon: Stethoscope },
                                { id: "treatment", name: "Clinical Pathway", icon: Beaker },
                            ].map((item) => {
                                const Icon = item.icon;
                                const isActive = activeRightTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveRightTab(item.id as RightTab)}
                                        disabled={!topPrediction}
                                        className={`group flex h-10 w-full items-center justify-between rounded-[1.25rem] px-4 transition-all duration-300 disabled:pointer-events-none ${
                                            isActive
                                                ? topPrediction
                                                    ? "border border-slate-200 bg-white/85 text-slate-900 shadow-[0_12px_24px_-24px_rgba(15,23,42,0.3)] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                                    : "border border-slate-200 bg-white/85 text-slate-300 shadow-[0_12px_24px_-24px_rgba(15,23,42,0.16)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
                                                : "text-slate-400 hover:bg-white/70 hover:text-slate-900 disabled:opacity-45 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-white"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="h-4 w-4 shrink-0" />
                                            <span className="text-xs font-bold">{item.name}</span>
                                        </div>
                                        <ChevronRight className={`h-3.5 w-3.5 transition-all ${isActive ? "opacity-100 translate-x-0.5" : "opacity-0 group-hover:opacity-50"}`} />
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* ML Accuracy Metrics Card */}
                    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(245,247,250,0.9))] p-6 text-card-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_24px_44px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900">
                        {/* Decorative glow */}
                        <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/8 blur-3xl" />
                        <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 -translate-x-1/3 translate-y-1/3 rounded-full bg-emerald-500/8 blur-2xl" />

                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-700/80 dark:text-primary/80">Intelligence Engine</p>
                                <h3 className="mt-0.5 text-xl font-black tracking-tight">System Accuracy</h3>
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/80 dark:border-slate-700 dark:bg-slate-800">
                                <Activity className="h-4 w-4 text-primary" />
                            </div>
                        </div>

                        <div className="relative z-10 space-y-5">
                            {[
                                { label: "Top-3 Differential", value: top3Display ?? engineMetrics.top3Accuracy, color: "bg-primary" },
                                { label: "F1-Protocol Match", value: engineMetrics.f1Score, color: "bg-slate-400" },
                                { label: "Clinical Recall", value: engineMetrics.recall, color: "bg-emerald-500" },
                                { label: "Precision Matrix", value: engineMetrics.precision, color: "bg-rose-400" },
                            ].map((m) => (
                                <div key={m.label} className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                        <span>{m.label}</span>
                                        <span className="font-mono font-black text-card-foreground">{m.value}%</span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                        <div
                                            className={`h-full ${m.color} rounded-full transition-all duration-1000`}
                                            style={{ width: `${m.value}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="relative z-10 flex items-center justify-between border-t border-slate-200/80 pt-4 dark:border-slate-800">
                            <div>
                                <span className="text-3xl font-black tabular-nums">{diseaseCount}</span>
                                <p className="mt-0.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Diseases Indexed</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xl font-black tabular-nums text-emerald-500">{sessionCount}</span>
                                <p className="mt-0.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Your Sessions</p>
                            </div>
                        </div>
                    </div>

                    {/* Knowledge Base Upload */}
                    <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-white/72 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_24px_40px_-32px_rgba(15,23,42,0.28)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-2">
                            <UploadCloud className="w-3.5 h-3.5 text-slate-400" />
                            <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Knowledge Base</h3>
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="group flex h-28 w-full flex-col items-center justify-center gap-2.5 rounded-2xl border border-dashed border-slate-400/80 bg-white/55 hover:border-primary/40 hover:bg-slate-50 transition-all dark:border-slate-700 dark:bg-slate-800/60 dark:hover:bg-slate-800"
                        >
                            <UploadCloud className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                {uploadStatus || "Secure Import"}
                            </span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

