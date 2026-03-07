"use client";

import { useState, useCallback } from "react";
import type { ModuleId } from "@/types/imaging";

interface UploadZoneProps {
  module: ModuleId;
  onFileSelected: (file: File) => void;
  isAnalyzing: boolean;
}

export function UploadZone({ module, onFileSelected, isAnalyzing }: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 50 * 1024 * 1024) return; // 50MB cap

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      onFileSelected(file);
    };
    reader.readAsDataURL(file);
  }, [onFileSelected]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const reset = () => setPreview(null);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={onDrop}
      className={`relative group h-72 rounded-[2rem] border-2 border-dashed transition-all duration-500
        flex flex-col items-center justify-center p-8 overflow-hidden cursor-pointer
        ${isAnalyzing ? "opacity-50 pointer-events-none" : ""}
        ${dragActive
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 hover:border-primary/50"
        }`}
    >
      {preview ? (
        <div className="relative w-full h-full rounded-xl overflow-hidden">
          <img src={preview} alt="Scan Preview" className="w-full h-full object-contain brightness-75" />
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/50">
            <p className="text-[10px] font-black uppercase tracking-widest text-white mb-3">Scan Loaded</p>
            <button
              onClick={(e) => { e.stopPropagation(); reset(); }}
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
            <p className="text-[10px] text-slate-400 mt-1">JPEG | PNG | WebP | Max 50MB</p>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
      )}

      {isAnalyzing && (
        <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center z-10">
          <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse">
            Neural Inference Active...
          </p>
        </div>
      )}
    </div>
  );
}
