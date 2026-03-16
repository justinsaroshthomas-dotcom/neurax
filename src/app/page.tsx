"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
    Activity,
    ArrowUpRight,
    Brain,
    Layers3,
    ScanLine,
    ShieldCheck,
    Sparkles,
    Stethoscope,
} from "lucide-react";
import TestimonialSection from "@/components/TestimonialSection";
import { useCatalogSummary } from "@/lib/use-catalog";

const workflowSteps = [
    {
        title: "Capture the case",
        description:
            "Free-text intake and structured symptom selection work together so clinicians can start broad and then tighten the signal.",
        icon: Stethoscope,
    },
    {
        title: "Normalize the evidence",
        description:
            "The local catalog resolves core symptoms, extended aliases, and disease signatures before ranking the differential.",
        icon: Layers3,
    },
    {
        title: "Review ranked outcomes",
        description:
            "Confidence, severity, matched symptoms, and treatment notes are surfaced in a single workflow-ready dashboard.",
        icon: ScanLine,
    },
];

const featureCards = [
    {
        title: "Differential-first engine",
        description:
            "The system is optimized around ranked disease differentials, not a brittle single-label guess.",
        icon: Brain,
    },
    {
        title: "Glass and clay control surfaces",
        description:
            "Soft depth, frosted panels, and tactile action elements keep the experience premium without reducing readability.",
        icon: Sparkles,
    },
    {
        title: "Private local workflow",
        description:
            "Catalog loading, overlap scoring, and optional Python inference run locally for a more controllable clinical loop.",
        icon: ShieldCheck,
    },
];

const quickPrompts = [
    "Headache, light sensitivity, nausea for 6 hours",
    "Shortness of breath, chest pain, fatigue",
    "Skin rash, itching, nodal eruptions",
    "Fever, chills, cough, body ache",
];

export default function Home() {
    const router = useRouter();
    const { isLoaded, userId } = useAuth();
    const { data: catalogSummary } = useCatalogSummary();
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (isLoaded && userId) {
            router.replace("/dashboard");
        }
    }, [isLoaded, router, userId]);

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/sign-in?query=${encodeURIComponent(searchQuery)}`);
        }
    };

    if (!isLoaded || userId) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    const diseaseCount = catalogSummary?.counts.diseases ?? 0;
    const symptomCount =
        (catalogSummary?.counts.coreSymptoms ?? 0) +
        (catalogSummary?.counts.extendedSymptoms ?? 0);
    const top3Accuracy = catalogSummary?.metrics?.top3;
    const f1Score = catalogSummary?.metrics?.f1 ?? 0;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-[color:var(--neon-glow)] blur-3xl" />
                <div className="absolute right-[-10rem] top-[14rem] h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute bottom-[-10rem] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
            </div>

            <header className="sticky top-0 z-50 px-4 py-4 md:px-8">
                <div className="mx-auto flex max-w-7xl items-center justify-between rounded-[2rem] border border-white/35 bg-white/50 px-5 py-4 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.45)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[1.35rem] border border-white/40 bg-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_30px_-20px_rgba(37,99,235,0.75)] dark:border-white/10 dark:bg-white/10">
                            <Activity className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <div className="font-display text-lg font-black tracking-tight">Neurax</div>
                            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-primary/80">
                                Clinical Intelligence Layer
                            </div>
                        </div>
                    </div>

                    <nav className="hidden items-center gap-6 text-sm font-semibold text-muted-foreground lg:flex">
                        <Link href="#workflow" className="transition-colors hover:text-foreground">
                            Workflow
                        </Link>
                        <Link href="#features" className="transition-colors hover:text-foreground">
                            Capabilities
                        </Link>
                        <Link href="#testimonials" className="transition-colors hover:text-foreground">
                            Feedback
                        </Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/sign-in"
                            className="rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5"
                        >
                            Sign in
                        </Link>
                        <Link
                            href="/sign-up"
                            className="rounded-full bg-primary px-5 py-2 text-sm font-black text-primary-foreground shadow-[0_18px_30px_-18px_rgba(37,99,235,0.9)] transition-transform hover:-translate-y-0.5"
                        >
                            Launch Workspace
                        </Link>
                    </div>
                </div>
            </header>

            <main className="px-4 pb-20 pt-6 md:px-8">
                <section className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.35fr_0.85fr]">
                    <div className="glass-panel relative overflow-hidden rounded-[2.5rem] border border-white/40 p-8 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.55)] dark:border-white/10 md:p-10">
                        <div className="absolute right-8 top-8 hidden rounded-full border border-white/40 bg-white/45 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary backdrop-blur-xl dark:border-white/10 dark:bg-white/5 lg:flex">
                            Glass Diagnostic Surface
                        </div>

                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                            <Sparkles className="h-3.5 w-3.5" />
                            Top-3 differential accuracy {top3Accuracy != null ? `${top3Accuracy.toFixed(2)}%` : "loading"}
                        </div>

                        <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-tight md:text-7xl">
                            A calmer clinical interface for fast, ranked disease reasoning.
                        </h1>

                        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">
                            Neurax pairs a generated local disease catalog with a premium glass-and-clay
                            interaction system. The result is a home page that feels intentional and a
                            dashboard that stays readable under real diagnostic load.
                        </p>

                        <form onSubmit={handleSearch} className="mt-10">
                            <div className="rounded-[2rem] border border-white/45 bg-white/55 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_24px_40px_-26px_rgba(15,23,42,0.32)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
                                <div className="flex flex-col gap-3 lg:flex-row">
                                    <textarea
                                        value={searchQuery}
                                        onChange={(event) => setSearchQuery(event.target.value)}
                                        placeholder="Describe the patient, timeline, symptom clusters, and any risk context."
                                        className="min-h-[140px] flex-1 resize-none rounded-[1.45rem] border border-white/60 bg-background/80 px-5 py-4 text-base outline-none ring-0 transition-all placeholder:text-muted-foreground/80 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-white/10 dark:bg-background/70"
                                        required
                                    />
                                    <div className="flex w-full flex-col gap-3 lg:w-[16rem]">
                                        <button
                                            type="submit"
                                            className="flex h-16 items-center justify-center gap-2 rounded-[1.45rem] bg-primary px-6 text-sm font-black uppercase tracking-[0.2em] text-primary-foreground shadow-[0_22px_34px_-24px_rgba(37,99,235,0.95)] transition-transform hover:-translate-y-0.5"
                                        >
                                            Analyze Case
                                            <ArrowUpRight className="h-4 w-4" />
                                        </button>
                                        <div className="rounded-[1.45rem] border border-white/55 bg-white/70 p-4 text-sm text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_18px_30px_-24px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-white/5">
                                            Start from natural language, then move into the structured picker in the dashboard.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className="mt-6 flex flex-wrap gap-3">
                            {quickPrompts.map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => setSearchQuery(prompt)}
                                    className="rounded-full border border-white/55 bg-white/65 px-4 py-2 text-sm font-semibold text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_24px_-20px_rgba(15,23,42,0.4)] transition-transform hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="rounded-[2.5rem] border border-white/40 bg-white/55 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_28px_70px_-42px_rgba(15,23,42,0.45)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary/80">
                                        Live Engine Snapshot
                                    </p>
                                    <h2 className="mt-2 text-2xl font-black tracking-tight">
                                        Generated local catalog
                                    </h2>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-[1.3rem] bg-primary/10 text-primary shadow-[0_18px_28px_-24px_rgba(37,99,235,0.95)]">
                                    <Brain className="h-5 w-5" />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-[1.6rem] border border-white/50 bg-white/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_14px_24px_-20px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-white/5">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                        Diseases
                                    </div>
                                    <div className="mt-2 text-3xl font-black">{diseaseCount}</div>
                                </div>
                                <div className="rounded-[1.6rem] border border-white/50 bg-white/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_14px_24px_-20px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-white/5">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                        Searchable Symptoms
                                    </div>
                                    <div className="mt-2 text-3xl font-black">{symptomCount}</div>
                                </div>
                                <div className="rounded-[1.6rem] border border-white/50 bg-white/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_14px_24px_-20px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-white/5">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                        Top-3 Accuracy
                                    </div>
                                    <div className="mt-2 text-3xl font-black text-primary">
                                        {top3Accuracy != null ? `${top3Accuracy.toFixed(2)}%` : "--"}
                                    </div>
                                </div>
                                <div className="rounded-[1.6rem] border border-white/50 bg-white/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_14px_24px_-20px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-white/5">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                        Weighted F1
                                    </div>
                                    <div className="mt-2 text-3xl font-black">{f1Score.toFixed(2)}%</div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[2.5rem] border border-white/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.74),rgba(255,255,255,0.42))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_28px_70px_-40px_rgba(15,23,42,0.42)] backdrop-blur-2xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))]">
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary/80">
                                Why this matters
                            </p>
                            <p className="mt-4 text-base leading-7 text-muted-foreground">
                                For differential diagnosis, ranked relevance matters more than forcing a
                                single brittle answer. The current model clears 90% on top-3 ranking,
                                which is the honest metric to optimize for this interface.
                            </p>
                        </div>
                    </div>
                </section>

                <section id="features" className="mx-auto mt-24 max-w-7xl">
                    <div className="mb-10 flex items-end justify-between gap-6">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary/80">
                                Capability Stack
                            </p>
                            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
                                Premium surfaces, clinical structure, and ranked ML outputs.
                            </h2>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {featureCards.map(({ title, description, icon: Icon }) => (
                            <article
                                key={title}
                                className="rounded-[2rem] border border-white/40 bg-white/55 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_30px_60px_-42px_rgba(15,23,42,0.45)] backdrop-blur-2xl transition-transform hover:-translate-y-1 dark:border-white/10 dark:bg-white/5"
                            >
                                <div className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-primary/10 text-primary shadow-[0_18px_30px_-22px_rgba(37,99,235,0.95)]">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <h3 className="mt-6 text-2xl font-black tracking-tight">{title}</h3>
                                <p className="mt-3 text-base leading-7 text-muted-foreground">
                                    {description}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>

                <section id="workflow" className="mx-auto mt-24 max-w-7xl rounded-[2.5rem] border border-white/35 bg-white/45 p-8 shadow-[0_30px_90px_-48px_rgba(15,23,42,0.45)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 md:p-10">
                    <div className="mb-10 max-w-3xl">
                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary/80">
                            Clinical Workflow
                        </p>
                        <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
                            Built for differential reasoning, not decorative dashboards.
                        </h2>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {workflowSteps.map(({ title, description, icon: Icon }, index) => (
                            <div
                                key={title}
                                className="rounded-[2rem] border border-white/45 bg-white/75 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_30px_-26px_rgba(15,23,42,0.4)] dark:border-white/10 dark:bg-white/5"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-primary/10 text-primary">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="text-4xl font-black text-primary/20">{index + 1}</div>
                                </div>
                                <h3 className="mt-6 text-2xl font-black tracking-tight">{title}</h3>
                                <p className="mt-3 text-base leading-7 text-muted-foreground">
                                    {description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <TestimonialSection />

                <section className="mx-auto mt-24 max-w-7xl">
                    <div className="rounded-[2.8rem] border border-white/40 bg-[linear-gradient(135deg,rgba(255,255,255,0.7),rgba(255,255,255,0.42))] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_28px_70px_-40px_rgba(15,23,42,0.45)] backdrop-blur-2xl dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] md:p-10">
                        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary/80">
                                    Ready for the dashboard
                                </p>
                                <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
                                    Enter the ranked differential workspace and move from intake to review.
                                </h2>
                                <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                                    The live dashboard is where the generated catalog, symptom picker,
                                    ranked predictions, and report workflow come together.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
                                <Link
                                    href="/sign-up"
                                    className="flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-black uppercase tracking-[0.2em] text-primary-foreground shadow-[0_20px_34px_-24px_rgba(37,99,235,0.95)] transition-transform hover:-translate-y-0.5"
                                >
                                    Open Workspace
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href="/sign-in"
                                    className="flex items-center justify-center rounded-full border border-border bg-background/80 px-6 py-3 text-sm font-black uppercase tracking-[0.2em] text-foreground transition-transform hover:-translate-y-0.5"
                                >
                                    Sign In
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
