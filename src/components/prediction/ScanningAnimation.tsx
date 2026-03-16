"use client";

import { useEffect, useRef } from "react";
import { useCatalogSummary } from "@/lib/use-catalog";

export function ScanningAnimation() {
    const containerRef = useRef<HTMLDivElement>(null);
    const line1Ref = useRef<HTMLDivElement>(null);
    const line2Ref = useRef<HTMLDivElement>(null);
    const { data: catalogSummary } = useCatalogSummary();

    useEffect(() => {
        const doAnimate = async () => {
            try {
                const { animate, stagger } = await import("animejs");

                // Scan line sweep
                if (line1Ref.current) {
                    animate(line1Ref.current, {
                        translateY: ["-100%", "500%"],
                        opacity: [0, 1, 1, 0],
                        ease: "inOutQuad",
                        duration: 2000,
                        loop: true,
                    });
                }

                if (line2Ref.current) {
                    animate(line2Ref.current, {
                        translateY: ["500%", "-100%"],
                        opacity: [0, 1, 1, 0],
                        ease: "inOutQuad",
                        duration: 2500,
                        loop: true,
                        delay: 400,
                    });
                }

                // Pulse the data points
                if (containerRef.current) {
                    const dots = containerRef.current.querySelectorAll(".scan-dot");
                    if (dots.length > 0) {
                        animate(dots, {
                            scale: [0, 1.2, 1],
                            opacity: [0, 1, 0.6],
                            ease: "outElastic(1, .6)",
                            duration: 800,
                            delay: stagger(100, { from: "center" }),
                            loop: true,
                            loopDelay: 1000,
                        });
                    }
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
            className="relative rounded-3xl neon-border glass-card p-12 overflow-hidden animate-float"
        >
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

            {/* Scan Lines */}
            <div
                ref={line1Ref}
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 z-20"
                style={{ filter: "blur(0.5px)", boxShadow: "0 0 20px var(--neon)" }}
            />
            <div
                ref={line2Ref}
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 z-20"
                style={{ filter: "blur(1px)", boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)" }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-8 py-6">
                {/* Central Scanner Visual */}
                <div className="relative">
                    <div className="w-24 h-24 animate-pulse-neon rounded-2xl flex items-center justify-center bg-white/50 dark:bg-slate-900/50 border border-white/20 dark:border-slate-800/50 shadow-inner">
                        <svg
                            viewBox="0 0 24 24"
                            className="w-12 h-12 text-primary drop-shadow-[0_0_8px_var(--neon-dim)]"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        >
                            <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="12" r="7" strokeDasharray="2 3" />
                        </svg>

                        {/* Corner markers */}
                        <div className="scan-dot absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full border-2 border-primary bg-white dark:bg-slate-900" />
                        <div className="scan-dot absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full border-2 border-primary bg-white dark:bg-slate-900" />
                        <div className="scan-dot absolute -bottom-1.5 -left-1.5 w-3 h-3 rounded-full border-2 border-primary bg-white dark:bg-slate-900" />
                        <div className="scan-dot absolute -bottom-1.5 -right-1.5 w-3 h-3 rounded-full border-2 border-primary bg-white dark:bg-slate-900" />
                    </div>
                    
                    {/* Outer rings */}
                    <div className="absolute inset-0 w-24 h-24 border border-primary/20 rounded-2xl scale-125 animate-ping opacity-20 pointer-events-none" />
                </div>

                {/* Status Text */}
                <div className="text-center space-y-3 max-w-[280px]">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-1">
                        <span className="text-[10px] font-bold text-primary tracking-widest uppercase animate-pulse">
                            Processing
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                        Analyzing Neural Patterns
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        Consulting the {catalogSummary?.counts.diseases ?? 0}-disease local knowledge base for clinical correlation...
                    </p>
                </div>

                {/* Progress Visualizer */}
                <div className="flex flex-col items-center gap-4 w-full">
                    <div className="flex gap-3">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="scan-dot w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_var(--neon-dim)] animate-bounce"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            />
                        ))}
                    </div>

                    <div className="w-full max-w-xs h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative border border-slate-200/50 dark:border-slate-800/50">
                        <div className="absolute inset-0 bg-primary/20 animate-shimmer" />
                    </div>
                </div>
            </div>
        </div>
    );
}
