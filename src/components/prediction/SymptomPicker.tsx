"use client";

import { useState, useMemo } from "react";
import { seedSymptoms } from "@/db/seed";

interface SymptomPickerProps {
    selectedSymptoms: string[];
    onSymptomsChange: (symptoms: string[]) => void;
}

export function SymptomPicker({
    selectedSymptoms,
    onSymptomsChange,
}: SymptomPickerProps) {
    const [search, setSearch] = useState("");

    const filteredSymptoms = useMemo(() => {
        if (!search.trim()) return seedSymptoms;
        const q = search.toLowerCase();
        return seedSymptoms.filter(
            (s) =>
                s.name.toLowerCase().includes(q) ||
                s.category.toLowerCase().includes(q)
        );
    }, [search]);

    const toggleSymptom = (name: string) => {
        onSymptomsChange(
            selectedSymptoms.includes(name)
                ? selectedSymptoms.filter((s) => s !== name)
                : [...selectedSymptoms, name]
        );
    };

    // Group symptoms by category
    const grouped = useMemo(() => {
        const map: Record<string, typeof filteredSymptoms> = {};
        for (const s of filteredSymptoms) {
            if (!map[s.category]) map[s.category] = [];
            map[s.category].push(s);
        }
        return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
    }, [filteredSymptoms]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Search */}
            <div className="relative max-w-2xl group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-rose-500/20 rounded-[2rem] blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
                <div className="relative flex items-center">
                    <svg
                        className="absolute left-6 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors duration-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2.5"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                        />
                    </svg>
                    <input
                        id="symptom-search"
                        type="text"
                        placeholder="Search Clinical Identifiers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-14 pr-14 py-5 rounded-[1.5rem] text-sm font-sans font-medium
                            bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl 
                            border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white
                            placeholder:text-slate-400 placeholder:font-bold placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px]
                            focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40
                            transition-all duration-500 shadow-xl"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-6 text-slate-400 hover:text-rose-500 transition-all duration-300 bg-slate-100 dark:bg-slate-800 rounded-full p-1.5"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Selected Symptoms Summary */}
            <div className="flex flex-wrap items-center gap-3 px-2">
                <div className="flex items-center gap-3 mr-4 py-2 px-4 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Active Profile
                    </span>
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-primary/20">
                        {selectedSymptoms.length}
                    </div>
                </div>
                {selectedSymptoms.map((s) => (
                    <button
                        key={s}
                        onClick={() => toggleSymptom(s)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider
                            bg-primary/10 text-primary border border-primary/20
                            hover:bg-rose-500 hover:text-white hover:border-rose-500
                            transition-all duration-500 cursor-pointer shadow-premium-shadow animate-in zoom-in-95"
                    >
                        {s}
                        <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                ))}
                {selectedSymptoms.length > 0 && (
                    <button
                        onClick={() => onSymptomsChange([])}
                        className="ml-auto px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-rose-500 transition-all duration-300 hover:underline underline-offset-4"
                    >
                        Purge Selection
                    </button>
                )}
            </div>

            {/* Grouped Symptoms */}
            <div className="space-y-10 max-h-[520px] overflow-y-auto pr-4 custom-scrollbar scroll-smooth">
                {grouped.map(([category, symptoms]) => (
                    <div key={category} className="space-y-4">
                        <div className="flex items-center gap-4 px-2">
                            <h3 className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-900 dark:text-white font-display opacity-80">
                                {category}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-500 border border-slate-200 dark:border-slate-700">
                                {symptoms.length}
                            </span>
                            <div className="flex-1 h-px bg-gradient-to-r from-slate-200 dark:from-slate-800 to-transparent" />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {symptoms.map((symptom) => {
                                const isActive = selectedSymptoms.includes(symptom.name);
                                return (
                                    <button
                                        key={symptom.id}
                                        id={`symptom-${symptom.id}`}
                                        onClick={() => toggleSymptom(symptom.name)}
                                        className={`
                                            relative px-5 py-4 rounded-[1.25rem] text-left text-xs font-bold
                                            transition-all duration-500 transform active:scale-[0.98] group/btn
                                            ${isActive
                                                ? "bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-[1.02]"
                                                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-primary/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-sm"
                                            }
                                        `}
                                    >
                                        <div className="flex items-center justify-between pointer-events-none">
                                            <span className="truncate tracking-tight">{symptom.name}</span>
                                            {isActive ? (
                                                <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center animate-in zoom-in-50 duration-300">
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="4" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                    </svg>
                                                </div>
                                            ) : (
                                                <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800 group-hover/btn:bg-primary/40 transition-colors" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {filteredSymptoms.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 animate-in fade-in duration-700">
                        <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-300">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                        </div>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest text-center px-10">
                            No Clinical Identifiers Match <br/>
                            <span className="text-rose-500 mt-2 block">&ldquo;{search}&rdquo;</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
