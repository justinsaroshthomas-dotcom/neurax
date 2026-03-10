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
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#7B61FF] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <div className="flex min-h-screen w-full bg-[#F8F9FA] dark:bg-slate-950 text-[#1A1A1A] dark:text-slate-100 font-sans overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    <TopBar />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto">
                        <div className="h-full p-8 w-full max-w-[1400px] mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </ThemeProvider>
    );
}
