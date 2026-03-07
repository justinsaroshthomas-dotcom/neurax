"use client";

import { MODULES } from "@/lib/imaging";
import type { ModuleId } from "@/types/imaging";

interface ModuleSelectorProps {
  selected: ModuleId;
  onSelect: (id: ModuleId) => void;
}

export function ModuleSelector({ selected, onSelect }: ModuleSelectorProps) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">
        Select Imaging Module
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {MODULES.map((m) => {
          const active = selected === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left group
                ${active
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-lg"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:border-primary/40"
                }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{m.icon}</span>
                <span
                  className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full
                    ${active
                      ? "bg-primary/20 text-primary"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                    }`}
                >
                  {m.modality}
                </span>
              </div>
              <p className="text-[11px] font-black text-slate-800 dark:text-slate-100 leading-tight mb-1">
                {m.label}
              </p>
              <p className="text-[9px] text-slate-400 font-bold leading-snug line-clamp-2">
                {m.description}
              </p>
              <p className="text-[8px] text-slate-400/60 font-bold mt-2 truncate">
                {m.dataset}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
