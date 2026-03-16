export const THEME_OPTIONS = [
    // ── Light themes ─────────────────────────────────────────────────────────
    {
        id: "light",
        name: "Clinical Light",
        shortName: "Light",
        color: "#2563eb",
        description: "Bright, neutral, and easy to read.",
        dark: false,
    },
    {
        id: "rose",
        name: "Rose Quartz",
        shortName: "Rose",
        color: "#e11d48",
        description: "Warm, clinical pink accent light theme.",
        dark: false,
    },
    {
        id: "amber",
        name: "Amber Glow",
        shortName: "Amber",
        color: "#d97706",
        description: "Golden warm tones, easy on the eyes.",
        dark: false,
    },
    {
        id: "ocean",
        name: "Ocean Breeze",
        shortName: "Ocean",
        color: "#0891b2",
        description: "Cool teal & cyan, calm and focused.",
        dark: false,
    },
    // ── Dark themes ──────────────────────────────────────────────────────────
    {
        id: "dark",
        name: "Dark",
        shortName: "Dark",
        color: "#6366f1",
        description: "Deep contrast with indigo accents.",
        dark: true,
    },
    {
        id: "midnight",
        name: "Midnight",
        shortName: "Midnight",
        color: "#7c3aed",
        description: "Deep contrast with cool violet accents.",
        dark: true,
    },
    {
        id: "emerald",
        name: "Emerald",
        shortName: "Emerald",
        color: "#059669",
        description: "Dark clinical canvas with emerald emphasis.",
        dark: true,
    },
] as const;

export type AppTheme = (typeof THEME_OPTIONS)[number]["id"];

export const THEME_IDS = THEME_OPTIONS.map((theme) => theme.id) as AppTheme[];
export const DARK_THEME_IDS = THEME_OPTIONS.filter((t) => t.dark).map((t) => t.id) as AppTheme[];
export const THEME_STORAGE_KEY = "neurax-theme";
export const LEGACY_THEME_STORAGE_KEYS = ["theme"] as const;

const LEGACY_THEME_MAP: Record<string, AppTheme> = {
    "dark midnight": "midnight",
    "dark emerald": "emerald",
    "dark dark": "dark",
};

export function normalizeAppTheme(theme: string | null | undefined): AppTheme {
    if (!theme) {
        return "light";
    }

    const normalized = LEGACY_THEME_MAP[theme] ?? theme;
    return THEME_IDS.includes(normalized as AppTheme) ? (normalized as AppTheme) : "light";
}

export function isDarkTheme(theme: string | null | undefined): boolean {
    return DARK_THEME_IDS.includes(normalizeAppTheme(theme));
}
