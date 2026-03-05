"use client";

import { useState, useEffect, useCallback } from "react";
import { clearHistory, getAllHistory } from "@/lib/history-store";

interface IntegrationStatus {
    name: string;
    envKey: string;
    status: string;
    connected: boolean;
    mode: string;
    description: string;
}

export default function SettingsPage() {
    const [mounted, setMounted] = useState(false);
    const [historyCount, setHistoryCount] = useState(0);
    const [cleared, setCleared] = useState(false);
    const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);

    const checkIntegrations = useCallback(async () => {
        try {
            const res = await fetch("/api/status");
            if (res.ok) {
                const data = await res.json();
                setIntegrations(data.integrations);
            }
        } catch {
            // Fallback
        }
    }, []);

    useEffect(() => {
        setMounted(true);
        setHistoryCount(getAllHistory().length);
        checkIntegrations();
    }, [checkIntegrations]);

    const handleClearHistory = () => {
        clearHistory();
        setHistoryCount(0);
        setCleared(true);
        setTimeout(() => setCleared(false), 2000);
    };

    if (!mounted) return null;

    const activeCount = integrations.filter((i) => i.connected || i.mode === "local" || i.mode === "seed" || i.mode === "active").length;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    <span className="neon-text">System</span>{" "}
                    <span className="text-foreground">Settings</span>
                </h1>
                <p className="text-sm text-[var(--muted-foreground)]">
                    Configure your NeuraMed dashboard and integrations.
                </p>
            </div>

            {/* System Health */}
            <div className="rounded-2xl neon-border neon-glow bg-[var(--cyber-surface)] p-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] flex items-center justify-center">
                        <svg className="w-7 h-7 text-[#10b981]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.745 3.745 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-[#10b981]">All Systems Operational</h2>
                        <p className="text-xs text-[var(--muted-foreground)]">
                            {activeCount} of {integrations.length} services active
                        </p>
                    </div>
                </div>
            </div>

            {/* Integration Status */}
            <div className="rounded-2xl neon-border bg-[var(--cyber-surface)] p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                        Service Status
                    </h2>
                    <button
                        onClick={checkIntegrations}
                        className="text-[10px] text-[var(--neon)] hover:text-foreground transition-colors px-3 py-1.5 rounded-lg neon-border hover:bg-[rgba(0,240,255,0.05)] uppercase tracking-wider font-bold"
                    >
                        Refresh
                    </button>
                </div>
                <div className="space-y-3">
                    {integrations.map((item) => {
                        const isActive = item.connected || item.mode === "local" || item.mode === "seed" || item.mode === "active";
                        const dotColor = item.connected
                            ? "bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                            : isActive
                                ? "bg-[#3b82f6] shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                : "bg-[var(--muted-foreground)]";

                        const statusColor = item.connected
                            ? "text-[#10b981] bg-[rgba(16,185,129,0.08)]"
                            : isActive
                                ? "text-[#3b82f6] bg-[rgba(59,130,246,0.08)]"
                                : "text-[var(--muted-foreground)] bg-[var(--cyber-surface)]";

                        return (
                            <div
                                key={item.name}
                                className="flex items-center justify-between p-4 rounded-xl bg-[var(--cyber-bg)] neon-border"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`} />
                                    <div className="min-w-0">
                                        <span className="text-sm font-medium text-foreground block">{item.name}</span>
                                        <span className="text-[10px] text-[var(--muted-foreground)]">{item.description}</span>
                                    </div>
                                </div>
                                <span
                                    className={`text-xs font-mono flex-shrink-0 px-2.5 py-1 rounded-md ${statusColor}`}
                                >
                                    {item.status}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Data Management */}
            <div className="rounded-2xl neon-border bg-[var(--cyber-surface)] p-6 space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Data Management
                </h2>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--cyber-bg)] neon-border">
                    <div>
                        <span className="text-sm font-medium text-foreground block">Local Prediction History</span>
                        <span className="text-[10px] text-[var(--muted-foreground)]">
                            {historyCount} prediction{historyCount !== 1 ? "s" : ""} stored in browser
                        </span>
                    </div>
                    <button
                        onClick={handleClearHistory}
                        disabled={historyCount === 0}
                        className={`text-xs font-medium px-4 py-2 rounded-lg transition-all duration-300 ${cleared
                            ? "bg-[rgba(16,185,129,0.1)] text-[#10b981] border border-[rgba(16,185,129,0.3)]"
                            : historyCount > 0
                                ? "neon-border text-[var(--destructive)] hover:bg-[rgba(255,62,108,0.05)] hover:border-[var(--destructive)]"
                                : "neon-border text-[var(--muted-foreground)] opacity-50 cursor-not-allowed"
                            }`}
                    >
                        {cleared ? "✓ Cleared" : "Clear All Data"}
                    </button>
                </div>
            </div>

            {/* System Info */}
            <div className="rounded-2xl neon-border bg-[var(--cyber-surface)] p-6 space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    System Information
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    {[
                        { label: "Engine", value: "NeuraMed v2.0" },
                        { label: "AI Model", value: "Llama 3.3 70B (Groq)" },
                        { label: "Framework", value: "Next.js 16" },
                        { label: "Disease Database", value: "18 diseases · 50 symptoms" },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className="p-3 rounded-xl bg-[var(--cyber-bg)] neon-border"
                        >
                            <span className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] font-medium block mb-1">
                                {item.label}
                            </span>
                            <span className="text-sm font-medium text-foreground font-mono">
                                {item.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
