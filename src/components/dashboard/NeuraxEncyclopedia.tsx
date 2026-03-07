"use client";
import React, { useState, useMemo } from 'react';
import { seedSymptoms, seedDiseases } from '@/db/seed';

export const NeuraxEncyclopedia: React.FC = () => {
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"symptoms" | "diseases">("symptoms");
    const [selectedDisease, setSelectedDisease] = useState<any | null>(null);
    
    const filteredSymptoms = useMemo(() => {
        return seedSymptoms.filter(s => 
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.category.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    const filteredDiseases = useMemo(() => {
        return seedDiseases.filter(d => 
            d.name.toLowerCase().includes(search.toLowerCase()) ||
            d.description.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                        Medical <span className="text-primary italic">Archive</span>
                    </h2>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">
                        Neural Clinical Reference Matrix
                    </p>
                </div>

                <div className="relative w-full md:w-72">
                    <input 
                        type="text"
                        placeholder="Search matrix..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium backdrop-blur-sm"
                    />
                    <svg className="absolute right-3 top-3 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            <div className="flex bg-slate-100/50 dark:bg-slate-900/40 p-1 rounded-xl w-fit border border-slate-200 dark:border-slate-800/50 backdrop-blur-md">
                <button 
                    onClick={() => setActiveTab("symptoms")}
                    className={`px-5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative overflow-hidden group
                        ${activeTab === 'symptoms' 
                            ? 'bg-primary text-white shadow-[0_0_15px_rgba(0,177,64,0.3)]' 
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
                >
                    <span className="relative z-10">Symptoms [{seedSymptoms.length}]</span>
                    {activeTab === 'symptoms' && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50" />
                    )}
                </button>
                <button 
                    onClick={() => setActiveTab("diseases")}
                    className={`px-5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative overflow-hidden group
                        ${activeTab === 'diseases' 
                            ? 'bg-primary text-white shadow-[0_0_15px_rgba(0,177,64,0.3)]' 
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
                >
                    <span className="relative z-10">Diseases [505]</span>
                    {activeTab === 'diseases' && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50" />
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {activeTab === "symptoms" ? (
                    filteredSymptoms.length > 0 ? (
                        filteredSymptoms.map(s => (
                            <div key={s.id} className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/30 transition-all shadow-sm">
                                <span className="text-[9px] font-black text-primary uppercase tracking-tighter mb-1 block">{s.category}</span>
                                <h3 className="font-bold text-slate-900 dark:text-slate-100">{s.name}</h3>
                                <p className="text-[10px] text-slate-500 mt-2 font-mono uppercase">ID: {s.id}</p>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-sm text-slate-500 font-medium italic">No symptoms found in local matrix.</p>
                        </div>
                    )
                ) : (
                    filteredDiseases.length > 0 ? (
                        filteredDiseases.map(d => (
                            <div 
                                key={d.id} 
                                onClick={() => setSelectedDisease(d)}
                                className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/30 transition-all shadow-sm relative overflow-hidden cursor-pointer active:scale-95"
                            >
                                <div className={`absolute top-0 right-0 px-3 py-1 text-[9px] font-black uppercase tracking-tighter text-white ${d.severity === 'critical' ? 'bg-red-500' : d.severity === 'high' ? 'bg-orange-500' : 'bg-blue-500'}`}>
                                    {d.severity}
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-slate-100 pr-12">{d.name}</h3>
                                <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">{d.description}</p>
                                <div className="mt-4 flex flex-wrap gap-1">
                                    {d.precautions.slice(0, 2).map((p, i) => (
                                        <span key={i} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] text-slate-400 border border-slate-200 dark:border-slate-700">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors pointer-events-none" />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-sm text-slate-500 font-medium italic">No diseases found in local matrix.</p>
                        </div>
                    )
                )}
            </div>

            {/* --- Disease Detail Modal --- */}
            {selectedDisease && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className={`h-2 ${selectedDisease.severity === 'critical' ? 'bg-red-500' : selectedDisease.severity === 'high' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">{selectedDisease.name}</h3>
                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-2 block">
                                        Clinical Profile ID: {selectedDisease.id}
                                    </span>
                                </div>
                                <button 
                                    onClick={() => setSelectedDisease(null)}
                                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                        {selectedDisease.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Clinical Severity</h4>
                                        <span className={`text-xs font-black uppercase ${selectedDisease.severity === 'critical' ? 'text-red-500' : selectedDisease.severity === 'high' ? 'text-orange-500' : 'text-blue-500'}`}>
                                            {selectedDisease.severity}
                                        </span>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Symptom Density</h4>
                                        <span className="text-xs font-black text-primary">
                                            {selectedDisease.symptoms.length} Clinical Indicators
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Clinical Precautions</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedDisease.precautions.map((p: string, i: number) => (
                                            <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                                                {p}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => setSelectedDisease(null)}
                                className="w-full mt-8 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                            >
                                Close Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #CBD5E1;
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #334155;
                }
            `}</style>
        </div>
    );
};
