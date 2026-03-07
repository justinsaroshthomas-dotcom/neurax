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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Search */}
            <div className="relative max-w-xl group">
                <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl group-focus-within:bg-primary/10 transition-colors" />
                <div className="relative flex items-center">
                    <svg
                        className="absolute left-4 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
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
                        placeholder="Type to find a symptom..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 rounded-2xl text-base
                            bg-white/50 dark:bg-slate-900/50 backdrop-blur-md 
                            border border-slate-200/50 dark:border-slate-800/50 text-slate-900 dark:text-slate-100
                            placeholder:text-slate-400 dark:placeholder:text-slate-600
                            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50
                            transition-all duration-300 shadow-sm"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-4 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors bg-slate-100 dark:bg-slate-800 rounded-full p-1"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Selected Symptoms Summary */}
                <div className="flex flex-wrap items-center gap-2 px-1">
                    <div className="flex items-center gap-2 mr-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                            Selected Profile
                        </span>
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                            {selectedSymptoms.length}
                        </div>
                    </div>
                    {selectedSymptoms.map((s) => (
                        <button
                            key={s}
                            onClick={() => toggleSymptom(s)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
                                bg-primary/10 text-primary border border-primary/20
                                hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20
                                transition-all duration-200 cursor-pointer shadow-sm animate-in zoom-in-95"
                        >
                            {s}
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    ))}
                    <button
                        onClick={() => onSymptomsChange([])}
                        className="ml-auto text-[10px] font-black uppercase tracking-tighter text-slate-400 hover:text-red-500 transition-colors"
                    >
                        Clear all
                    </button>
                </div>

            {/* Grouped Symptoms */}
            <div className="space-y-6 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
                {grouped.map(([category, symptoms]) => (
                    <div key={category} className="space-y-3">
                        <div className="flex items-center gap-3 px-1">
                            <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 dark:text-slate-600">
                                {category}
                            </h3>
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-400 dark:text-slate-500">
                                {symptoms.length}
                            </span>
                            <div className="flex-1 h-px bg-slate-200/50 dark:bg-slate-800/50" />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                            {symptoms.map((symptom) => {
                                const isActive = selectedSymptoms.includes(symptom.name);
                                return (
                                    <button
                                        key={symptom.id}
                                        id={`symptom-${symptom.id}`}
                                        onClick={() => toggleSymptom(symptom.name)}
                                        className={`
                                            relative px-4 py-3.5 rounded-2xl text-left text-sm font-semibold
                                            transition-all duration-300 transform active:scale-95
                                            ${isActive
                                                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 dark:shadow-primary/10"
                                                : "bg-white/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 text-slate-600 dark:text-slate-400 hover:border-primary/40 hover:bg-white dark:hover:bg-slate-900 shadow-sm"
                                            }
                                        `}
                                    >
                                        <div className="flex items-center justify-between pointer-events-none">
                                            <span className="truncate">{symptom.name}</span>
                                            {isActive && (
                                                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                                                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="4" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {filteredSymptoms.length === 0 && (
                <div className="text-center py-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-slate-400 dark:text-slate-600 text-sm font-medium italic">
                        No clinical identifiers match &ldquo;{search}&rdquo;
                    </p>
                </div>
            )}
        </div>
    );
}
