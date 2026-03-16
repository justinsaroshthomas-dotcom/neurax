"use client";

import { cn } from "@/lib/utils";

interface CustomToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    sublabel?: string;
    className?: string;
}

/**
 * Uiverse.io-inspired neumorphic toggle checkbox
 * Styled as a cyberpunk glowing toggle with neon accents
 */
export function CustomToggle({
    checked,
    onChange,
    label,
    sublabel,
    className,
}: CustomToggleProps) {
    return (
        <label
            className={cn(
                `cyber-toggle ${checked ? "active" : ""}`,
                className
            )}
            onClick={() => onChange(!checked)}
        >
            <span className="toggle-indicator">
                <svg
                    viewBox="0 0 12 12"
                    fill="none"
                    strokeWidth="2"
                    stroke="currentColor"
                >
                    <path
                        d="M2 6l3 3 5-5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </span>
            <span className="flex flex-col min-w-0">
                <span
                    className={`text-sm font-medium ${checked ? "text-[var(--neon)]" : "text-foreground"
                        }`}
                >
                    {label}
                </span>
                {sublabel && (
                    <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">
                        {sublabel}
                    </span>
                )}
            </span>
        </label>
    );
}
