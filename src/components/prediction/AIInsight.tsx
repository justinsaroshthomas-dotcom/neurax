"use client";

import { useEffect, useRef, useState } from "react";
import type { AIAnalysis } from "@/lib/groq";

interface AIInsightProps {
    analysis: AIAnalysis;
}

export function AIInsight({ analysis }: AIInsightProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [visibleText, setVisibleText] = useState("");
    const [isTypingDone, setIsTypingDone] = useState(false);

    // Typewriter effect for the summary
    useEffect(() => {
        const text = analysis.summary;
        let idx = 0;
        setVisibleText("");
        setIsTypingDone(false);

        const interval = setInterval(() => {
            idx++;
            setVisibleText(text.slice(0, idx));
            if (idx >= text.length) {
                clearInterval(interval);
                setIsTypingDone(true);
            }
        }, 12);

        return () => clearInterval(interval);
    }, [analysis.summary]);

    // Entrance animation
    useEffect(() => {
        const doAnimate = async () => {
            try {
                const { animate } = await import("animejs");
                if (containerRef.current) {
                    animate(containerRef.current, {
                        opacity: [0, 1],
                        translateY: [20, 0],
                        ease: "outExpo",
                        duration: 800,
                    });
                }
            } catch {
                // animejs may not be available during SSR
            }
        };
        doAnimate();
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative rounded-3xl overflow-hidden neon-border glass-card shadow-lg"
            style={{ opacity: 0 }}
        >
            {/* Ambient background glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            
            {/* Gradient accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/80 to-primary animate-shimmer" />

            <div className="p-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
                            <svg
                                viewBox="0 0 24 24"
                                className="w-6 h-6 text-primary drop-shadow-[0_0_8px_var(--neon-dim)]"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455-2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                                Neural Analysis Insight
                            </h3>
                            <p className="text-[10px] text-slate-500 dark:text-slate-500 font-extrabold uppercase tracking-[0.2em]">
                                Multi-Layer Perceptron (MLP) Engine
                            </p>
                        </div>
                    </div>
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 self-start sm:self-center">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">
                            High Precision Mode
                        </span>
                    </div>
                </div>

                {/* AI Summary — typewriter */}
                <div className="space-y-3 relative">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">
                            Synthesis
                        </span>
                        <div className="flex-1 h-px bg-slate-200/50 dark:bg-slate-800/50" />
                    </div>
                    <p className="text-xl text-slate-900 dark:text-slate-200 leading-relaxed font-bold">
                        {visibleText}
                        {!isTypingDone && (
                            <span className="inline-block w-2 h-6 bg-primary ml-1.5 animate-pulse align-middle" />
                        )}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    {/* Risk Assessment */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">
                                Risk Matrix
                            </span>
                            <div className="flex-1 h-px bg-slate-200/50 dark:bg-slate-800/50" />
                        </div>
                        <div className="p-5 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
                            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                                {analysis.riskAssessment}
                            </p>
                        </div>
                    </div>

                    {/* Recommended Actions */}
                    {analysis.recommendedActions.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">
                                    Clinical Protocol
                                </span>
                                <div className="flex-1 h-px bg-slate-200/50 dark:bg-slate-800/50" />
                            </div>
                            <div className="grid gap-3">
                                {analysis.recommendedActions.map((action, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 shadow-sm animate-in fade-in slide-in-from-right-4"
                                        style={{ animationDelay: `${i * 100}ms` }}
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                                            <span className="text-[11px] font-black text-primary">0{i + 1}</span>
                                        </div>
                                        <span className="text-base text-slate-800 dark:text-slate-200 font-bold leading-tight">
                                            {action}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Disclaimer */}
                <div className="pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 backdrop-blur-sm">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                            </svg>
                        </div>
                        <p className="text-[11px] text-amber-700/80 dark:text-amber-500/80 leading-relaxed font-bold italic">
                            {analysis.disclaimer}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
