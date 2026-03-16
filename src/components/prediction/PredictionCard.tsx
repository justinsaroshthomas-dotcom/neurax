"use client";

import { useEffect, useRef } from "react";
import type { PredictionResult } from "@/app/dashboard/page";

interface PredictionCardProps {
    prediction: PredictionResult;
    rank: number;
    isTop: boolean;
}

const severityConfig = {
    low: { color: "var(--severity-low)", label: "LOW" },
    medium: { color: "var(--severity-medium)", label: "MEDIUM" },
    high: { color: "var(--severity-high)", label: "HIGH" },
    critical: { color: "var(--severity-critical)", label: "CRITICAL" },
};

export function PredictionCard({ prediction, rank, isTop }: PredictionCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGRectElement>(null);
    const severity = severityConfig[prediction.severity];
    const confidencePercent = Math.round(prediction.confidence * 100);

    // Anime.js border-draw animation
    useEffect(() => {
        let animation: ReturnType<typeof import("animejs")["animate"]> | null = null;

        const doAnimate = async () => {
            try {
                const { animate } = await import("animejs");
                if (svgRef.current) {
                    const rect = svgRef.current;
                    const length = rect.getTotalLength();
                    rect.style.strokeDasharray = `${length}`;
                    rect.style.strokeDashoffset = `${length}`;

                    animation = animate(rect, {
                        strokeDashoffset: [length, 0],
                        ease: "inOutSine",
                        duration: 1500,
                        loop: false,
                    });
                }
            } catch {
                // animejs may not be available during SSR
            }
        };

        doAnimate();

        return () => {
            if (animation) {
                try { animation.pause(); } catch { /* noop */ }
            }
        };
    }, []);

    return (
        <div
            ref={cardRef}
            className={`relative rounded-3xl overflow-hidden transition-all duration-500 group
        ${isTop ? "ring-2 ring-primary/20 dark:ring-primary/40 neon-glow scale-[1.02]" : "neon-border"}
        glass-card hover:translate-y-[-4px] hover:shadow-xl hover:shadow-primary/5`}
        >
            {/* SVG Border Animation */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <rect
                    ref={svgRef}
                    x="1"
                    y="1"
                    width="calc(100% - 2px)"
                    height="calc(100% - 2px)"
                    rx="24"
                    ry="24"
                    className="prediction-border stroke-primary"
                    strokeWidth="2"
                    fill="none"
                    style={{ opacity: isTop ? 1 : 0.2 }}
                />
            </svg>

            <div className="relative z-10 p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            {isTop && (
                                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-primary/15 text-primary uppercase tracking-widest border border-primary/20">
                                    Top Match
                                </span>
                            )}
                            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-bold">
                                MATCH #{rank}
                            </span>
                        </div>
                        <h3 className={`text-3xl font-black tracking-tight ${isTop ? "text-primary dark:text-primary" : "text-slate-900 dark:text-slate-100"}`}>
                            {prediction.disease}
                        </h3>
                    </div>

                    {/* Severity Badge */}
                    <div
                        className="flex-shrink-0 px-4 py-2 rounded-full border shadow-sm transition-transform group-hover:scale-110"
                        style={{
                            color: severity.color,
                            backgroundColor: `color-mix(in srgb, ${severity.color} 10%, transparent)`,
                            borderColor: `color-mix(in srgb, ${severity.color} 30%, transparent)`,
                        }}
                    >
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] leading-none">
                            {severity.label}
                        </span>
                    </div>
                </div>

                {/* Description */}
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                    {prediction.description}
                </p>

                {/* Confidence Meter */}
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-[0.15em] text-slate-500 font-black">
                            Match Confidence
                        </span>
                        <span className="text-2xl font-black font-mono text-primary italic">
                            {confidencePercent}%
                        </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800/50 p-0.5 border border-slate-200/20 dark:border-slate-800/30 overflow-hidden relative">
                        <div
                            className="confidence-bar h-full rounded-full relative z-10"
                            style={{ 
                                width: `${confidencePercent}%`,
                                background: isTop ? undefined : `var(--neon-dim)` 
                            }}
                        />
                        <div className="absolute inset-0 bg-primary/5 animate-shimmer" />
                    </div>
                </div>

                {/* Matched Symptoms */}
                {prediction.matchedSymptoms.length > 0 && (
                    <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                            Clinical Correlations
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {prediction.matchedSymptoms.map((symptom) => (
                                <span
                                    key={symptom}
                                    className="text-[10px] px-2.5 py-1 rounded-lg bg-white/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/50 font-medium"
                                >
                                    {symptom}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Precautions */}
                {prediction.precautions.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                            Medical Protocol
                        </span>
                        <ul className="grid gap-2">
                            {prediction.precautions.map((p, i) => (
                                <li
                                    key={i}
                                    className="text-base text-slate-700 dark:text-slate-300 flex items-start gap-3 font-semibold"
                                >
                                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 border border-primary/20">
                                        <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth="4" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                    </div>
                                    <span className="mt-0.5 leading-snug">{p}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
