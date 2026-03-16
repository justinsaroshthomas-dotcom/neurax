import { NextResponse } from "next/server";
import { loadCatalogSummary } from "@/lib/catalog.server";

export async function GET() {
    const clerkConfigured =
        !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
        !!process.env.CLERK_SECRET_KEY;
    const supabaseConfigured =
        !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const mongoConfigured = !!process.env.MONGODB_URI;
    const sentryConfigured = !!process.env.SENTRY_DSN;
    const groqConfigured = !!process.env.GROQ_API_KEY;
    const summary = await loadCatalogSummary();

    const integrations = [
        {
            name: "Groq AI",
            envKey: "GROQ_API_KEY",
            status: groqConfigured ? "Connected" : "Local fallback",
            connected: groqConfigured,
            mode: groqConfigured ? "cloud" : "local",
            description: "AI-assisted symptom analysis",
        },
        {
            name: "Prediction Engine",
            envKey: "",
            status: "Online",
            connected: true,
            mode: "active",
            description: `Generated symptom catalog (${summary.counts.diseases} diseases | ${summary.counts.coreSymptoms} core symptoms | ${summary.counts.extendedSymptoms} extended symptoms)`,
        },
        {
            name: "Local Storage",
            envKey: "",
            status: "Active",
            connected: true,
            mode: "active",
            description: "Prediction history and analytics (browser-based)",
        },
        {
            name: "Clerk Authentication",
            envKey: "CLERK_SECRET_KEY",
            status: clerkConfigured ? "Connected" : "Local mode",
            connected: clerkConfigured,
            mode: clerkConfigured ? "cloud" : "local",
            description: clerkConfigured
                ? "User authentication and management"
                : "Open access, add Clerk keys to enable auth",
        },
        {
            name: "Supabase (Postgres)",
            envKey: "SUPABASE_DB_URL",
            status: supabaseConfigured ? "Connected" : "Generated catalog active",
            connected: supabaseConfigured,
            mode: supabaseConfigured ? "cloud" : "generated",
            description: supabaseConfigured
                ? "Disease database with RLS"
                : "Using generated local disease catalog",
        },
        {
            name: "MongoDB Atlas",
            envKey: "MONGODB_URI",
            status: mongoConfigured ? "Connected" : "Local storage active",
            connected: mongoConfigured,
            mode: mongoConfigured ? "cloud" : "local",
            description: mongoConfigured
                ? "Cloud prediction logs and audit trail"
                : "Using browser localStorage for history",
        },
        {
            name: "Sentry Monitoring",
            envKey: "SENTRY_DSN",
            status: sentryConfigured ? "Connected" : "Console logging",
            connected: sentryConfigured,
            mode: sentryConfigured ? "cloud" : "local",
            description: sentryConfigured
                ? "Error tracking with Session Replay"
                : "Errors logged to browser console",
        },
    ];

    return NextResponse.json({ integrations, summary });
}
