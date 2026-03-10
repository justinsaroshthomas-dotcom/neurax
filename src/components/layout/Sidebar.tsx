"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LayoutDashboard, History, BarChart2, Settings, UploadCloud } from "lucide-react";

const navItems = [
    { title: "Predict", url: "/dashboard", icon: LayoutDashboard },
    { title: "History", url: "/dashboard/history", icon: History },
    { title: "Analytics", url: "/dashboard/analytics", icon: BarChart2 },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-8 z-10 shrink-0 shadow-[2px_0_8px_rgba(0,0,0,0.02)]">
            {/* Logo Mark */}
            <div className="mb-12">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7B61FF] to-[#6042ef] flex items-center justify-center shadow-lg shadow-[#7B61FF]/30">
                    <Activity className="text-white w-6 h-6" />
                </div>
            </div>

            {/* Navigation Icons */}
            <nav className="flex flex-col gap-6 flex-1 w-full items-center">
                {navItems.map((item) => {
                    const isActive = pathname === item.url;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.title}
                            href={item.url}
                            title={item.title}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                                isActive
                                    ? "bg-[#7B61FF]/10 text-[#7B61FF]"
                                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                            }`}
                        >
                            <Icon strokeWidth={isActive ? 2.5 : 2} className="w-5 h-5" />
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Action */}
            <div className="mt-auto flex flex-col items-center gap-6">
                 <button className="w-12 h-12 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all">
                    <UploadCloud className="w-5 h-5" />
                </button>
            </div>
        </aside>
    );
}
