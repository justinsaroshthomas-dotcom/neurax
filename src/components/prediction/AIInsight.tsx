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

    // Anime.js entrance animation
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
            className="relative rounded-2xl overflow-hidden neon-border bg-[var(--cyber-surface)]"
            style={{ opacity: 0 }}
        >
            {/* Gradient accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-[var(--neon)] via-[rgba(0,136,255,0.8)] to-[var(--neon)]" />

            <div className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[rgba(0,240,255,0.08)] neon-border flex items-center justify-center">
                            <svg
                                viewBox="0 0 24 24"
                                className="w-5 h-5 text-[var(--neon)]"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold neon-text-subtle tracking-wide">
                                NeuraMed AI Analysis
                            </h3>
                            <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">
                                Powered by Groq · Llama 3.3
                            </p>
                        </div>
                    </div>
                    <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-[rgba(0,240,255,0.1)] text-[var(--neon)] uppercase tracking-wider border border-[rgba(0,240,255,0.2)]">
                        AI Powered
                    </span>
                </div>

                {/* AI Summary — typewriter */}
                <div className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] font-medium">
                        Analysis Summary
                    </span>
                    <p className="text-sm text-foreground leading-relaxed font-light">
                        {visibleText}
                        {!isTypingDone && (
                            <span className="inline-block w-0.5 h-4 bg-[var(--neon)] ml-0.5 animate-pulse align-middle" />
                        )}
                    </p>
                </div>

                {/* Risk Assessment */}
                <div className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] font-medium flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-[var(--severity-high)]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>
                        Risk Assessment
                    </span>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed pl-4 border-l-2 border-[rgba(0,240,255,0.15)]">
                        {analysis.riskAssessment}
                    </p>
                </div>

                {/* Recommended Actions */}
                {analysis.recommendedActions.length > 0 && (
                    <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] font-medium">
                            Recommended Actions
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {analysis.recommendedActions.map((action, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--cyber-surface-2)] border border-[rgba(0,240,255,0.06)]"
                                >
                                    <span className="text-[10px] font-bold font-mono text-[var(--neon)] mt-0.5 flex-shrink-0 w-5 h-5 rounded-md bg-[rgba(0,240,255,0.1)] flex items-center justify-center">
                                        {i + 1}
                                    </span>
                                    <span className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                                        {action}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Disclaimer */}
                <div className="pt-3 border-t border-[rgba(0,240,255,0.08)]">
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-[rgba(255,200,50,0.03)] border border-[rgba(255,200,50,0.1)]">
                        <svg className="w-3.5 h-3.5 text-[rgba(255,200,50,0.7)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>
                        <p className="text-[10px] text-[rgba(255,200,50,0.6)] leading-relaxed">
                            {analysis.disclaimer}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
