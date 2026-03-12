"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Activity,
    BarChart2,
    History,
    LayoutDashboard,
    Settings,
    ShieldCheck,
} from "lucide-react";
import { useCatalogSummary } from "@/lib/use-catalog";

const navItems = [
    { title: "Dashboard", subtitle: "Clinical cockpit", url: "/dashboard", icon: LayoutDashboard },
    { title: "Intelligence", subtitle: "Prediction history", url: "/dashboard/history", icon: History },
    { title: "Analytics", subtitle: "Model telemetry", url: "/dashboard/analytics", icon: BarChart2 },
    { title: "Configuration", subtitle: "Themes and profile", url: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: catalogSummary } = useCatalogSummary();
    const top3Value = catalogSummary?.metrics?.top3;

    return (
        <aside className="flex h-screen w-20 shrink-0 border-r border-white/20 bg-white/10 pl-3 pr-px pt-6 backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 lg:w-[17rem] lg:pl-5">
            <div className="flex w-full flex-col">
                <div className="rounded-[2rem] border border-white/45 bg-white/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_24px_44px_-30px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-white/5 lg:p-4">
                    <div className="flex items-center justify-center gap-3 lg:justify-start">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[1.35rem] bg-white/70 text-primary shadow-[0_18px_28px_-22px_rgba(37,99,235,0.95)] dark:bg-white/10">
                            <Activity className="h-5 w-5 stroke-[2.4]" />
                        </div>
                        <div className="hidden lg:block">
                            <p className="font-display text-lg font-black tracking-tight text-foreground">
                                Neurax
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary/80">
                                Diagnostic OS
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 hidden grid-cols-2 gap-3 lg:grid">
                        <div className="rounded-[1.4rem] border border-white/55 bg-white/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_16px_24px_-24px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-white/5">
                            <div className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                                Diseases
                            </div>
                            <div className="mt-2 text-xl font-black text-foreground">
                                {catalogSummary?.counts.diseases ?? 0}
                            </div>
                        </div>
                        <div className="rounded-[1.4rem] border border-white/55 bg-white/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_16px_24px_-24px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-white/5">
                            <div className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                                Top-3
                            </div>
                            <div className="mt-2 text-xl font-black text-primary">
                                {top3Value != null ? `${top3Value.toFixed(1)}%` : "--"}
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="mt-8 flex flex-1 flex-col gap-3">
                    {navItems.map((item) => {
                        const isActive = pathname === item.url;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.title}
                                href={item.url}
                                className={`group rounded-[1.6rem] border px-3 py-3 transition-all lg:px-4 ${
                                    isActive
                                        ? "border-slate-200/90 bg-white/85 shadow-[0_18px_32px_-24px_rgba(37,99,235,0.85)] dark:border-white/20 dark:bg-white/10"
                                        : "border-transparent bg-transparent hover:border-white/35 hover:bg-white/45 dark:hover:border-white/10 dark:hover:bg-white/5"
                                }`}
                            >
                                <div className="flex items-center justify-center gap-3 lg:justify-start">
                                    <div
                                        className={`flex h-11 w-11 items-center justify-center rounded-[1.15rem] ${
                                            isActive
                                                ? "bg-transparent text-foreground"
                                                : "bg-transparent text-muted-foreground group-hover:text-foreground"
                                        }`}
                                    >
                                        <Icon className="h-4.5 w-4.5" />
                                    </div>
                                    <div className="hidden min-w-0 lg:block">
                                        <div className="text-sm font-black tracking-tight text-foreground">
                                            {item.title}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground">
                                            {item.subtitle}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="hidden rounded-[1.8rem] border border-white/40 bg-white/65 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_20px_34px_-26px_rgba(15,23,42,0.4)] dark:border-white/10 dark:bg-white/5 lg:block">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-emerald-500/15 text-emerald-500">
                            <ShieldCheck className="h-4.5 w-4.5" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-foreground">
                                Local Runtime
                            </p>
                            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                                Catalog scoring stays available even if the Python model is offline.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
