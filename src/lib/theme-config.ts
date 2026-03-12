export const THEME_OPTIONS = [
    {
        id: "light",
        name: "Clinical Light",
        shortName: "Light",
        color: "#2563eb",
        description: "Bright, neutral, and easy to read.",
    },
    {
        id: "midnight",
        name: "Midnight",
        shortName: "Midnight",
        color: "#7c3aed",
        description: "Deep contrast with cool indigo accents.",
    },
    {
        id: "emerald",
        name: "Emerald",
        shortName: "Emerald",
        color: "#059669",
        description: "Dark clinical canvas with emerald emphasis.",
    },
] as const;

export type AppTheme = (typeof THEME_OPTIONS)[number]["id"];

export const THEME_IDS = THEME_OPTIONS.map((theme) => theme.id) as AppTheme[];
export const THEME_STORAGE_KEY = "neurax-theme";
export const LEGACY_THEME_STORAGE_KEYS = ["theme"] as const;

const LEGACY_THEME_MAP: Record<string, AppTheme> = {
    "dark midnight": "midnight",
    "dark emerald": "emerald",
};

export function normalizeAppTheme(theme: string | null | undefined): AppTheme {
    if (!theme) {
        return "light";
    }

    const normalized = LEGACY_THEME_MAP[theme] ?? theme;
    return THEME_IDS.includes(normalized as AppTheme) ? (normalized as AppTheme) : "light";
}

export function isDarkTheme(theme: string | null | undefined): boolean {
    return normalizeAppTheme(theme) !== "light";
}
