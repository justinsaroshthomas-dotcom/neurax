"use client";

import { useMemo, useState } from "react";
import type { CatalogDisease, CatalogSymptom } from "@/lib/catalog-types";
import { useCatalog } from "@/lib/use-catalog";

export const NeuraxEncyclopedia: React.FC = () => {
    const { data: catalog, loading } = useCatalog();
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"symptoms" | "diseases">("symptoms");
    const [selectedDisease, setSelectedDisease] = useState<CatalogDisease | null>(null);

    const filteredSymptoms = useMemo(() => {
        if (!catalog) {
            return [];
        }

        return [...catalog.coreSymptoms, ...catalog.extendedSymptoms].filter(
            (symptom) =>
                symptom.name.toLowerCase().includes(search.toLowerCase()) ||
                symptom.category.toLowerCase().includes(search.toLowerCase()) ||
                symptom.aliases.some((alias) => alias.toLowerCase().includes(search.toLowerCase()))
        );
    }, [catalog, search]);

    const filteredDiseases = useMemo(() => {
        if (!catalog) {
            return [];
        }

        return catalog.diseases.filter(
            (disease) =>
                disease.name.toLowerCase().includes(search.toLowerCase()) ||
                disease.description.toLowerCase().includes(search.toLowerCase()) ||
                disease.symptoms.some((symptom) =>
                    symptom.name.toLowerCase().includes(search.toLowerCase())
                )
        );
    }, [catalog, search]);

    const renderSymptomCard = (symptom: CatalogSymptom) => (
        <div
            key={symptom.id}
            className="group rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/30"
        >
            <div className="mb-1 flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-tighter text-primary">
                    {symptom.category}
                </span>
                {symptom.source === "extended" ? (
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-primary">
                        Extended
                    </span>
                ) : null}
            </div>
            <h3 className="font-bold text-card-foreground">{symptom.name}</h3>
            <p className="mt-2 text-[10px] font-mono uppercase text-muted-foreground">
                Key: {symptom.key}
            </p>
        </div>
    );

    const renderDiseaseCard = (disease: CatalogDisease) => (
        <button
            key={disease.id}
            onClick={() => setSelectedDisease(disease)}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:border-primary/30"
        >
            <div
                className={`absolute right-0 top-0 px-3 py-1 text-[9px] font-black uppercase tracking-tighter text-white ${
                    disease.severity === "critical"
                        ? "bg-rose-500"
                        : disease.severity === "high"
                          ? "bg-orange-500"
                          : disease.severity === "medium"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                }`}
            >
                {disease.severity}
            </div>
            <h3 className="pr-12 font-bold text-card-foreground">{disease.name}</h3>
            {disease.description ? (
                <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                    {disease.description}
                </p>
            ) : (
                <p className="mt-2 text-[11px] italic text-muted-foreground">
                    No curated description available in the local catalog.
                </p>
            )}
            <div className="mt-4 flex flex-wrap gap-1">
                {disease.symptoms.slice(0, 3).map((symptom) => (
                    <span
                        key={symptom.key}
                        className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[9px] text-muted-foreground"
                    >
                        {symptom.name}
                    </span>
                ))}
            </div>
        </button>
    );

    if (loading && !catalog) {
        return <div className="h-80 animate-pulse rounded-3xl border border-border bg-card" />;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-foreground">
                        Medical <span className="text-primary italic">Archive</span>
                    </h2>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        Generated clinical reference matrix
                    </p>
                </div>

                <div className="relative w-full md:w-80">
                    <input
                        type="text"
                        placeholder="Search matrix..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                    />
                    <svg className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0 1 14 0z" />
                    </svg>
                </div>
            </div>

            <div className="flex w-fit rounded-xl border border-border bg-card p-1">
                <button
                    onClick={() => setActiveTab("symptoms")}
                    className={`rounded-lg px-5 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === "symptoms"
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                    }`}
                >
                    Symptoms [{(catalog?.counts.coreSymptoms ?? 0) + (catalog?.counts.extendedSymptoms ?? 0)}]
                </button>
                <button
                    onClick={() => setActiveTab("diseases")}
                    className={`rounded-lg px-5 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === "diseases"
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                    }`}
                >
                    Diseases [{catalog?.counts.diseases ?? 0}]
                </button>
            </div>

            <div className="grid h-[500px] grid-cols-1 gap-4 overflow-y-auto pr-2 md:grid-cols-2 lg:grid-cols-3">
                {activeTab === "symptoms" ? (
                    filteredSymptoms.length > 0 ? (
                        filteredSymptoms.map(renderSymptomCard)
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-sm font-medium italic text-muted-foreground">
                                No symptoms found in the generated catalog.
                            </p>
                        </div>
                    )
                ) : filteredDiseases.length > 0 ? (
                    filteredDiseases.map(renderDiseaseCard)
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <p className="text-sm font-medium italic text-muted-foreground">
                            No diseases found in the generated catalog.
                        </p>
                    </div>
                )}
            </div>

            {selectedDisease ? (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 p-4 backdrop-blur-md">
                    <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
                        <div
                            className={`h-2 ${
                                selectedDisease.severity === "critical"
                                    ? "bg-rose-500"
                                    : selectedDisease.severity === "high"
                                      ? "bg-orange-500"
                                      : selectedDisease.severity === "medium"
                                        ? "bg-amber-500"
                                        : "bg-emerald-500"
                            }`}
                        />
                        <div className="p-8">
                            <div className="mb-6 flex items-start justify-between">
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">
                                        {selectedDisease.name}
                                    </h3>
                                    <span className="mt-2 block text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                                        Catalog ID: {selectedDisease.id}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSelectedDisease(null)}
                                    className="rounded-xl bg-secondary p-2 text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        Description
                                    </h4>
                                    <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                                        {selectedDisease.description || "No curated description available in the local catalog."}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-2xl border border-border bg-secondary/50 p-4">
                                        <h4 className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                            Clinical Severity
                                        </h4>
                                        <span className="text-xs font-black uppercase text-primary">
                                            {selectedDisease.severity}
                                        </span>
                                    </div>
                                    <div className="rounded-2xl border border-border bg-secondary/50 p-4">
                                        <h4 className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                            Symptom Density
                                        </h4>
                                        <span className="text-xs font-black text-primary">
                                            {selectedDisease.symptoms.length} indicators
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        Characteristic Symptoms
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedDisease.symptoms.map((symptom) => (
                                            <span
                                                key={symptom.key}
                                                className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary"
                                            >
                                                {symptom.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedDisease(null)}
                                className="mt-8 w-full rounded-2xl bg-foreground py-4 text-[11px] font-black uppercase tracking-widest text-background transition-all hover:scale-[1.01]"
                            >
                                Close Profile
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};
