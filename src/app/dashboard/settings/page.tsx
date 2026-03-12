"use client";

import { useState } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { CheckCircle2, Cpu, Database, Trash2, UserCog } from "lucide-react";
import { useTheme } from "next-themes";
import { THEME_OPTIONS, normalizeAppTheme } from "@/lib/theme-config";
import { useCatalogSummary } from "@/lib/use-catalog";
import { getUserProfile, saveUserProfile, type UserProfile } from "@/lib/profile-store";

function readHistoryCount() {
    if (typeof window === "undefined") {
        return 0;
    }

    try {
        const raw = localStorage.getItem("neurax_history");
        const history = raw ? JSON.parse(raw) : [];
        return history.length;
    } catch {
        return 0;
    }
}

export default function SettingsPage() {
    const { user, isLoaded } = useUser();
    const { theme, setTheme } = useTheme();
    const currentTheme = normalizeAppTheme(theme);
    const { data: catalogSummary } = useCatalogSummary();
    const [historyCount, setHistoryCount] = useState(readHistoryCount);
    const [profile, setProfile] = useState<UserProfile>(() => getUserProfile());
    const profileImageSrc = profile.profileImage ?? user?.imageUrl ?? null;

    const handleProfileUpdate = (key: keyof UserProfile, value: string) => {
        const nextProfile = { ...profile, [key]: value };
        setProfile(nextProfile);
        saveUserProfile(nextProfile);
        window.dispatchEvent(new CustomEvent("neurax_profile_updated"));
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            handleProfileUpdate("profileImage", reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleClearHistory = () => {
        localStorage.removeItem("neurax_history");
        setHistoryCount(0);
    };

    if (!isLoaded) {
        return null;
    }

    return (
        <div className="mx-auto max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-2">
                <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground">
                    System Configuration
                </h1>
                <p className="max-w-2xl text-sm font-medium text-muted-foreground">
                    Manage your profile, choose one of the three maintained themes, and inspect the
                    generated local disease catalog.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
                <div className="space-y-10 md:col-span-8">
                    <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm">
                        <div className="absolute right-0 top-0 p-8 opacity-5">
                            <UserCog className="h-24 w-24" />
                        </div>
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="group/avatar relative">
                                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-secondary ring-4 ring-primary/10">
                                    {profileImageSrc ? (
                                        <Image
                                            src={profileImageSrc}
                                            alt="Profile"
                                            width={96}
                                            height={96}
                                            unoptimized
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <UserCog className="h-10 w-10 text-muted-foreground" />
                                    )}
                                </div>
                                <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/45 opacity-0 transition-opacity group-hover/avatar:opacity-100">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white">
                                        Update
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                </label>
                            </div>

                            <div className="flex-1 space-y-3">
                                <div>
                                    <h3 className="text-2xl font-bold tracking-tight text-foreground">
                                        {user?.fullName || user?.username}
                                    </h3>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {user?.primaryEmailAddress?.emailAddress}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                            Clinical Identity
                                        </label>
                                        <input
                                            value={profile.clinicalLevel}
                                            onChange={(event) =>
                                                handleProfileUpdate("clinicalLevel", event.target.value)
                                            }
                                            placeholder="e.g. Senior Physician"
                                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-bold outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                            Department
                                        </label>
                                        <input
                                            value={profile.department}
                                            onChange={(event) =>
                                                handleProfileUpdate("department", event.target.value)
                                            }
                                            placeholder="e.g. Neurology"
                                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-bold outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-6 w-1.5 rounded-full bg-primary" />
                            <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                                Interface Visuals
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {THEME_OPTIONS.map((option) => {
                                const isActive = currentTheme === option.id;
                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => setTheme(option.id)}
                                        className={`rounded-2xl border-2 p-5 text-left transition-all ${
                                            isActive
                                                ? "border-primary bg-primary/5 ring-4 ring-primary/5"
                                                : "border-border bg-card shadow-sm hover:border-primary/25"
                                        }`}
                                    >
                                        <div className="mb-3 flex items-center justify-between">
                                            <div
                                                className="h-8 w-8 rounded-xl shadow-inner"
                                                style={{ backgroundColor: option.color }}
                                            />
                                            {isActive ? <CheckCircle2 className="h-4 w-4 text-primary" /> : null}
                                        </div>
                                        <p className="text-sm font-bold tracking-tight text-card-foreground">
                                            {option.name}
                                        </p>
                                        <p className="mt-1 text-[11px] text-muted-foreground">
                                            {option.description}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="space-y-8 md:col-span-4">
                    <div className="relative overflow-hidden rounded-3xl bg-foreground p-6 text-background shadow-xl">
                        <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                                    Catalog Metrics
                                </h3>
                                <Cpu className="h-4 w-4 text-primary" />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-end justify-between border-b border-white/10 pb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                                        Diseases
                                    </span>
                                    <span className="text-lg font-bold text-primary">
                                        {catalogSummary?.counts.diseases ?? 0}
                                    </span>
                                </div>
                                <div className="flex items-end justify-between border-b border-white/10 pb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                                        Core Symptoms
                                    </span>
                                    <span className="text-lg font-bold text-primary">
                                        {catalogSummary?.counts.coreSymptoms ?? 0}
                                    </span>
                                </div>
                                <div className="flex items-end justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                                        Extended Symptoms
                                    </span>
                                    <span className="text-lg font-bold text-primary">
                                        {catalogSummary?.counts.extendedSymptoms ?? 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <Database className="h-5 w-5 text-muted-foreground" />
                            <h3 className="text-sm font-bold tracking-tight text-card-foreground">
                                Clinical Vault
                            </h3>
                        </div>
                        <p className="text-xs font-medium leading-relaxed text-muted-foreground">
                            Your local diagnostics store contains{" "}
                            <span className="font-bold text-foreground">{historyCount} sessions</span>.
                            Purging clears browser-stored history only.
                        </p>
                        <button
                            onClick={handleClearHistory}
                            disabled={historyCount === 0}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-rose-500/10 transition-all hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Purge Records
                        </button>
                    </div>

                    <div className="pt-4 text-center">
                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                            Clinical Protocol <span className="text-primary italic">IBM Team 63</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
