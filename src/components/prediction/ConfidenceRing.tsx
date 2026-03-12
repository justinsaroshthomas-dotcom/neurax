"use client";

interface ConfidenceRingProps {
    value: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
}

export function ConfidenceRing({
    value,
    size = 120,
    strokeWidth = 10,
    color = "var(--neon)",
}: ConfidenceRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    const center = size / 2;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="hsl(var(--border))"
                    strokeWidth={strokeWidth}
                    opacity={0.65}
                />
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{
                        transition: "stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        filter: `drop-shadow(0 0 10px color-mix(in srgb, ${color} 55%, transparent))`,
                    }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black leading-none tabular-nums text-foreground">
                    {value}%
                </span>
                <span className="mt-0.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    Match
                </span>
            </div>
        </div>
    );
}
