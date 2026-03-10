"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { ThemeProvider } from "next-themes";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user, isLoaded } = useUser();

    useEffect(() => {
        if (isLoaded && !user) {
            router.replace("/sign-in");
        }
    }, [isLoaded, user, router]);

    // Don't render until auth check is done
    if (!isLoaded || !user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full bg-background text-foreground font-sans overflow-hidden transition-colors duration-500">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <TopBar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    <div className="min-h-full p-8 w-full max-w-[1400px] mx-auto flex flex-col">
                        <div className="flex-1">
                            {children}
                        </div>
                        
                        {/* Clinical Footer Restoration */}
                        <footer className="mt-20 pt-10 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 pb-12 opacity-80">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-primary font-black shadow-lg">N</div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white font-display">Neurax Neural OS</span>
                                    <span className="text-[9px] font-bold text-primary uppercase tracking-widest italic">Clinical Protocol — IBM TEAM 63</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center md:items-end gap-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center md:text-right">
                                    Developed by <span className="text-slate-900 dark:text-white">Justin Thomas, Devika NS, Krishnajith Vijay, and Sivaranj P8</span>
                                </p>
                                <p className="text-[8px] font-bold text-primary uppercase tracking-[0.1em] italic">Lead Engineer: Justin Thomas</p>
                            </div>
                        </footer>
                    </div>
                </main>
            </div>
        </div>
    );
}
