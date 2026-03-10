"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LayoutDashboard, History, BarChart2, Settings, ShieldCheck } from "lucide-react";

const navItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Intelligence", url: "/dashboard/history", icon: History },
    { title: "Analytics", url: "/dashboard/analytics", icon: BarChart2 },
    { title: "Configuration", url: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-20 bg-background border-r border-border flex flex-col items-center py-8 z-40 shrink-0 sticky top-0 h-screen transition-all duration-300">
            {/* Elite Brand Mark */}
            <div className="mb-12 relative group">
                <div className="w-11 h-11 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center shadow-2xl relative z-10 overflow-hidden transition-transform group-hover:scale-110">
                    <Activity className="text-primary w-6 h-6 stroke-[2.5]" />
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {/* Glow ring */}
                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl scale-90 group-hover:scale-125 transition-transform opacity-0 group-hover:opacity-100" />
            </div>

            {/* High-Contrast Navigation */}
            <nav className="flex flex-col gap-8 flex-1 w-full items-center">
                {navItems.map((item) => {
                    const isActive = pathname === item.url;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.title}
                            href={item.url}
                            title={item.title}
                            className={`group relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 hover:ring-1 hover:ring-slate-200 dark:hover:ring-slate-700 ${
                                isActive
                                    ? "text-primary bg-primary/10 shadow-sm"
                                    : "text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                        >
                            <Icon strokeWidth={isActive ? 2.5 : 2} className="w-5 h-5 z-10 transition-transform group-hover:scale-110" />
                            
                            {isActive && (
                                <div className="absolute -left-0 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                            )}
                            
                            {/* Hover tooltip hint */}
                            <div className="absolute left-16 px-2 py-1 rounded-md bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                {item.title}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Support/Shield Icon */}
            <div className="mt-auto">
                <button className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-300 hover:text-primary transition-all group">
                    <ShieldCheck className="w-5 h-5 group-hover:scale-110" />
                </button>
            </div>
        </aside>
    );
}
