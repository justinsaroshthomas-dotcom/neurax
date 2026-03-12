import type { LucideIcon } from "lucide-react";

interface QuickStatBadgeProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    color?: "indigo" | "emerald" | "rose" | "amber";
}

const colorMap = {
    indigo: {
        shell: "border-indigo-100/90 bg-white/80 dark:border-indigo-500/20 dark:bg-white/5",
        iconWrap: "bg-indigo-500 text-white shadow-[0_18px_30px_-20px_rgba(99,102,241,0.95)]",
        value: "text-indigo-600 dark:text-indigo-300",
        glow: "shadow-[0_22px_36px_-28px_rgba(99,102,241,0.75)]",
    },
    emerald: {
        shell: "border-emerald-100/90 bg-white/80 dark:border-emerald-500/20 dark:bg-white/5",
        iconWrap: "bg-emerald-500 text-white shadow-[0_18px_30px_-20px_rgba(16,185,129,0.95)]",
        value: "text-emerald-500 dark:text-emerald-300",
        glow: "shadow-[0_22px_36px_-28px_rgba(16,185,129,0.75)]",
    },
    rose: {
        shell: "border-rose-100/90 bg-white/80 dark:border-rose-500/20 dark:bg-white/5",
        iconWrap: "bg-rose-500 text-white shadow-[0_18px_30px_-20px_rgba(244,63,94,0.95)]",
        value: "text-rose-500 dark:text-rose-300",
        glow: "shadow-[0_22px_36px_-28px_rgba(244,63,94,0.75)]",
    },
    amber: {
        shell: "border-amber-100/90 bg-white/80 dark:border-amber-500/20 dark:bg-white/5",
        iconWrap: "bg-amber-500 text-white shadow-[0_18px_30px_-20px_rgba(245,158,11,0.95)]",
        value: "text-amber-500 dark:text-amber-300",
        glow: "shadow-[0_22px_36px_-28px_rgba(245,158,11,0.75)]",
    },
};

export function QuickStatBadge({ icon: Icon, label, value, color = "indigo" }: QuickStatBadgeProps) {
    const c = colorMap[color];

    return (
        <div
            className={`flex items-center gap-3 rounded-[1.65rem] border px-[16.8px] py-[12.8px] backdrop-blur-xl ${c.shell} ${c.glow} shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_18px_30px_-28px_rgba(15,23,42,0.35)]`}
        >
            <div className={`flex h-10 w-10 items-center justify-center rounded-[1rem] ${c.iconWrap}`}>
                <Icon className="h-4 w-4 shrink-0" />
            </div>
            <div className="flex min-w-0 flex-col">
                <span className={`text-base font-black leading-none tracking-[-0.02em] ${c.value}`}>{value}</span>
                <span className="mt-1 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.22em] text-slate-600 dark:text-slate-400">
                    {label}
                </span>
            </div>
        </div>
    );
}
