"use client";
import React, { useState, useMemo } from 'react';
import { seedSymptoms, seedDiseases } from '@/db/seed';

export const NeuraxEncyclopedia: React.FC = () => {
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"symptoms" | "diseases">("symptoms");
    
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
                        Neurax Encyclopedia
                    </h2>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                        Local Clinical Reference Matrix
                    </p>
                </div>

                <div className="relative w-full md:w-72">
                    <input 
                        type="text"
                        placeholder="Search matrix..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                    />
                    <svg className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-fit border border-slate-200 dark:border-slate-800">
                <button 
                    onClick={() => setActiveTab("symptoms")}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'symptoms' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-500'}`}
                >
                    Symptoms [{seedSymptoms.length}]
                </button>
                <button 
                    onClick={() => setActiveTab("diseases")}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'diseases' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-500'}`}
                >
                    Diseases [{seedDiseases.length}]
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
                            <div key={d.id} className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/30 transition-all shadow-sm relative overflow-hidden">
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
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-sm text-slate-500 font-medium italic">No diseases found in local matrix.</p>
                        </div>
                    )
                )}
            </div>
            
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
