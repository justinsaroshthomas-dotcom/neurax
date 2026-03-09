"use client";

import { useState, useEffect } from "react";

interface ScanTypeOption {
    id: string;
    name: string;
    classes: string[];
    model_type: string;
    accuracy: number;
}

interface ImageScannerProps {
    onAnalysisComplete: (result: any) => void;
    onScanningStateChange: (isScanning: boolean) => void;
    onError: (message: string) => void;
}

const SCAN_ICONS: Record<string, string> = {
    chest_xray: "🫁",
    lung_disease: "🫀",
    mri_brain_tumor: "🧠",
    mri_alzheimer: "🔬",
    mri_spine: "🦴",
    mri_neuro: "⚡",
};

const DEFAULT_SCAN_TYPES: ScanTypeOption[] = [
    { id: "chest_xray", name: "Chest X-Ray (COVID/Pneumonia)", classes: ["Normal", "Pneumonia", "COVID-19"], model_type: "XGBoost + Texture Analysis", accuracy: 0.984 },
    { id: "lung_disease", name: "Lung Disease Ensemble", classes: ["Low Risk", "Medium Risk", "High Risk"], model_type: "XGBoost + RF + AdaBoost", accuracy: 0.999 },
    { id: "mri_brain_tumor", name: "Brain Tumor MRI", classes: ["Glioma", "Meningioma", "Pituitary", "No Tumor"], model_type: "Random Forest + Feature Extraction", accuracy: 0.990 },
    { id: "mri_alzheimer", name: "Alzheimer's MRI", classes: ["Non Demented", "Very Mildly Demented", "Mildly Demented", "Moderately Demented"], model_type: "Gradient Boosting + Radiomics", accuracy: 0.978 },
    { id: "mri_spine", name: "Lumbar Spine (RSNA)", classes: ["Normal", "Stenosis", "Spondylolisthesis"], model_type: "SVM + Structured Features", accuracy: 0.945 },
    { id: "mri_neuro", name: "Neuroimaging Panel", classes: ["Healthy", "Bipolar", "Schizophrenia", "ADHD", "Autism"], model_type: "XGBoost + Wavelet Features", accuracy: 0.962 },
];

export function ImageScanner({ onAnalysisComplete, onScanningStateChange, onError }: ImageScannerProps) {
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [scanType, setScanType] = useState("chest_xray");
    const [scanTypes, setScanTypes] = useState<ScanTypeOption[]>(DEFAULT_SCAN_TYPES);
    const [serverOnline, setServerOnline] = useState<boolean | null>(null);

    const activeScan = scanTypes.find(s => s.id === scanType) ?? scanTypes[0];

    // Probe server health on mount
    useEffect(() => {
        const probe = async () => {
            try {
                const res = await fetch("http://127.0.0.1:5000/health", { signal: AbortSignal.timeout(2000) });
                if (res.ok) {
                    setServerOnline(true);
                    // Load server-provided scan types
                    const typesRes = await fetch("http://127.0.0.1:5000/scan-types", { signal: AbortSignal.timeout(2000) });
                    if (typesRes.ok) {
                        const data = await typesRes.json();
                        setScanTypes(data);
                    }
                } else {
                    setServerOnline(false);
                }
            } catch {
                setServerOnline(false);
            }
        };
        probe();
    }, []);

    const handleFile = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            onError("Please upload a valid image file (JPEG, PNG, WebP).");
            return;
        }
        if (file.size > 15 * 1024 * 1024) {
            onError("File too large. Maximum scan size is 15MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64 = e.target?.result as string;
            setPreview(base64);
            onScanningStateChange(true);

            try {
                const res = await fetch("http://127.0.0.1:5000/predict-image", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ image: base64, scan_type: scanType }),
                    signal: AbortSignal.timeout(30000),
                });
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || `Server error ${res.status}`);
                }
                const result = await res.json();
                onAnalysisComplete(result);
            } catch (err: any) {
                if (err.name === "TimeoutError") {
                    onError("ML engine timeout. Ensure the local Python server is running.");
                } else {
                    onError(err?.message ?? "Connection to local ML engine failed. Is server.py running?");
                }
            } finally {
                onScanningStateChange(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Server Status Banner */}
            {serverOnline === false && (
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                    <p className="text-xs font-black uppercase tracking-widest">
                        Local ML Engine Offline — Run <code className="bg-red-500/20 px-2 py-0.5 rounded text-[10px]">python ml/server.py</code>
                    </p>
                </div>
            )}
            {serverOnline === true && (
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                    <p className="text-xs font-black uppercase tracking-widest">
                        ML Engine Online — 6 Imaging Modules Active — 30+ Disease Classes
                    </p>
                </div>
            )}

            {/* Model Selector */}
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">
                    Select Imaging Module
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {scanTypes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setScanType(t.id)}
                            className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left group
                                ${scanType === t.id
                                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-lg"
                                    : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:border-primary/40"
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">{SCAN_ICONS[t.id] ?? "🩺"}</span>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                    scanType === t.id ? "bg-primary/20 text-primary" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                                }`}>
                                    {Math.round(t.accuracy * 100)}%
                                </span>
                            </div>
                            <p className="text-[11px] font-black text-slate-800 dark:text-slate-100 leading-tight">
                                {t.name}
                            </p>
                            <p className="text-[9px] text-slate-400 font-bold mt-1 truncate">
                                {t.model_type}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Active Model Details */}
            {activeScan && (
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                    <span className="text-2xl">{SCAN_ICONS[activeScan.id] ?? "🩺"}</span>
                    <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 truncate">
                            {activeScan.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold truncate">
                            Classes: {activeScan.classes.slice(0, 3).join(" · ")}{activeScan.classes.length > 3 ? ` +${activeScan.classes.length - 3}` : ""}
                        </p>
                    </div>
                    <div className="ml-auto flex-shrink-0 text-right">
                        <span className="text-xs font-black text-primary">{Math.round(activeScan.accuracy * 100)}%</span>
                        <p className="text-[9px] text-slate-400 font-bold">Accuracy</p>
                    </div>
                </div>
            )}

            {/* Upload Zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={onDrop}
                className={`relative group h-72 rounded-[2rem] border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center p-8 overflow-hidden cursor-pointer
                    ${dragActive
                        ? "border-primary bg-primary/5 scale-[1.01]"
                        : "border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 hover:border-primary/50 hover:bg-primary/[0.02]"
                    }`}
            >
                {preview ? (
                    <div className="relative w-full h-full rounded-xl overflow-hidden group">
                        <img src={preview} alt="Scan Preview" className="w-full h-full object-contain brightness-75 group-hover:brightness-90 transition-all" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/50">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white mb-3">Scan Loaded</p>
                            <button
                                onClick={(e) => { e.stopPropagation(); setPreview(null); }}
                                className="px-5 py-2 rounded-full bg-red-500 text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
                            >
                                Discard
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500">
                            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 italic">
                                UPLOAD <span className="text-primary not-italic">CLINICAL SCAN</span>
                            </h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                                Drag & drop X-Ray, MRI, or CT scan
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">JPEG · PNG · WebP · Max 15MB</p>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                )}
                <div className="absolute inset-0 pointer-events-none cyber-grid opacity-10" />
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-3 px-5 py-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                    All imaging data processed locally. Zero data retention. Zero external transmission. Analysis is supplementary to qualified radiological review.
                </p>
            </div>
        </div>
    );
}
