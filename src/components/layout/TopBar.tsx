"use client";

import { useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { Search, Bell, Settings, Command } from "lucide-react";

export function TopBar() {
    const { user, isLoaded } = useUser();
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <header className="h-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-8 flex items-center justify-between shrink-0 border-b border-slate-100 dark:border-slate-800/50 sticky top-0 z-30 transition-all">
            {/* Logo area & Title */}
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                         <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] font-display">
                            Neurax Intelligence
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-primary/10 text-[8px] font-black text-primary border border-primary/20">V2.0</span>
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        Clinical Diagnostic Matrix
                    </h1>
                </div>
            </div>

            {/* Premium Search Bar */}
            <div className="flex-1 max-w-2xl px-12 group">
                <div className="relative flex items-center w-full h-11 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 px-4 group-focus-within:ring-2 group-focus-within:ring-primary/20 group-focus-within:border-primary/40 transition-all">
                    <Search className="w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search Intelligence Matrix..." 
                        className="flex-1 bg-transparent border-none outline-none px-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 font-sans"
                    />
                    <div className="flex items-center gap-1.5 px-1.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <Command className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400">K</span>
                    </div>
                </div>
            </div>

            {/* Actions & Profile */}
            <div className="flex items-center gap-6">
                <div className="relative">
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all relative group"
                    >
                        <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900 shadow-sm" />
                    </button>
                    
                    {showNotifications && (
                        <div className="absolute top-14 right-0 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">System Alerts</h3>
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            </div>
                            <div className="space-y-3">
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                                    <p className="text-[11px] font-bold text-slate-900 dark:text-slate-100">Intelligence Engine Updated</p>
                                    <p className="text-[10px] text-slate-400 mt-1">Version 2.0.4 - Enhanced neural mapping protocols integrated.</p>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                                    <p className="text-[11px] font-bold text-slate-900 dark:text-slate-100">Bio-Metric Database Synced</p>
                                    <p className="text-[10px] text-slate-400 mt-1">402 new clinical markers indexed for diagnostic accuracy.</p>
                                </div>
                            </div>
                            <button className="w-full mt-4 py-2 text-[10px] font-bold text-primary uppercase tracking-[0.1em] hover:bg-primary/5 rounded-lg transition-colors">
                                View Intelligence Feed
                            </button>
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
                            {isLoaded ? user?.firstName || "Lead Clinician" : "Lead Clinician"}
                        </span>
                        <span className="text-[10px] text-primary font-bold uppercase tracking-wider italic">
                            Medical Director
                        </span>
                    </div>
                    {isLoaded && user ? (
                        <div className="ring-2 ring-primary/20 p-0.5 rounded-full hover:ring-primary/40 transition-all">
                            <UserButton 
                                afterSignOutUrl="/" 
                                appearance={{ 
                                    elements: { 
                                        userButtonAvatarBox: "w-9 h-9 rounded-full grayscale hover:grayscale-0 transition-all duration-500" 
                                    } 
                                }} 
                            />
                        </div>
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700" />
                    )}
                </div>
            </div>
        </header>
    );
}
