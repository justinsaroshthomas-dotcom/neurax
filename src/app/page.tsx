"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[var(--cyber-bg)] cyber-grid flex items-center justify-center relative overflow-hidden">
      {/* Ambient Glow Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(0,240,255,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(0,136,255,0.06)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 text-center px-6 max-w-3xl">
        {/* Logo */}
        <div className="mb-8 animate-float">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl neon-border neon-glow bg-[var(--cyber-surface)]">
            <svg
              viewBox="0 0 48 48"
              className="w-14 h-14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                d="M24 4v40M4 24h40M12 12l24 24M36 12L12 36"
                className="text-[var(--neon)]"
                strokeLinecap="round"
              />
              <circle
                cx="24"
                cy="24"
                r="8"
                className="text-[var(--neon)]"
                strokeWidth="2"
              />
              <circle
                cx="24"
                cy="24"
                r="18"
                className="text-[var(--neon-dim)]"
                strokeWidth="1"
                strokeDasharray="4 6"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
          <span className="neon-text">Neura</span>
          <span className="text-foreground">Med</span>
        </h1>

        <p className="text-lg md:text-xl text-[var(--muted-foreground)] mb-3 font-light">
          AI-Powered Disease Prediction Engine
        </p>

        <p className="text-sm text-[var(--muted-foreground)] opacity-60 mb-10 max-w-lg mx-auto">
          Analyze symptoms with medical-grade precision. Real-time predictions
          powered by weighted disease mapping and confidence scoring.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="group relative px-8 py-3.5 rounded-xl font-semibold text-sm
              bg-[var(--neon)] text-[var(--cyber-bg)]
              hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]
              transition-all duration-300 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2">
              Access Dashboard
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
          </button>

          <button
            onClick={() => router.push("/sign-up")}
            className="px-8 py-3.5 rounded-xl font-semibold text-sm
              neon-border text-[var(--neon)]
              hover:bg-[rgba(0,240,255,0.05)] hover:shadow-[0_0_20px_rgba(0,240,255,0.1)]
              transition-all duration-300 active:scale-95"
          >
            Create Account
          </button>
        </div>

        {/* Stats Row */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-md mx-auto">
          {[
            { value: "50+", label: "Symptoms" },
            { value: "18+", label: "Diseases" },
            { value: "95%", label: "Accuracy" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold neon-text-subtle">
                {stat.value}
              </div>
              <div className="text-xs text-[var(--muted-foreground)] mt-1 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
