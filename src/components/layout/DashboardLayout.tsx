"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

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
    }, [isLoaded, router, user]);

    if (!isLoaded || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen w-full overflow-hidden bg-background text-foreground transition-colors duration-500">
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-[color:var(--neon-glow)] blur-3xl" />
                <div className="absolute right-[-10rem] top-[18rem] h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute bottom-[-10rem] left-[30%] h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
            </div>

            <Sidebar />

            <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
                <TopBar />

                <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 pb-8 pt-4 md:px-6 lg:px-8">
                    <div className="mx-auto flex min-h-full w-full max-w-[1520px] flex-col">
                        <div className="flex-1 rounded-[2.5rem] border border-border bg-card/60 p-4 shadow-sm backdrop-blur-2xl md:p-6 lg:p-7">
                            {children}
                        </div>

                        <footer className="mt-10 flex flex-col items-center justify-between gap-6 px-2 pb-10 pt-8 md:flex-row">
                            <div className="flex items-center gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-[1.25rem] bg-primary/10 font-black text-primary shadow-[0_16px_28px_-22px_rgba(37,99,235,0.95)]">
                                    N
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-display text-[10px] font-black uppercase tracking-[0.24em] text-foreground">
                                        Neurax Neural OS
                                    </span>
                                    <span className="text-[9px] font-black uppercase tracking-[0.22em] text-primary/80">
                                        Clinical Workspace
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-1 md:items-end">
                                <p className="text-center text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground md:text-right">
                                    Justin Thomas, Devika NS, Krishnajith Vijay, and Sivaranj P8
                                </p>
                                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-primary/80">
                                    Lead Engineer: Justin Thomas
                                </p>
                            </div>
                        </footer>
                    </div>
                </main>
            </div>
        </div>
    );
}
