"use client";

import Link from "next/link";

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-[var(--cyber-bg)] cyber-grid flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(0,240,255,0.08)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md p-8 rounded-2xl neon-border bg-[var(--cyber-surface)] space-y-6">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl neon-border neon-glow bg-[var(--cyber-bg)] mb-2">
                        <svg viewBox="0 0 24 24" className="w-8 h-8 text-[var(--neon)]" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 2v20M2 12h20" strokeLinecap="round" />
                            <circle cx="12" cy="12" r="4" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold neon-text">Sign In</h1>
                    <p className="text-sm text-[var(--muted-foreground)]">
                        Access the NeuraMed Prediction Engine
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="doctor@neuramed.ai"
                            className="w-full px-4 py-2.5 rounded-xl text-sm
                bg-[var(--cyber-bg)] neon-border text-foreground
                placeholder:text-[var(--muted-foreground)]
                focus:outline-none focus:ring-1 focus:ring-[var(--neon)]
                transition-all duration-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-2.5 rounded-xl text-sm
                bg-[var(--cyber-bg)] neon-border text-foreground
                placeholder:text-[var(--muted-foreground)]
                focus:outline-none focus:ring-1 focus:ring-[var(--neon)]
                transition-all duration-200"
                        />
                    </div>
                </div>

                <Link
                    href="/dashboard"
                    className="block w-full text-center px-6 py-3 rounded-xl font-semibold text-sm
            bg-[var(--neon)] text-[var(--cyber-bg)]
            hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]
            transition-all duration-300 active:scale-95"
                >
                    Sign In
                </Link>

                <div className="text-center space-y-2">
                    <p className="text-xs text-[var(--muted-foreground)]">
                        Don&apos;t have an account?{" "}
                        <Link href="/sign-up" className="text-[var(--neon)] hover:underline">
                            Sign up
                        </Link>
                    </p>
                    <div className="pt-2 border-t border-[rgba(0,240,255,0.08)]">
                        <p className="text-[10px] text-[var(--muted-foreground)] opacity-60">
                            Configure Clerk API keys in .env.local for production auth
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
