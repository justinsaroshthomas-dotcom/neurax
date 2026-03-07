"use client";

import { useState, useCallback } from "react";

interface ImageScannerProps {
    onAnalysisComplete: (result: any) => void;
    onScanningStateChange: (isScanning: boolean) => void;
}

export function ImageScanner({ onAnalysisComplete, onScanningStateChange }: ImageScannerProps) {
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [scanType, setScanType] = useState<"chest_xray" | "mri_brain">("chest_xray");

    const handleFile = async (file: File) => {
        if (!file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64 = e.target?.result as string;
            setPreview(base64);
            
            // Start Neural Scan
            onScanningStateChange(true);
            try {
                const res = await fetch("http://localhost:5000/predict-image", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        image: base64,
                        scan_type: scanType
                    }),
                });

                if (!res.ok) throw new Error("Local engine failed");
                const result = await res.json();
                onAnalysisComplete(result);
            } catch (err) {
                console.error("[VisionEngine]", err);
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Scan Type Selector */}
            <div className="flex justify-center gap-4">
                {[
                    { id: "chest_xray", name: "Chest X-Ray", icon: "🫁" },
                    { id: "mri_brain", name: "MRI Brain", icon: "🧠" }
                ].map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setScanType(t.id as any)}
                        className={`px-6 py-4 rounded-3xl border-2 transition-all duration-300 flex items-center gap-3
                            ${scanType === t.id 
                                ? 'border-primary bg-primary/5 ring-4 ring-primary/10 shadow-[0_0_20px_var(--neon-glow)]' 
                                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30'}`}
                    >
                        <span className="text-xl">{t.icon}</span>
                        <span className="text-sm font-black uppercase tracking-widest">{t.name}</span>
                    </button>
                ))}
            </div>

            {/* Upload Zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={onDrop}
                className={`relative group h-96 rounded-[2.5rem] border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center p-8 overflow-hidden
                    ${dragActive 
                        ? "border-primary bg-primary/5 scale-[1.02]" 
                        : "border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20"}`}
            >
                {preview ? (
                    <div className="relative w-full h-full rounded-2xl overflow-hidden group">
                        <img src={preview} alt="Scan Preview" className="w-full h-full object-contain brightness-75 group-hover:brightness-90 transition-all" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/40">
                            <button 
                                onClick={() => setPreview(null)}
                                className="px-6 py-2 rounded-full bg-red-500 text-white font-black text-xs uppercase tracking-widest hover:scale-110 transition-transform"
                            >
                                Discard Scan
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                            <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 italic">
                            UPLOAD <span className="text-primary not-italic">CLINICAL SCAN</span>
                        </h3>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
                            Drag & drop X-Ray or MRI file
                        </p>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                )}

                {/* Cyber Grid Overlay */}
                <div className="absolute inset-0 pointer-events-none cyber-grid opacity-20" />
            </div>

            {/* Tech Disclaimer */}
            <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-start gap-4">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Confidential Protocol</p>
                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                        Imaging data is processed locally within the workstation memory. No data is transmitted outside the secure terminal. AI analysis is secondary to qualified radiological review.
                    </p>
                </div>
            </div>
        </div>
    );
}
