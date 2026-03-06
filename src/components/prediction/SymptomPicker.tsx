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
        <div className="space-y-5">
            {/* Search */}
            <div className="relative max-w-md">
                <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]"
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
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm
                        bg-[var(--cyber-surface)] neon-border text-foreground
                        placeholder:text-[var(--muted-foreground)]
                        focus:outline-none focus:ring-2 focus:ring-[var(--neon)] focus:ring-opacity-50
                        transition-all duration-200"
                />
                {search && (
                    <button
                        onClick={() => setSearch("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-foreground transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Selected Symptoms Summary */}
            {selectedSymptoms.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-[var(--muted-foreground)] mr-1">Selected:</span>
                    {selectedSymptoms.map((s) => (
                        <button
                            key={s}
                            onClick={() => toggleSymptom(s)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                                bg-[rgba(0,240,255,0.1)] text-[var(--neon)] border border-[rgba(0,240,255,0.3)]
                                hover:bg-[rgba(255,62,108,0.1)] hover:text-[var(--destructive)] hover:border-[rgba(255,62,108,0.3)]
                                transition-all duration-200 cursor-pointer"
                        >
                            {s}
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    ))}
                </div>
            )}

            {/* Grouped Symptoms */}
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {grouped.map(([category, symptoms]) => (
                    <div key={category}>
                        <h3 className="text-[11px] uppercase tracking-widest text-[var(--muted-foreground)] font-semibold mb-2 pl-1">
                            {category}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                            {symptoms.map((symptom) => {
                                const isActive = selectedSymptoms.includes(symptom.name);
                                return (
                                    <button
                                        key={symptom.id}
                                        id={`symptom-${symptom.id}`}
                                        onClick={() => toggleSymptom(symptom.name)}
                                        className={`
                                            relative px-4 py-3 rounded-xl text-left text-sm font-medium
                                            transition-all duration-200 cursor-pointer
                                            ${isActive
                                                ? "bg-[rgba(0,240,255,0.1)] border border-[var(--neon)] text-[var(--neon)] shadow-[0_0_15px_rgba(0,240,255,0.1)]"
                                                : "bg-[var(--cyber-surface)] border border-[rgba(0,240,255,0.1)] text-foreground hover:border-[rgba(0,240,255,0.3)] hover:bg-[var(--cyber-surface-2)]"
                                            }
                                        `}
                                    >
                                        <span className="flex items-center gap-2">
                                            {isActive && (
                                                <svg className="w-4 h-4 flex-shrink-0 text-[var(--neon)]" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                </svg>
                                            )}
                                            {symptom.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {filteredSymptoms.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-[var(--muted-foreground)] text-sm">
                        No symptoms match &ldquo;{search}&rdquo;
                    </p>
                </div>
            )}
        </div>
    );
}
