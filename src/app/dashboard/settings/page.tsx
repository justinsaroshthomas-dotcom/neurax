"use client";

import { useState, useEffect } from "react";
import { useUser, UserProfile } from "@clerk/nextjs";
import { useTheme } from "next-themes";

export default function SettingsPage() {
    const { user, isLoaded } = useUser();
    const { theme, setTheme } = useTheme();
    const [historyCount, setHistoryCount] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        try {
            const raw = localStorage.getItem("neurax_history");
            const history = raw ? JSON.parse(raw) : [];
            setHistoryCount(history.length);
        } catch {
            setHistoryCount(0);
        }
    }, []);

    const handleClearHistory = () => {
        localStorage.removeItem("neurax_history");
        setHistoryCount(0);
    };

    if (!mounted || !isLoaded) return null;

    const themes = [
        { id: "emerald", name: "Emerald", color: "#00B140", desc: "Clinical Precision" },
        { id: "midnight", name: "Midnight", color: "#8b5cf6", desc: "Neural Deep Dark" },
        { id: "cyber", name: "Cyber", color: "#f59e0b", desc: "Cybernetic Gold" },
        { id: "corporate", name: "Corporate", color: "#2563eb", desc: "IBM Tactical Blue" },
        { id: "ultraviolet", name: "Ultraviolet", color: "#7c3aed", desc: "Digital Violet" },
        { id: "crimson", name: "Crimson", color: "#dc2626", desc: "Emergency Red" },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="pb-6 border-b border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-slate-100 italic">
                        CONTROL <span className="text-primary not-italic">CENTER</span>
                    </h1>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-2">Neural OS — Tactical Configuration</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_var(--neon)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Responsive</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Account & Themes */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Account Section */}
                    <div className="glass-card neon-border overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <span className="text-8xl grayscale">👤</span>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-1.5 h-10 bg-primary rounded-full shadow-[0_0_15px_var(--neon)]" />
                                <h2 className="text-xl font-black tracking-tight uppercase">Identity Management</h2>
                            </div>
                            
                            <div className="flex items-center gap-6 p-6 rounded-3xl bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200/50 dark:border-slate-800/50">
                                <div className="w-20 h-20 rounded-full border-4 border-primary/20 p-1 relative">
                                    <img 
                                        src={user?.imageUrl} 
                                        alt="pfp" 
                                        className="w-full h-full rounded-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary border-4 border-white dark:border-slate-950 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-2xl font-black truncate">{user?.fullName || user?.username}</h3>
                                    <p className="text-sm font-bold text-slate-500 tracking-tight">{user?.primaryEmailAddress?.emailAddress}</p>
                                    <div className="mt-3 flex gap-2">
                                        <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase text-primary tracking-widest">
                                            Authenticated via Clerk
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-primary/50 transition-all group">
                                    <p className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Security Protocol</p>
                                    <p className="text-sm font-bold mt-1">Multi-Factor Active</p>
                                </button>
                                <button className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-primary/50 transition-all group">
                                    <p className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Global Access</p>
                                    <p className="text-sm font-bold mt-1">Primary Access Token</p>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Theme Section */}
                    <div className="glass-card neon-border p-8 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-10 bg-primary rounded-full shadow-[0_0_15px_var(--neon)]" />
                            <h2 className="text-xl font-black tracking-tight uppercase">Visual Neural Overrides</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {themes.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setTheme(t.id)}
                                    className={`relative p-5 rounded-3xl border-2 transition-all duration-500 text-left overflow-hidden group
                                        ${theme === t.id ? 'border-primary bg-primary/5 ring-4 ring-primary/10 shadow-[0_0_20px_var(--neon-glow)]' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30'}`}
                                >
                                    <div 
                                        className="w-8 h-8 rounded-full mb-3 shadow-lg group-hover:scale-110 transition-transform" 
                                        style={{ backgroundColor: t.color }} 
                                    />
                                    <p className="text-sm font-black tracking-tight">{t.name}</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{t.desc}</p>
                                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Metrics & Danger Zone */}
                <div className="space-y-8">
                    {/* ML Analytics */}
                    <div className="glass-card neon-border p-8 space-y-8 h-full">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">ML Engine</h2>
                            <span className="text-[10px] font-black text-primary px-2 py-0.5 rounded-lg bg-primary/10 italic">ACTIVE</span>
                        </div>

                        <div className="space-y-6">
                            {[
                                { label: "Precision", value: "99.87%" },
                                { label: "F1 Score", value: "99.87%" },
                                { label: "Latent Bias", value: "< 0.005" },
                            ].map((m) => (
                                <div key={m.label} className="flex items-center justify-between group">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{m.label}</span>
                                    <span className="text-lg font-black font-mono italic text-primary group-hover:scale-110 transition-transform">{m.value}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 space-y-6 border-t border-slate-200/50 dark:border-slate-800/50">
                            <div className="flex items-center justify-between">
                                <div className="text-center flex-1">
                                    <p className="text-2xl font-black tracking-tighter text-primary italic">505</p>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Diseases</p>
                                </div>
                                <div className="w-px h-10 bg-slate-200/50 dark:bg-slate-800/50" />
                                <div className="text-center flex-1">
                                    <p className="text-2xl font-black tracking-tighter text-primary italic">131</p>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Symptoms</p>
                                </div>
                            </div>
                        </div>

                        {/* Local Vault Section */}
                        <div className="pt-8 mt-auto">
                            <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/10 space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-red-500">Local Data Encryption</h3>
                                </div>
                                <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                                    Neural history is isolated to this terminal. Purging will permanently dissolve 
                                    <span className="text-red-500 mx-1">[{historyCount}]</span> encrypted clinical blocks.
                                </p>
                                <button
                                    onClick={handleClearHistory}
                                    disabled={historyCount === 0}
                                    className="w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-red-500 text-white shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:grayscale transition-all"
                                >
                                    Purge Vault
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Engineering Specs */}
            <div className="pt-12 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center text-white font-black italic text-xl shadow-lg ring-1 ring-white/10 text-primary">N</div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Neurax Neural OS</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Clinical Protocol — IBM Team 63</p>
                    </div>
                </div>
                
                <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.15em]">
                        Developed by <span className="text-slate-900 dark:text-slate-100">Justin Thomas</span>, <span className="text-slate-900 dark:text-slate-100">Devika NS</span>, 
                        <br className="hidden md:block" />
                        <span className="text-slate-900 dark:text-slate-100">Krishnajith Vijay</span>, and <span className="text-slate-900 dark:text-slate-100">Sivaranjps</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="h-px w-6 bg-slate-200 dark:bg-slate-800" />
                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] italic">
                            Lead Engineer: Justin Thomas
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
