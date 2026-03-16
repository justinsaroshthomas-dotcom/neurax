export type Severity = "low" | "medium" | "high" | "critical";

export interface CatalogSymptom {
    id: string;
    key: string;
    name: string;
    category: string;
    aliases: string[];
    source: "core" | "extended";
}

export interface CatalogDiseaseSymptom {
    key: string;
    name: string;
    weight: number;
    source: "core" | "extended";
}

export interface CatalogDisease {
    id: string;
    key: string;
    name: string;
    aliases: string[];
    severity: Severity;
    description: string;
    precautions: string[];
    treatments: string[];
    symptoms: CatalogDiseaseSymptom[];
    rowCount?: number;
}

export interface CatalogCounts {
    diseases: number;
    coreSymptoms: number;
    extendedSymptoms: number;
    rows?: number;
}

export interface CatalogMetrics {
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
    top3?: number;
    top5?: number;
}

export interface CatalogData {
    generatedAt: string;
    counts: CatalogCounts;
    coreSymptoms: CatalogSymptom[];
    extendedSymptoms: CatalogSymptom[];
    symptomAliases: Record<string, string>;
    diseases: CatalogDisease[];
    diseaseInfo: Record<string, { severity: Severity; symptoms: string[] }>;
    trainingMetadata?: Record<string, unknown>;
    metrics?: CatalogMetrics;
}

export interface CatalogSummary {
    generatedAt: string;
    counts: CatalogCounts;
    metrics?: CatalogMetrics;
}
