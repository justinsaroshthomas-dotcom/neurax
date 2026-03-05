"use client";

import { useEffect, useRef } from "react";

export function ScanningAnimation() {
    const containerRef = useRef<HTMLDivElement>(null);
    const line1Ref = useRef<HTMLDivElement>(null);
    const line2Ref = useRef<HTMLDivElement>(null);

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
            className="relative rounded-2xl neon-border bg-[var(--cyber-surface)] p-8 overflow-hidden"
        >
            {/* Scan Lines */}
            <div
                ref={line1Ref}
                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--neon)] to-transparent opacity-0"
                style={{ filter: "blur(1px)", boxShadow: "0 0 15px var(--neon)" }}
            />
            <div
                ref={line2Ref}
                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,136,255,0.8)] to-transparent opacity-0"
                style={{ filter: "blur(1px)", boxShadow: "0 0 15px rgba(0,136,255,0.5)" }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-6 py-4">
                {/* Pulsing cross icon */}
                <div className="relative w-20 h-20 animate-pulse-neon rounded-2xl flex items-center justify-center neon-border">
                    <svg
                        viewBox="0 0 48 48"
                        className="w-12 h-12 text-[var(--neon)]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M24 8v32M8 24h32" strokeLinecap="round" />
                        <circle cx="24" cy="24" r="14" strokeDasharray="4 4" />
                    </svg>

                    {/* Corner dots */}
                    <div className="scan-dot absolute -top-1 -left-1 w-2 h-2 rounded-full bg-[var(--neon)]" />
                    <div className="scan-dot absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[var(--neon)]" />
                    <div className="scan-dot absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-[var(--neon)]" />
                    <div className="scan-dot absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-[var(--neon)]" />
                </div>

                {/* Text */}
                <div className="text-center space-y-2">
                    <p className="text-sm font-medium neon-text-subtle tracking-wider uppercase">
                        Analyzing Symptoms
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                        Cross-referencing symptom patterns against disease database...
                    </p>
                </div>

                {/* Progress dots */}
                <div className="flex gap-2">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="scan-dot w-1.5 h-1.5 rounded-full bg-[var(--neon)]"
                        />
                    ))}
                </div>

                {/* Shimmer bar */}
                <div className="w-64 h-1 rounded-full bg-[var(--cyber-surface-2)] overflow-hidden">
                    <div className="h-full w-full animate-shimmer" />
                </div>
            </div>
        </div>
    );
}
