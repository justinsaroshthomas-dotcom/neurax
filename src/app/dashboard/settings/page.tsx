"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { Shield, Smartphone, Palette, Database, Trash2, Cpu, CheckCircle2, UserCog } from "lucide-react";
import { getUserProfile, saveUserProfile, type UserProfile } from "@/lib/profile-store";

export default function SettingsPage() {
    const { user, isLoaded } = useUser();
    const { theme, setTheme } = useTheme();
    const [historyCount, setHistoryCount] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [profile, setProfile] = useState<UserProfile>({ clinicalLevel: "", department: "" });

    useEffect(() => {
        setMounted(true);
        setProfile(getUserProfile());
        try {
            const raw = localStorage.getItem("neurax_history");
            const history = raw ? JSON.parse(raw) : [];
            setHistoryCount(history.length);
        } catch {
            setHistoryCount(0);
        }
    }, []);

    const handleProfileUpdate = (key: keyof UserProfile, value: string) => {
        const newProfile = { ...profile, [key]: value };
        setProfile(newProfile);
        saveUserProfile(newProfile);
        // Dispatch custom event for TopBar sync
        window.dispatchEvent(new CustomEvent("neurax_profile_updated"));
    };

    const handleClearHistory = () => {
        localStorage.removeItem("neurax_history");
        setHistoryCount(0);
    };

    if (!mounted || !isLoaded) return null;

    const themes = [
        { id: "emerald", name: "Modern Emerald", color: "#00B140", desc: "Clinical Precision" },
        { id: "midnight", name: "Deep Indigo", color: "#6366f1", desc: "Neural Deep Dark" },
        { id: "cyber", name: "System Amber", color: "#f59e0b", desc: "High Contrast" },
        { id: "corporate", name: "Clinical Blue", color: "#2563eb", desc: "Professional Grade" },
        { id: "ultraviolet", name: "Ultra Violet", color: "#8b5cf6", desc: "Neural Spectrum" },
        { id: "crimson", name: "Clinical Red", color: "#ef4444", desc: "Urgent Priority" },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
                    System Configuration
                </h1>
                <p className="text-slate-500 font-medium max-w-2xl">
                    Manage your clinical intelligence preferences, interface themes, and security protocols.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                {/* Main Settings Area */}
                <div className="md:col-span-8 space-y-10">
                    {/* User Profile Info (Read-only aesthetic) */}
                    <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <UserCog className="w-24 h-24 grayscale" />
                        </div>
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-20 h-20 rounded-full ring-4 ring-primary/10 overflow-hidden">
                                <img src={user?.imageUrl} alt="Profile" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                            </div>
                            <div className="space-y-3 flex-1">
                                <div>
                                    <h3 className="text-2xl font-bold tracking-tight">{user?.fullName || user?.username}</h3>
                                    <p className="text-sm font-medium text-slate-400">{user?.primaryEmailAddress?.emailAddress}</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Clinical Identity</label>
                                        <input 
                                            value={profile.clinicalLevel}
                                            onChange={(e) => handleProfileUpdate("clinicalLevel", e.target.value)}
                                            placeholder="e.g. Senior Physician"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Department</label>
                                        <input 
                                            value={profile.department}
                                            onChange={(e) => handleProfileUpdate("department", e.target.value)}
                                            placeholder="e.g. Neurology"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Interface Styling */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-primary rounded-full" />
                            <h2 className="text-xl font-bold tracking-tight font-display">Interface Visuals</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {themes.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setTheme(t.id)}
                                    className={`relative p-5 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden group
                                        ${theme === t.id ? 'border-primary bg-primary/5 ring-4 ring-primary/5' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'}`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-8 h-8 rounded-lg shadow-inner" style={{ backgroundColor: t.color }} />
                                        {theme === t.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                    </div>
                                    <p className="font-bold text-sm tracking-tight">{t.name}</p>
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">{t.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Settings Area */}
                <div className="md:col-span-4 space-y-8">
                    {/* Machine Metrics */}
                    <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/30 transition-colors" />
                        
                        <div className="flex items-center justify-between relative z-10">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Core Metrics</h3>
                            <Cpu className="w-4 h-4 text-primary" />
                        </div>
                        
                        <div className="space-y-4 relative z-10">
                            {[
                                { label: "Pathology Load", value: "98.2%" },
                                { label: "Sync Latency", value: "4ms" },
                            ].map(m => (
                                <div key={m.label} className="flex justify-between items-end border-b border-white/10 pb-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{m.label}</span>
                                    <span className="text-lg font-bold font-mono text-primary italic">{m.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Data Vault */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
                        <div className="flex items-center gap-3">
                             <Database className="w-5 h-5 text-slate-400" />
                             <h3 className="text-sm font-bold tracking-tight">Clinical Vault</h3>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Your local diagnostics store contains <span className="text-slate-900 dark:text-white font-bold">{historyCount} sessions</span>. 
                            Purging will permanently clear this terminal.
                        </p>
                        <button
                            onClick={handleClearHistory}
                            disabled={historyCount === 0}
                            className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-2 group shadow-lg shadow-rose-500/10"
                        >
                            <Trash2 className="w-3.5 h-3.5 group-hover:animate-bounce" />
                            Purge Records
                        </button>
                    </div>

                    {/* IBM Credit */}
                    <div className="pt-4 text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">
                            Clinical Protocol <span className="text-primary italic">IBM TEAM 63</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
