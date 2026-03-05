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
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const categories = useMemo(() => {
        const cats = [...new Set(seedSymptoms.map((s) => s.category))];
        return cats.sort();
    }, []);

    const filteredSymptoms = useMemo(() => {
        let list = seedSymptoms;

        if (activeCategory) {
            list = list.filter((s) => s.category === activeCategory);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (s) =>
                    s.name.toLowerCase().includes(q) ||
                    s.category.toLowerCase().includes(q)
            );
        }

        return list;
    }, [search, activeCategory]);

    const toggleSymptom = (name: string) => {
        onSymptomsChange(
            selectedSymptoms.includes(name)
                ? selectedSymptoms.filter((s) => s !== name)
                : [...selectedSymptoms, name]
        );
    };

    return (
        <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]"
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
                        type="text"
                        placeholder="Search symptoms..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm
              bg-[var(--cyber-surface)] neon-border text-foreground
              placeholder:text-[var(--muted-foreground)]
              focus:outline-none focus:ring-1 focus:ring-[var(--neon)]
              transition-all duration-200"
                    />
                </div>

                {/* Selected count */}
                {selectedSymptoms.length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl neon-border bg-[rgba(0,240,255,0.05)]">
                        <div className="w-2 h-2 rounded-full bg-[var(--neon)] animate-pulse" />
                        <span className="text-xs font-mono text-[var(--neon)]">
                            {selectedSymptoms.length} active
                        </span>
                    </div>
                )}
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setActiveCategory(null)}
                    className={`category-badge transition-all duration-200 cursor-pointer ${!activeCategory
                            ? "bg-[rgba(0,240,255,0.15)] border-[var(--neon)] text-[var(--neon)]"
                            : "hover:border-[rgba(0,240,255,0.3)]"
                        }`}
                >
                    All
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                        className={`category-badge transition-all duration-200 cursor-pointer ${activeCategory === cat
                                ? "bg-[rgba(0,240,255,0.15)] border-[var(--neon)] text-[var(--neon)]"
                                : "hover:border-[rgba(0,240,255,0.3)]"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Symptoms Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {filteredSymptoms.map((symptom) => {
                    const isActive = selectedSymptoms.includes(symptom.name);
                    return (
                        <label
                            key={symptom.id}
                            className={`cyber-toggle ${isActive ? "active" : ""}`}
                            onClick={() => toggleSymptom(symptom.name)}
                        >
                            <span className="toggle-indicator">
                                <svg
                                    viewBox="0 0 12 12"
                                    fill="none"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                >
                                    <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                            <span className="flex flex-col min-w-0">
                                <span
                                    className={`text-sm font-medium ${isActive ? "text-[var(--neon)]" : "text-foreground"
                                        }`}
                                >
                                    {symptom.name}
                                </span>
                                <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">
                                    {symptom.category}
                                </span>
                            </span>
                        </label>
                    );
                })}
            </div>

            {filteredSymptoms.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-[var(--muted-foreground)] text-sm">
                        No symptoms match your search.
                    </p>
                </div>
            )}
        </div>
    );
}
