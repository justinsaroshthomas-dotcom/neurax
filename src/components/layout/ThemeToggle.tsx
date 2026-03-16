"use client";

import * as React from "react";
import { Check, Droplets, Flame, Leaf, Moon, MoonStar, SunMedium, Waves } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { THEME_OPTIONS, normalizeAppTheme, type AppTheme } from "@/lib/theme-config";

const themeIcons: Record<AppTheme, React.ComponentType<{ className?: string }>> = {
    light: SunMedium,
    rose: Flame,
    amber: Droplets,
    ocean: Waves,
    dark: Moon,
    midnight: MoonStar,
    emerald: Leaf,
};

const themeSwatches: Record<AppTheme, string> = {
    light: "bg-blue-500",
    rose: "bg-rose-500",
    amber: "bg-amber-500",
    ocean: "bg-cyan-600",
    dark: "bg-indigo-500",
    midnight: "bg-violet-600",
    emerald: "bg-emerald-500",
};

const LIGHT_THEMES = THEME_OPTIONS.filter((t) => !t.dark);
const DARK_THEMES = THEME_OPTIONS.filter((t) => t.dark);

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
                className="h-10 w-10 rounded-2xl border border-border bg-card/70 text-foreground shadow-sm transition-all hover:scale-105 active:scale-95"
                onClick={() => setIsOpen((open) => !open)}
            >
                <CurrentIcon className="h-[1.1rem] w-[1.1rem]" />
                <span className="sr-only">Select theme</span>
            </Button>

            {isOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-border bg-popover/95 p-2 shadow-2xl backdrop-blur">
                    {/* Light Themes Section */}
                    <div className="px-2 pb-1 pt-1.5 text-[9px] font-black uppercase tracking-[0.26em] text-muted-foreground/70">
                        ☀ Light Themes
                    </div>
                    {LIGHT_THEMES.map((option) => {
                        const Icon = themeIcons[option.id as AppTheme];
                        const isActive = currentTheme === option.id;

                        return (
                            <button
                                key={option.id}
                                onClick={() => {
                                    setTheme(option.id);
                                    setIsOpen(false);
                                }}
                                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-all ${
                                    isActive
                                        ? "bg-accent text-accent-foreground"
                                        : "hover:bg-accent/60"
                                }`}
                            >
                                <div
                                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-white shadow-sm ${themeSwatches[option.id as AppTheme]}`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-[12px] font-bold leading-tight">{option.name}</div>
                                    <div className="text-[10px] leading-snug text-muted-foreground">
                                        {option.description}
                                    </div>
                                </div>
                                {isActive && <Check className="h-3.5 w-3.5 flex-shrink-0 text-primary" />}
                            </button>
                        );
                    })}

                    {/* Divider */}
                    <div className="my-1.5 border-t border-border/60" />

                    {/* Dark Themes Section */}
                    <div className="px-2 pb-1 text-[9px] font-black uppercase tracking-[0.26em] text-muted-foreground/70">
                        ☽ Dark Themes
                    </div>
                    {DARK_THEMES.map((option) => {
                        const Icon = themeIcons[option.id as AppTheme];
                        const isActive = currentTheme === option.id;

                        return (
                            <button
                                key={option.id}
                                onClick={() => {
                                    setTheme(option.id);
                                    setIsOpen(false);
                                }}
                                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-all ${
                                    isActive
                                        ? "bg-accent text-accent-foreground"
                                        : "hover:bg-accent/60"
                                }`}
                            >
                                <div
                                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-white shadow-sm ${themeSwatches[option.id as AppTheme]}`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-[12px] font-bold leading-tight">{option.name}</div>
                                    <div className="text-[10px] leading-snug text-muted-foreground">
                                        {option.description}
                                    </div>
                                </div>
                                {isActive && <Check className="h-3.5 w-3.5 flex-shrink-0 text-primary" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
