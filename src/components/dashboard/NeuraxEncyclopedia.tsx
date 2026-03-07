"use client";
import React, { useState, useMemo } from 'react';
import { seedSymptoms } from '@/db/seed';

export const NeuraxEncyclopedia: React.FC = () => {
    const [search, setSearch] = useState("");
    
    const filteredSymptoms = useMemo(() => {
        if (!search.trim()) return seedSymptoms;
        const q = search.toLowerCase();
        return seedSymptoms.filter(s => 
            s.name.toLowerCase().includes(q) || 
            s.category.toLowerCase().includes(q)
        );
    }, [search]);

    const grouped = useMemo(() => {
        const map: Record<string, typeof seedSymptoms> = {};
        for (const s of filteredSymptoms) {
            if (!map[s.category]) map[s.category] = [];
            map[s.category].push(s);
        }
        return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
    }, [filteredSymptoms]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight font-heading">Neurax Encyclopedia</h2>
                <p className="text-sm text-slate-500 font-medium">
                    Local clinical reference for all supported medical identifiers. No cloud processing required.
                </p>
            </div>

            <div className="relative max-w-md">
                <input
                    type="text"
                    placeholder="Search encyclopedia..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 rounded-xl text-sm font-sans
                        bg-white/50 dark:bg-slate-900/50 backdrop-blur-md 
                        border border-slate-200/50 dark:border-slate-800/50 text-slate-900 dark:text-slate-100
                        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50
                        transition-all duration-300 shadow-sm"
                />
            </div>

            <div className="space-y-10 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                {grouped.map(([category, symptoms]) => (
                    <div key={category} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-primary font-heading">
                                {category}
                            </h3>
                            <div className="flex-1 h-px bg-slate-200/50 dark:bg-slate-800/50" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {symptoms.map(s => (
                                <div key={s.id} className="p-5 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 hover:border-primary/30 transition-all group">
                                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-primary transition-colors">
                                        {s.name}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                                        Clinical identifier for {category.toLowerCase()} mapping. Verified in local diagnostic matrix.
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
