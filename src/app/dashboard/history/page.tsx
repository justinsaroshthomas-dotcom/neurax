"use client";

import { useState, useEffect, useCallback } from "react";
import {
    getAllHistory,
    clearHistory,
    deleteHistoryEntry,
    type HistoryEntry,
} from "@/lib/history-store";

const severityConfig: Record<string, { color: string; label: string }> = {
    low: { color: "var(--severity-low)", label: "LOW" },
    medium: { color: "var(--severity-medium)", label: "MEDIUM" },
    high: { color: "var(--severity-high)", label: "HIGH" },
    critical: { color: "var(--severity-critical)", label: "CRITICAL" },
};

export default function HistoryPage() {
    const [entries, setEntries] = useState<HistoryEntry[]>([]);
    const [mounted, setMounted] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const refresh = useCallback(() => {
        setEntries(getAllHistory());
    }, []);

    useEffect(() => {
        setMounted(true);
        refresh();
    }, [refresh]);

    const handleClear = () => {
        clearHistory();
        setEntries([]);
        setExpandedId(null);
    };

    const handleDelete = (id: string) => {
        deleteHistoryEntry(id);
        refresh();
        if (expandedId === id) setExpandedId(null);
    };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (!mounted) return null;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        <span className="neon-text">Prediction</span>{" "}
                        <span className="text-foreground">History</span>
                    </h1>
                    <p className="text-sm text-[var(--muted-foreground)]">
                        View your past symptom analyses and prediction results.
                    </p>
                </div>

                {entries.length > 0 && (
                    <button
                        onClick={handleClear}
                        className="px-4 py-2 rounded-xl text-xs font-medium
                            neon-border text-[var(--muted-foreground)]
                            hover:text-[var(--destructive)] hover:border-[var(--destructive)]
                            transition-all duration-300"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {/* Entry Count */}
            {entries.length > 0 && (
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--neon)] animate-pulse" />
                    <span className="text-xs font-mono text-[var(--neon)]">
                        {entries.length} prediction{entries.length !== 1 ? "s" : ""} logged
                    </span>
                </div>
            )}

            {/* History Entries */}
            {entries.length > 0 ? (
                <div className="space-y-3">
                    {entries.map((entry) => {
                        const isExpanded = expandedId === entry.id;
                        const sev = severityConfig[entry.topSeverity] || severityConfig.low;
                        const confPercent = Math.round(entry.topConfidence * 100);

                        return (
                            <div
                                key={entry.id}
                                className="rounded-2xl neon-border bg-[var(--cyber-surface)] overflow-hidden transition-all duration-300 hover:bg-[var(--cyber-surface-2)]"
                            >
                                {/* Summary Row */}
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                                    className="w-full p-4 flex items-center gap-4 text-left cursor-pointer"
                                >
                                    {/* Confidence ring */}
                                    <div className="relative w-12 h-12 flex-shrink-0">
                                        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                                            <circle
                                                cx="18" cy="18" r="15.5"
                                                fill="none"
                                                stroke="var(--cyber-surface-2)"
                                                strokeWidth="3"
                                            />
                                            <circle
                                                cx="18" cy="18" r="15.5"
                                                fill="none"
                                                stroke={sev.color}
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeDasharray={`${confPercent} ${100 - confPercent}`}
                                            />
                                        </svg>
                                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-mono text-foreground">
                                            {confPercent}%
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className="text-sm font-bold text-foreground truncate">
                                                {entry.topDisease}
                                            </h3>
                                            <span
                                                className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0"
                                                style={{
                                                    color: sev.color,
                                                    backgroundColor: `color-mix(in srgb, ${sev.color} 12%, transparent)`,
                                                    border: `1px solid color-mix(in srgb, ${sev.color} 30%, transparent)`,
                                                }}
                                            >
                                                {sev.label}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-[var(--muted-foreground)] truncate">
                                            Symptoms: {entry.symptoms.join(", ")}
                                        </p>
                                    </div>

                                    {/* Timestamp */}
                                    <span className="text-[10px] text-[var(--muted-foreground)] font-mono flex-shrink-0 hidden sm:block">
                                        {formatDate(entry.timestamp)}
                                    </span>

                                    {/* Expand chevron */}
                                    <svg
                                        className={`w-4 h-4 text-[var(--muted-foreground)] transition-transform duration-200 flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                                        fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </button>

                                {/* Expanded Detail */}
                                {isExpanded && (
                                    <div className="border-t border-[rgba(0,240,255,0.08)] p-4 space-y-4">
                                        {/* AI Summary */}
                                        {entry.aiSummary && (
                                            <div className="space-y-1.5">
                                                <span className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] font-medium flex items-center gap-1.5">
                                                    <svg className="w-3 h-3 text-[var(--neon)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                                                    </svg>
                                                    AI Analysis
                                                </span>
                                                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed pl-4 border-l-2 border-[rgba(0,240,255,0.15)]">
                                                    {entry.aiSummary}
                                                </p>
                                            </div>
                                        )}

                                        {/* All Predictions */}
                                        <div className="space-y-2">
                                            <span className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] font-medium">
                                                All Predictions
                                            </span>
                                            <div className="grid gap-2 sm:grid-cols-2">
                                                {entry.predictions.map((p, i) => {
                                                    const ps = severityConfig[p.severity] || severityConfig.low;
                                                    return (
                                                        <div
                                                            key={i}
                                                            className="p-3 rounded-xl bg-[var(--cyber-bg)] neon-border flex items-center justify-between"
                                                        >
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                                                                    #{i + 1}
                                                                </span>
                                                                <span className="text-xs font-medium text-foreground truncate">
                                                                    {p.disease}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                                <span className="text-xs font-bold font-mono" style={{ color: ps.color }}>
                                                                    {Math.round(p.confidence * 100)}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Symptoms */}
                                        <div className="space-y-1.5">
                                            <span className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] font-medium">
                                                Reported Symptoms
                                            </span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {entry.symptoms.map((s) => (
                                                    <span
                                                        key={s}
                                                        className="text-[10px] px-2 py-0.5 rounded-md bg-[rgba(0,240,255,0.06)] text-[var(--neon-dim)] border border-[rgba(0,240,255,0.1)]"
                                                    >
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Delete */}
                                        <div className="flex justify-end pt-2">
                                            <button
                                                onClick={() => handleDelete(entry.id)}
                                                className="text-[10px] text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors px-3 py-1.5 rounded-lg hover:bg-[rgba(255,62,108,0.05)]"
                                            >
                                                Delete Entry
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-2xl neon-border bg-[var(--cyber-surface)] p-12 text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[var(--cyber-surface-2)] neon-border">
                        <svg className="w-8 h-8 text-[var(--neon-dim)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">No history yet</h3>
                    <p className="text-sm text-[var(--muted-foreground)] max-w-sm mx-auto">
                        Your prediction history will appear here once you run your first symptom analysis.
                        Go to the <span className="text-[var(--neon)]">Predict</span> page to get started.
                    </p>
                </div>
            )}
        </div>
    );
}
