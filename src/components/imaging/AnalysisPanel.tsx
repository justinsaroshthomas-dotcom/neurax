"use client";

import type { AnalysisResponse } from "@/types/imaging";
import { MODULE_MAP } from "@/lib/imaging";

interface AnalysisPanelProps {
  data: AnalysisResponse;
}

export function AnalysisPanel({ data }: AnalysisPanelProps) {
  const { result, report, module } = data;
  const meta = MODULE_MAP[module];
  const urgencyColor = report.urgency.color;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">

      {/* Primary Finding */}
      <div
        className="p-6 rounded-2xl border-2 relative overflow-hidden"
        style={{ borderColor: urgencyColor + "40", background: urgencyColor + "08" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{meta?.icon}</span>
              <span
                className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
                style={{ background: urgencyColor + "20", color: urgencyColor }}
              >
                {report.urgency.label}
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {result.predicted_class}
            </h2>
            <p className="text-sm text-slate-500 font-bold">{meta?.label} | {meta?.modality}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-4xl font-black text-primary">{result.confidence.toFixed(1)}%</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Confidence</p>
          </div>
        </div>
        {report.action && (
          <p className="mt-4 text-xs font-black text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50">
            {report.action}
          </p>
        )}
      </div>

      {/* Probability Distribution */}
      <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">
          Class Probability Distribution
        </p>
        <div className="space-y-3">
          {result.probabilities.map((p) => (
            <div key={p.class} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-black ${p.class === result.predicted_class ? "text-primary" : "text-slate-500"}`}>
                  {p.class === result.predicted_class && "\u2192 "}{p.class}
                </span>
                <span className="text-[10px] font-black text-slate-500">{p.probability.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    p.class === result.predicted_class ? "bg-primary" : "bg-slate-400 dark:bg-slate-600"
                  }`}
                  style={{ width: `${p.probability}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clinical Note */}
      {result.clinical_note && (
        <div className="p-5 rounded-2xl neon-border glass-card">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">
            Clinical Assessment
          </p>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
            {result.clinical_note}
          </p>
        </div>
      )}

      {/* Module-specific extras */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {result.cdr_score && (
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-center">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">CDR Score</p>
            <p className="text-lg font-black text-primary">{result.cdr_score}</p>
          </div>
        )}
        {result.mmse_range && (
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-center">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">MMSE Range</p>
            <p className="text-sm font-black text-slate-700 dark:text-slate-200">{result.mmse_range}</p>
          </div>
        )}
        {result.icd10_code && (
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-center">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">ICD-10</p>
            <p className="text-sm font-black text-slate-700 dark:text-slate-200">{result.icd10_code}</p>
          </div>
        )}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-center">
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Inference</p>
          <p className="text-sm font-black text-slate-700 dark:text-slate-200">{result.inference_ms}ms</p>
        </div>
      </div>

      {/* Imaging markers / CXR patterns / Radiological features */}
      {(result.imaging_markers || result.cxr_pattern || result.radiological_features) && (
        <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">
            Imaging Markers
          </p>
          <ul className="space-y-2">
            {(result.imaging_markers || result.cxr_pattern || result.radiological_features || []).map((marker, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{marker}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Time sensitivity alert */}
      {result.time_sensitivity && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
          <p className="text-xs font-black text-red-500">{result.time_sensitivity}</p>
        </div>
      )}

      {/* RT-PCR note */}
      {result.rt_pcr_note && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
          <p className="text-xs font-black text-amber-600 dark:text-amber-400">{result.rt_pcr_note}</p>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[9px] text-slate-400 font-bold text-center leading-relaxed px-8">
        {report.disclaimer}
      </p>
    </div>
  );
}
