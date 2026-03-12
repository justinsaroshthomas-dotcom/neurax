"use client";

import * as React from "react";
import { Check, Leaf, MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { THEME_OPTIONS, normalizeAppTheme, type AppTheme } from "@/lib/theme-config";

const themeIcons: Record<AppTheme, React.ComponentType<{ className?: string }>> = {
    light: SunMedium,
    midnight: MoonStar,
    emerald: Leaf,
};

const themeSwatches: Record<AppTheme, string> = {
    light: "bg-blue-500",
    midnight: "bg-violet-600",
    emerald: "bg-emerald-500",
};

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const currentTheme = normalizeAppTheme(theme);
    const CurrentIcon = themeIcons[currentTheme] ?? SunMedium;

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-2xl border border-border bg-card/70 text-foreground shadow-sm"
                onClick={() => setIsOpen((open) => !open)}
            >
                <CurrentIcon className="h-[1.1rem] w-[1.1rem]" />
                <span className="sr-only">Select theme</span>
            </Button>

            {isOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-border bg-popover/95 p-2 shadow-2xl backdrop-blur">
                    <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                        Interface Theme
                    </div>
                    {THEME_OPTIONS.map((option) => {
                        const Icon = themeIcons[option.id];
                        const isActive = currentTheme === option.id;

                        return (
                            <button
                                key={option.id}
                                onClick={() => {
                                    setTheme(option.id);
                                    setIsOpen(false);
                                }}
                                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                                    isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/70"
                                }`}
                            >
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-xl text-white ${themeSwatches[option.id]}`}
                                >
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-bold">{option.name}</div>
                                    <div className="text-[11px] text-muted-foreground">
                                        {option.description}
                                    </div>
                                </div>
                                {isActive ? <Check className="h-4 w-4 text-primary" /> : null}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
