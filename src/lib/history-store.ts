// ─────────────────────────────────────────
// Local prediction history store (localStorage)
// Works without MongoDB — persists across sessions
// ─────────────────────────────────────────

import { saveHistoryToCloud } from "./actions";

export interface HistoryEntry {
    id: string;
    symptoms: string[];
    predictions: {
        disease: string;
        confidence: number;
        severity: "low" | "medium" | "high" | "critical";
        treatments: string[];
        matchedSymptoms: string[];
    }[];
    topDisease: string;
    topConfidence: number;
    topSeverity: string;
    aiSummary: string | null;
    timestamp: string; // ISO string
}

const STORAGE_KEY = "neurax_history";

function getHistory(): HistoryEntry[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveHistory(entries: HistoryEntry[]): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
        // Storage full or unavailable
    }
}

export function addHistoryEntry(entry: Omit<HistoryEntry, "id" | "timestamp">): HistoryEntry {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Date.now().toString(36) + Math.random().toString(36).substring(2);

    const newEntry: HistoryEntry = {
        ...entry,
        id,
        timestamp: new Date().toISOString(),
    };
    
    const history = getHistory();
    history.unshift(newEntry);
    if (history.length > 50) history.splice(50);
    saveHistory(history);

    // Dynamic Cloud Sync (fire and forget)
    if (typeof window !== "undefined") {
        saveHistoryToCloud(newEntry).catch(() => {});
    }
    
    return newEntry;
}

export function getAllHistory(): HistoryEntry[] {
    return getHistory();
}

export function clearHistory(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
}

export function deleteHistoryEntry(id: string): void {
    const history = getHistory().filter((e) => e.id !== id);
    saveHistory(history);
}

// ─────────────────────────────────────────
// Analytics helpers
// ─────────────────────────────────────────

export interface AnalyticsData {
    totalPredictions: number;
    uniqueDiseases: number;
    avgConfidence: number;
    severityBreakdown: Record<string, number>;
    topDiseases: { name: string; count: number }[];
    symptomFrequency: { name: string; count: number }[];
    recentActivity: { date: string; count: number }[];
}

export function computeAnalytics(): AnalyticsData {
    const history = getHistory();

    if (history.length === 0) {
        return {
            totalPredictions: 0,
            uniqueDiseases: 0,
            avgConfidence: 0,
            severityBreakdown: {},
            topDiseases: [],
            symptomFrequency: [],
            recentActivity: [],
        };
    }

    // Total predictions
    const totalPredictions = history.length;

    // Unique diseases
    const diseaseSet = new Set(history.map((e) => e.topDisease));
    const uniqueDiseases = diseaseSet.size;

    // Average confidence
    const avgConfidence =
        history.reduce((sum, e) => sum + e.topConfidence, 0) / totalPredictions;

    // Severity breakdown
    const severityBreakdown: Record<string, number> = {};
    for (const entry of history) {
        severityBreakdown[entry.topSeverity] =
            (severityBreakdown[entry.topSeverity] || 0) + 1;
    }

    // Top diseases
    const diseaseCounts: Record<string, number> = {};
    for (const entry of history) {
        diseaseCounts[entry.topDisease] =
            (diseaseCounts[entry.topDisease] || 0) + 1;
    }
    const topDiseases = Object.entries(diseaseCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

    // Symptom frequency
    const symptomCounts: Record<string, number> = {};
    for (const entry of history) {
        for (const s of entry.symptoms) {
            symptomCounts[s] = (symptomCounts[s] || 0) + 1;
        }
    }
    const symptomFrequency = Object.entries(symptomCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

    // Recent activity (last 7 days)
    const now = new Date();
    const recentActivity: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const count = history.filter(
            (e) => e.timestamp.split("T")[0] === dateStr
        ).length;
        recentActivity.push({ date: dateStr, count });
    }

    return {
        totalPredictions,
        uniqueDiseases,
        avgConfidence,
        severityBreakdown,
        topDiseases,
        symptomFrequency,
        recentActivity,
    };
}
