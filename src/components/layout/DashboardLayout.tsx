"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";

const navItems = [
    {
        title: "Predict",
        url: "/dashboard",
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
        ),
    },
    {
        title: "History",
        url: "/dashboard/history",
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
        ),
    },
    {
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
        ),
    },
    {
        title: "Settings",
        url: "/dashboard/settings",
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
        ),
    },
];

function FallbackAvatar() {
    return (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--cyber-surface-2)] ring-1 ring-[rgba(0,240,255,0.3)] flex items-center justify-center">
                <svg className="w-4 h-4 text-[var(--neon)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">User</p>
                <p className="text-[10px] text-[var(--muted-foreground)] truncate">Local Mode</p>
            </div>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-[var(--cyber-bg)]">
                <Sidebar className="border-r border-[rgba(0,240,255,0.1)]">
                    <SidebarHeader className="p-4 border-b border-[rgba(0,240,255,0.1)]">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg neon-border flex items-center justify-center bg-[var(--cyber-surface)]">
                                <svg viewBox="0 0 24 24" className="w-5 h-5 text-[var(--neon)]" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M12 2v20M2 12h20" strokeLinecap="round" />
                                    <circle cx="12" cy="12" r="4" />
                                </svg>
                            </div>
                            <div>
                                <span className="font-bold text-sm neon-text-subtle">NeuraMed</span>
                                <p className="text-[10px] text-[var(--muted-foreground)] tracking-wider uppercase">
                                    Diagnostics v2.0
                                </p>
                            </div>
                        </Link>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted-foreground)] px-4">
                                Navigation
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {navItems.map((item) => {
                                        const isActive = pathname === item.url;
                                        return (
                                            <SidebarMenuItem key={item.title}>
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={isActive}
                                                    className={
                                                        isActive
                                                            ? "bg-[rgba(0,240,255,0.08)] text-[var(--neon)] border border-[rgba(0,240,255,0.2)]"
                                                            : "text-[var(--muted-foreground)] hover:text-foreground hover:bg-[rgba(0,240,255,0.03)]"
                                                    }
                                                >
                                                    <Link href={item.url} className="flex items-center gap-3">
                                                        {item.icon}
                                                        <span className="text-sm">{item.title}</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        );
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        {/* System Status */}
                        <SidebarGroup className="mt-auto">
                            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted-foreground)] px-4">
                                System
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <div className="px-4 py-3 mx-2 rounded-lg bg-[var(--cyber-surface)] neon-border">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                                        <span className="text-[11px] text-[var(--muted-foreground)]">
                                            Engine Online
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)]">
                                        <span>Diseases: 18</span>
                                        <span>Symptoms: 50</span>
                                    </div>
                                </div>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter className="p-4 border-t border-[rgba(0,240,255,0.1)]">
                        <FallbackAvatar />
                    </SidebarFooter>
                </Sidebar>

                {/* Main content */}
                <main className="flex-1 flex flex-col min-h-screen">
                    {/* Top bar */}
                    <header className="h-14 border-b border-[rgba(0,240,255,0.1)] bg-[var(--cyber-bg)]/80 backdrop-blur-xl flex items-center px-4 gap-4 sticky top-0 z-30">
                        <SidebarTrigger className="text-[var(--muted-foreground)] hover:text-[var(--neon)]" />
                        <div className="h-5 w-px bg-[rgba(0,240,255,0.1)]" />
                        <div className="flex-1" />
                        <div className="flex items-center gap-2 text-[11px] text-[var(--muted-foreground)]">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--neon)] animate-pulse" />
                            <span className="font-mono">SYSTEM ACTIVE</span>
                        </div>
                    </header>

                    {/* Page content */}
                    <div className="flex-1 p-6 cyber-grid overflow-auto">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
