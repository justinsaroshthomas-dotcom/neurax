"use client";

import { useState, useEffect, useRef } from "react";
import { computeAnalytics, type AnalyticsData } from "@/lib/history-store";

const severityColors: Record<string, string> = {
    low: "var(--severity-low)",
    medium: "var(--severity-medium)",
    high: "var(--severity-high)",
    critical: "var(--severity-critical)",
};

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [mounted, setMounted] = useState(false);
    const barRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        setMounted(true);
        setData(computeAnalytics());
    }, []);

    // Animate bars on mount
    useEffect(() => {
        if (!data || data.totalPredictions === 0) return;
        const doAnimate = async () => {
            try {
                const { animate, stagger } = await import("animejs");
                const bars = barRefs.current.filter(Boolean);
                if (bars.length > 0) {
                    animate(bars, {
                        scaleX: [0, 1],
                        ease: "outExpo",
                        duration: 800,
                        delay: stagger(80),
                    });
                }
            } catch { /* noop */ }
        };
        doAnimate();
    }, [data]);

    if (!mounted) return null;

    const isEmpty = !data || data.totalPredictions === 0;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    <span className="neon-text">Analytics</span>{" "}
                    <span className="text-foreground">Overview</span>
                </h1>
                <p className="text-sm text-[var(--muted-foreground)]">
                    Insights from prediction data and system performance metrics.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                {[
                    {
                        label: "Total Predictions",
                        value: isEmpty ? "0" : data.totalPredictions.toString(),
                        icon: "M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5",
                    },
                    {
                        label: "Diseases Detected",
                        value: isEmpty ? "0" : data.uniqueDiseases.toString(),
                        icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126Z",
                    },
                    {
                        label: "Avg Confidence",
                        value: isEmpty ? "0%" : `${Math.round(data.avgConfidence * 100)}%`,
                        icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75Z",
                    },
                ].map((stat) => (
                    <div key={stat.label} className="rounded-xl neon-border bg-[var(--cyber-surface)] p-6 space-y-3">
                        <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                            </svg>
                            <span className="text-xs uppercase tracking-wider font-medium">{stat.label}</span>
                        </div>
                        <p className="text-3xl font-bold neon-text-subtle">{stat.value}</p>
                    </div>
                ))}
            </div>

            {isEmpty ? (
                <div className="rounded-2xl neon-border bg-[var(--cyber-surface)] p-12 text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[var(--cyber-surface-2)] neon-border">
                        <svg className="w-8 h-8 text-[var(--neon-dim)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">No data yet</h3>
                    <p className="text-sm text-[var(--muted-foreground)] max-w-sm mx-auto">
                        Run symptom analyses on the <span className="text-[var(--neon)]">Predict</span> page to start generating analytics data.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Top Diseases */}
                    <div className="rounded-2xl neon-border bg-[var(--cyber-surface)] p-6 space-y-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-2">
                            <svg className="w-4 h-4 text-[var(--neon)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                            </svg>
                            Top Diseases Detected
                        </h2>
                        <div className="space-y-3">
                            {data.topDiseases.map((d, i) => {
                                const maxCount = data.topDiseases[0]?.count || 1;
                                const pct = (d.count / maxCount) * 100;
                                return (
                                    <div key={d.name} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-foreground">{d.name}</span>
                                            <span className="text-[10px] font-mono text-[var(--neon)]">{d.count}×</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-[var(--cyber-surface-2)] overflow-hidden">
                                            <div
                                                ref={(el) => { barRefs.current[i] = el; }}
                                                className="h-full rounded-full origin-left"
                                                style={{
                                                    width: `${pct}%`,
                                                    background: `linear-gradient(90deg, var(--neon) 0%, rgba(0,136,255,0.8) 100%)`,
                                                    boxShadow: "0 0 10px rgba(0,240,255,0.3)",
                                                    transform: "scaleX(0)",
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Symptom Frequency */}
                    <div className="rounded-2xl neon-border bg-[var(--cyber-surface)] p-6 space-y-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-2">
                            <svg className="w-4 h-4 text-[var(--neon)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                            </svg>
                            Most Reported Symptoms
                        </h2>
                        <div className="space-y-3">
                            {data.symptomFrequency.map((s) => {
                                const maxCount = data.symptomFrequency[0]?.count || 1;
                                const pct = (s.count / maxCount) * 100;
                                return (
                                    <div key={s.name} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-foreground">{s.name}</span>
                                            <span className="text-[10px] font-mono text-[var(--muted-foreground)]">{s.count}×</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-[var(--cyber-surface-2)] overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000"
                                                style={{
                                                    width: `${pct}%`,
                                                    background: "rgba(0,240,255,0.4)",
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Severity Breakdown */}
                    <div className="rounded-2xl neon-border bg-[var(--cyber-surface)] p-6 space-y-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-2">
                            <svg className="w-4 h-4 text-[var(--neon)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Z" />
                            </svg>
                            Severity Breakdown
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {(["low", "medium", "high", "critical"] as const).map((sev) => {
                                const count = data.severityBreakdown[sev] || 0;
                                const pct = data.totalPredictions > 0 ? Math.round((count / data.totalPredictions) * 100) : 0;
                                const color = severityColors[sev];
                                return (
                                    <div
                                        key={sev}
                                        className="p-4 rounded-xl bg-[var(--cyber-bg)] neon-border text-center space-y-1"
                                    >
                                        <span className="text-2xl font-bold font-mono" style={{ color }}>
                                            {count}
                                        </span>
                                        <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color }}>
                                            {sev}
                                        </p>
                                        <p className="text-[10px] text-[var(--muted-foreground)]">{pct}%</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="rounded-2xl neon-border bg-[var(--cyber-surface)] p-6 space-y-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-2">
                            <svg className="w-4 h-4 text-[var(--neon)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                            </svg>
                            Last 7 Days
                        </h2>
                        <div className="flex items-end gap-2 h-32">
                            {data.recentActivity.map((day) => {
                                const maxDay = Math.max(...data.recentActivity.map((d) => d.count), 1);
                                const height = day.count > 0 ? Math.max((day.count / maxDay) * 100, 8) : 4;
                                const dayLabel = new Date(day.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });
                                return (
                                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                                        <span className="text-[9px] font-mono text-[var(--neon)]">
                                            {day.count > 0 ? day.count : ""}
                                        </span>
                                        <div
                                            className="w-full rounded-t-md transition-all duration-700"
                                            style={{
                                                height: `${height}%`,
                                                background: day.count > 0
                                                    ? "linear-gradient(180deg, var(--neon) 0%, rgba(0,136,255,0.4) 100%)"
                                                    : "var(--cyber-surface-2)",
                                                boxShadow: day.count > 0 ? "0 0 10px rgba(0,240,255,0.2)" : "none",
                                            }}
                                        />
                                        <span className="text-[9px] text-[var(--muted-foreground)]">{dayLabel}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
