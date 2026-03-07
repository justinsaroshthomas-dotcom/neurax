// Neurax — Module Config + API Client

import type { ModuleId, ModuleMeta, AnalysisResponse, HealthResponse } from "@/types/imaging";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// -- Module registry ----------------------------------------------------------
export const MODULES: ModuleMeta[] = [
  {
    id:          "brain_tumor",
    label:       "Brain Tumor",
    icon:        "🧠",
    modality:    "MRI",
    description: "4-class intracranial mass classification from T1/T2 MRI sequences.",
    classes:     ["No Tumor", "Glioma", "Meningioma", "Pituitary Tumor"],
    dataset:     "Kaggle Brain Tumor MRI | 7,023 images",
    color:       "#a855f7",
    bodyRegion:  "brain",
  },
  {
    id:          "alzheimers",
    label:       "Alzheimer's",
    icon:        "🔬",
    modality:    "MRI",
    description: "CDR-aligned 4-stage dementia severity grading from structural MRI.",
    classes:     ["Non Demented", "Very Mild", "Mild Dementia", "Moderate Dementia"],
    dataset:     "ADNI + Kaggle Alzheimer MRI | 6,400 images",
    color:       "#06b6d4",
    bodyRegion:  "brain",
  },
  {
    id:          "lung_disease",
    label:       "Lung Disease",
    icon:        "🫁",
    modality:    "Chest X-Ray",
    description: "4-class chest X-ray screening for major pulmonary pathologies.",
    classes:     ["Normal", "Pneumonia", "Lung Cancer", "Tuberculosis"],
    dataset:     "NIH ChestX-ray14 + PadChest | 112,120 images",
    color:       "#0ef3c0",
    bodyRegion:  "chest",
  },
  {
    id:          "lumbar_spine",
    label:       "Lumbar Spine",
    icon:        "🦴",
    modality:    "X-Ray / MRI",
    description: "Degenerative lumbar spine pathology classification.",
    classes:     ["Normal", "Disc Herniation", "Spondylosis", "Spinal Stenosis"],
    dataset:     "SpineWeb + VGH Lumbar MRI | 4,200 images",
    color:       "#f59e0b",
    bodyRegion:  "spine",
  },
  {
    id:          "neuroimaging",
    label:       "Neuroimaging",
    icon:        "⚡",
    modality:    "CT / MRI",
    description: "Acute neurological emergency and demyelinating disease classification.",
    classes:     ["Normal", "Ischemic Stroke", "Multiple Sclerosis", "Intracranial Hemorrhage"],
    dataset:     "ISLES 2022 + MICCAI MS Lesion | 3,800 images",
    color:       "#ff6b6b",
    bodyRegion:  "brain",
  },
  {
    id:          "covid_xray",
    label:       "COVID-19 X-Ray",
    icon:        "🦠",
    modality:    "Chest X-Ray",
    description: "COVID-19 vs pneumonia discrimination from chest radiographs.",
    classes:     ["Normal", "COVID-19", "Viral Pneumonia", "Bacterial Pneumonia"],
    dataset:     "COVID-19 Radiography Database | 21,165 images",
    color:       "#fb923c",
    bodyRegion:  "chest",
  },
];

export const MODULE_MAP = Object.fromEntries(
  MODULES.map((m) => [m.id, m])
) as Record<ModuleId, ModuleMeta>;

// -- API client ---------------------------------------------------------------
export async function analyzeImage(
  module: ModuleId,
  file: File
): Promise<AnalysisResponse> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE}/analyze/${module}`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }

  return res.json();
}

export async function fetchModules(): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/modules`);
  return res.json();
}

export async function healthCheck(): Promise<HealthResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
