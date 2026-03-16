"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme, type ThemeProviderProps } from "next-themes";
import {
    LEGACY_THEME_STORAGE_KEYS,
    THEME_IDS,
    THEME_STORAGE_KEY,
    isDarkTheme,
    normalizeAppTheme,
} from "@/lib/theme-config";

function ThemeSanitizer() {
    const { theme, setTheme } = useTheme();

    React.useLayoutEffect(() => {
        const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (!storedTheme) {
            const legacyTheme = LEGACY_THEME_STORAGE_KEYS
                .map((key) => window.localStorage.getItem(key))
                .find((value): value is string => Boolean(value));

            if (legacyTheme) {
                const normalizedLegacyTheme = normalizeAppTheme(legacyTheme);
                window.localStorage.setItem(THEME_STORAGE_KEY, normalizedLegacyTheme);
                if (theme !== normalizedLegacyTheme) {
                    setTheme(normalizedLegacyTheme);
                    return;
                }
            }
        }

        const normalizedTheme = normalizeAppTheme(theme);
        if (theme !== normalizedTheme) {
            setTheme(normalizedTheme);
        }
    }, [setTheme, theme]);

    return null;
}

function ThemeRootClassSync() {
    const { theme } = useTheme();

    React.useLayoutEffect(() => {
        const root = document.documentElement;
        const normalizedTheme = normalizeAppTheme(theme);

        root.classList.remove(...THEME_IDS);
        root.classList.remove("dark");
        root.classList.add(normalizedTheme);

        if (isDarkTheme(normalizedTheme)) {
            root.classList.add("dark");
        }
    }, [theme]);

    return null;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return (
        <NextThemesProvider {...props}>
            <ThemeSanitizer />
            <ThemeRootClassSync />
            {children}
        </NextThemesProvider>
    );
}
