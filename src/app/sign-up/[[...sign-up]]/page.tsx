"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/lib/auth";

export default function SignUpPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const result = await register(name, email, password);

        if (result.success) {
            router.push("/dashboard");
        } else {
            setError(result.error || "Registration failed");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--cyber-bg)] cyber-grid flex items-center justify-center relative overflow-hidden px-4">
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(0,136,255,0.06)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative z-10 w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl neon-border neon-glow bg-[var(--cyber-surface)] mb-4">
                        <svg viewBox="0 0 24 24" className="w-8 h-8 text-[var(--neon)]" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 2v20M2 12h20" strokeLinecap="round" />
                            <circle cx="12" cy="12" r="4" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">
                        Join the NeuraMed platform
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="rounded-2xl neon-border bg-[var(--cyber-surface)] p-6 space-y-5">
                    {error && (
                        <div className="p-3 rounded-xl bg-[rgba(255,62,108,0.08)] border border-[rgba(255,62,108,0.2)]">
                            <p className="text-xs text-[var(--destructive)]">{error}</p>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label htmlFor="name" className="text-xs text-[var(--muted-foreground)] font-medium block">
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            className="w-full px-4 py-3 rounded-xl text-sm
                                bg-[var(--cyber-bg)] neon-border text-foreground
                                placeholder:text-[var(--muted-foreground)]
                                focus:outline-none focus:ring-2 focus:ring-[var(--neon)] focus:ring-opacity-50
                                transition-all duration-200"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="email" className="text-xs text-[var(--muted-foreground)] font-medium block">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 rounded-xl text-sm
                                bg-[var(--cyber-bg)] neon-border text-foreground
                                placeholder:text-[var(--muted-foreground)]
                                focus:outline-none focus:ring-2 focus:ring-[var(--neon)] focus:ring-opacity-50
                                transition-all duration-200"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="password" className="text-xs text-[var(--muted-foreground)] font-medium block">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            className="w-full px-4 py-3 rounded-xl text-sm
                                bg-[var(--cyber-bg)] neon-border text-foreground
                                placeholder:text-[var(--muted-foreground)]
                                focus:outline-none focus:ring-2 focus:ring-[var(--neon)] focus:ring-opacity-50
                                transition-all duration-200"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3.5 rounded-xl font-semibold text-sm
                            bg-[var(--neon)] text-[var(--cyber-bg)]
                            hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all duration-300 active:scale-[0.98]"
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-xs text-[var(--muted-foreground)] mt-6">
                    Already have an account?{" "}
                    <Link href="/sign-in" className="text-[var(--neon)] hover:underline font-medium">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
