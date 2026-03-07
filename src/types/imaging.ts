// Neurax — Imaging TypeScript Types

export type ModuleId =
  | "brain_tumor"
  | "alzheimers"
  | "lung_disease"
  | "lumbar_spine"
  | "neuroimaging"
  | "covid_xray";

export interface ModuleMeta {
  id: ModuleId;
  label: string;
  icon: string;
  modality: string;
  description: string;
  classes: string[];
  dataset: string;
  color: string;
  bodyRegion: "brain" | "chest" | "spine";
}

export interface ProbabilityEntry {
  class: string;
  probability: number;
}

export interface UrgencyDisplay {
  label: string;
  color: string;
}

export interface AnalysisResult {
  predicted_class: string;
  confidence: number;
  probabilities: ProbabilityEntry[];
  urgency: string;
  clinical_note?: string;
  inference_ms: number;
  // Module-specific fields
  who_grade?: string | null;
  cdr_score?: string;
  mmse_range?: string;
  icd10_code?: string;
  affected_levels?: string[];
  radiological_features?: string[];
  cxr_pattern?: string[];
  rt_pcr_note?: string | null;
  time_sensitivity?: string | null;
  imaging_markers?: string[];
}

export interface AnalysisReport {
  module_label: string;
  icon: string;
  modality: string;
  finding: string;
  confidence_pct: number;
  urgency: UrgencyDisplay;
  action: string;
  differentials: ProbabilityEntry[];
  clinical_note: string | null;
  inference_ms: number;
  timestamp_utc: string;
  disclaimer: string;
  // Module-specific extras
  cdr_score?: string;
  mmse_range?: string;
  icd10_code?: string;
  affected_levels?: string[];
  radiological_features?: string[];
  cxr_pattern?: string[];
  rt_pcr_note?: string | null;
  time_sensitivity?: string | null;
  imaging_markers?: string[];
  who_grade?: string | null;
}

export interface AnalysisResponse {
  module: ModuleId;
  result: AnalysisResult;
  report: AnalysisReport;
  retained: false;
}

export interface HealthResponse {
  status: string;
  version: string;
  modules: Record<string, string>;
  device: string;
}
