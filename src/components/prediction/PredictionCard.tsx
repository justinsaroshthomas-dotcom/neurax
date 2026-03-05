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
            className={`relative rounded-2xl overflow-hidden transition-all duration-300
        ${isTop ? "ring-1 ring-[var(--neon)] neon-glow" : "neon-border"}
        bg-[var(--cyber-surface)] hover:bg-[var(--cyber-surface-2)]`}
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
                    rx="16"
                    ry="16"
                    className="prediction-border"
                    style={{ opacity: isTop ? 1 : 0.4 }}
                />
            </svg>

            <div className="relative z-10 p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            {isTop && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[rgba(0,240,255,0.1)] text-[var(--neon)] uppercase tracking-wider">
                                    Top Match
                                </span>
                            )}
                            <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                                #{rank}
                            </span>
                        </div>
                        <h3 className={`text-lg font-bold truncate ${isTop ? "neon-text-subtle" : "text-foreground"}`}>
                            {prediction.disease}
                        </h3>
                    </div>

                    {/* Severity Badge */}
                    <span
                        className="flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                        style={{
                            color: severity.color,
                            backgroundColor: `color-mix(in srgb, ${severity.color} 12%, transparent)`,
                            border: `1px solid color-mix(in srgb, ${severity.color} 30%, transparent)`,
                        }}
                    >
                        {severity.label}
                    </span>
                </div>

                {/* Description */}
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-2">
                    {prediction.description}
                </p>

                {/* Confidence Meter */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] font-medium">
                            Confidence
                        </span>
                        <span className="text-sm font-bold font-mono neon-text-subtle">
                            {confidencePercent}%
                        </span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--cyber-surface-2)] overflow-hidden">
                        <div
                            className="confidence-bar h-full"
                            style={{ width: `${confidencePercent}%` }}
                        />
                    </div>
                </div>

                {/* Matched Symptoms */}
                {prediction.matchedSymptoms.length > 0 && (
                    <div className="space-y-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] font-medium">
                            Matched Symptoms
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                            {prediction.matchedSymptoms.map((symptom) => (
                                <span
                                    key={symptom}
                                    className="text-[10px] px-2 py-0.5 rounded-md bg-[rgba(0,240,255,0.06)] text-[var(--neon-dim)] border border-[rgba(0,240,255,0.1)]"
                                >
                                    {symptom}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Precautions */}
                {prediction.precautions.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-[rgba(0,240,255,0.08)]">
                        <span className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] font-medium">
                            Precautions
                        </span>
                        <ul className="space-y-1">
                            {prediction.precautions.map((p, i) => (
                                <li
                                    key={i}
                                    className="text-xs text-[var(--muted-foreground)] flex items-start gap-2"
                                >
                                    <svg className="w-3 h-3 mt-0.5 text-[var(--neon)] flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                    {p}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
