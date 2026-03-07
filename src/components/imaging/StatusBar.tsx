"use client";

import { useEffect, useState } from "react";
import { healthCheck, API_BASE } from "@/lib/imaging";

export function StatusBar() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [device, setDevice] = useState<string>("cpu");
  const [moduleCount, setModuleCount] = useState(0);

  useEffect(() => {
    const probe = async () => {
      const data = await healthCheck();
      if (data) {
        setOnline(true);
        setDevice(data.device);
        setModuleCount(Object.keys(data.modules).length);
      } else {
        setOnline(false);
      }
    };
    probe();
    const interval = setInterval(probe, 10000);
    return () => clearInterval(interval);
  }, []);

  if (online === null) {
    return (
      <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
        <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse flex-shrink-0" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Connecting to Vision Core...
        </p>
      </div>
    );
  }

  if (!online) {
    return (
      <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest">
            Vision Core Offline
          </p>
          <p className="text-[9px] font-bold opacity-70 mt-0.5">
            Run: <code className="bg-red-500/20 px-2 py-0.5 rounded text-[9px]">cd backend && uvicorn main:app --port 8000</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500">
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
      <p className="text-[10px] font-black uppercase tracking-widest">
        Vision Core Online &mdash; {moduleCount} Modules &mdash; {device.toUpperCase()}
      </p>
    </div>
  );
}
