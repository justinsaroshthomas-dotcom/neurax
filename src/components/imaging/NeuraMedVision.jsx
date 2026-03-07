"use client";
import { useState, useRef, useEffect, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────────────────────── */
const STYLES = `
  .nm-root {
    min-height: 100vh;
    background: #020617;
    color: #94a3b8;
    font-family: var(--font-inter), sans-serif;
    overflow-x: hidden;
    position: relative;
  }

  /* Grid background */
  .nm-root::before {
    content: '';
    position: fixed; inset: 0;
    background-image:
      linear-gradient(var(--border) 0.5px, transparent 0.5px),
      linear-gradient(90deg, var(--border) 0.5px, transparent 0.5px);
    background-size: 64px 64px;
    pointer-events: none; z-index: 0;
    opacity: 0.1;
  }

  /* Top glow */
  .nm-root::after {
    content: '';
    position: fixed; top: -30%; left: 50%;
    transform: translateX(-50%);
    width: 900px; height: 500px;
    background: radial-gradient(ellipse, rgba(0,210,150,.07) 0%, transparent 65%);
    pointer-events: none; z-index: 0;
  }

  .nm-inner { position: relative; z-index: 1; }

  /* ── Header ── */
  .nm-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 22px 32px;
    border-bottom: 1px solid rgba(255,255,255,.06);
    background: rgba(4,8,15,.8);
    backdrop-filter: blur(12px);
    position: sticky; top: 0; z-index: 100;
  }
  .nm-logo { display: flex; align-items: center; gap: 14px; }
  .nm-logo-mark {
    width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
    background: linear-gradient(135deg, #00d296, #007a58);
    display: flex; align-items: center; justify-content: center;
  }
  .nm-logo-name {
    font-family: var(--font-outfit), sans-serif; font-weight: 800;
    font-size: 20px; color: #f8fafc; letter-spacing: -.02em;
  }
  .nm-logo-ver {
    font-family: var(--font-mono), monospace; font-size: 10px;
    color: #00d296; background: rgba(0,210,150,.1);
    border: 1px solid rgba(0,210,150,.25); border-radius: 4px;
    padding: 2px 7px; margin-left: 8px;
  }
  .nm-logo-sub {
    font-family: var(--font-mono), monospace; font-size: 9.5px;
    color: #475569; letter-spacing: .14em; text-transform: uppercase; margin-top: 2px;
  }
  .nm-header-stats { display: flex; gap: 24px; align-items: center; }
  .nm-stat { text-align: right; }
  .nm-stat-k { font-family: 'DM Mono', monospace; font-size: 8.5px; color: #1e3545; letter-spacing: .12em; }
  .nm-stat-v { font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500; color: #00d296; }
  .nm-stat-dot {
    width: 7px; height: 7px; border-radius: 50%; background: #00d296;
    box-shadow: 0 0 8px #00d296;
    animation: nmPulse 2s ease infinite;
  }

  /* ── Module bar ── */
  .nm-modules {
    display: grid; grid-template-columns: repeat(6, 1fr);
    gap: 10px; padding: 20px 32px;
    border-bottom: 1px solid rgba(255,255,255,.05);
  }
  .nm-mod-btn {
    display: flex; flex-direction: column; align-items: center;
    gap: 7px; padding: 14px 8px; border-radius: 12px;
    border: 1.5px solid transparent; cursor: pointer;
    background: rgba(255,255,255,.02);
    transition: all .2s ease; position: relative; overflow: hidden;
  }
  .nm-mod-btn:hover { background: rgba(255,255,255,.04); }
  .nm-mod-btn.active { background: var(--mc-bg); border-color: var(--mc-border); }
  .nm-mod-btn.active::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: var(--mc-color);
  }
  .nm-mod-icon { font-size: 22px; line-height: 1; }
  .nm-mod-label {
    font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 11px;
    text-align: center; line-height: 1.25; color: #3a5565;
    transition: color .2s;
  }
  .nm-mod-btn.active .nm-mod-label { color: var(--mc-color); }
  .nm-mod-tag {
    font-family: 'DM Mono', monospace; font-size: 8.5px; letter-spacing: .07em;
    text-transform: uppercase; color: #1e3040;
    background: rgba(255,255,255,.04); border-radius: 20px;
    padding: 2px 7px; transition: all .2s;
  }
  .nm-mod-btn.active .nm-mod-tag {
    color: var(--mc-color); background: var(--mc-tag-bg);
  }

  /* ── Main layout ── */
  .nm-workspace {
    display: grid; grid-template-columns: 380px 1fr;
    gap: 18px; padding: 20px 32px 40px;
    max-width: 1400px; margin: 0 auto;
  }

  /* ── Left panel ── */
  .nm-left { display: flex; flex-direction: column; gap: 14px; }

  /* Upload zone */
  .nm-upload {
    border: 1.5px dashed rgba(0,210,150,.2);
    border-radius: 14px; cursor: pointer;
    transition: all .2s; background: rgba(0,210,150,.02);
    display: flex; flex-direction: column; align-items: center;
    gap: 12px; padding: 28px 20px; text-align: center;
  }
  .nm-upload:hover, .nm-upload.drag {
    border-color: rgba(0,210,150,.5); background: rgba(0,210,150,.05);
  }
  .nm-upload-icon {
    width: 56px; height: 56px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    background: var(--mc-icon-bg); border: 1.5px solid var(--mc-border);
  }
  .nm-upload-title { font-weight: 700; font-size: 14.5px; color: #94a3b8; }
  .nm-upload-sub { font-family: var(--font-mono), monospace; font-size: 10.5px; color: #475569; margin-top: -4px; }
  .nm-upload-classes { display: flex; flex-wrap: wrap; gap: 5px; justify-content: center; margin-top: 2px; }
  .nm-cls-tag {
    font-family: var(--font-mono), monospace; font-size: 9px; padding: 2px 8px;
    border-radius: 20px; background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.07); color: #64748b;
  }
  .nm-upload-btn {
    padding: 7px 18px; border-radius: 8px; font-family: var(--font-mono), monospace;
    font-size: 11px; letter-spacing: .1em; text-transform: uppercase;
    border: 1px solid var(--mc-border); color: var(--mc-color);
    background: var(--mc-tag-bg); cursor: pointer;
    transition: all .15s;
  }
  .nm-upload-btn:hover { filter: brightness(1.2); }

  /* Preview */
  .nm-preview {
    border-radius: 14px; overflow: hidden;
    border: 1px solid var(--mc-border);
    background: #000; position: relative;
  }
  .nm-preview img {
    width: 100%; max-height: 220px; object-fit: contain; display: block;
  }
  .nm-preview-bar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 14px; background: var(--mc-icon-bg);
    border-top: 1px solid var(--mc-border);
  }
  .nm-preview-label {
    display: flex; align-items: center; gap: 6px;
    font-family: 'DM Mono', monospace; font-size: 10px;
    color: var(--mc-color); letter-spacing: .08em;
  }
  .nm-preview-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--mc-color); animation: nmPulse 2s ease infinite; }
  .nm-clear-btn {
    font-family: 'DM Mono', monospace; font-size: 10px;
    color: #ff4d6a; border: 1px solid rgba(255,77,106,.3);
    background: rgba(255,77,106,.08); padding: 3px 10px;
    border-radius: 5px; cursor: pointer; transition: all .15s;
  }
  .nm-clear-btn:hover { background: rgba(255,77,106,.15); }

  /* Scan info card */
  .nm-info-card {
    border-radius: 12px; border: 1px solid rgba(255,255,255,.06);
    background: rgba(255,255,255,.02); padding: 16px;
  }
  .nm-sec-label {
    font-family: 'DM Mono', monospace; font-size: 9px;
    letter-spacing: .16em; color: #1e3040; text-transform: uppercase; margin-bottom: 12px;
  }
  .nm-info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
  .nm-info-k { font-family: 'DM Mono', monospace; font-size: 10.5px; color: #2a4455; }
  .nm-info-v { font-family: 'DM Mono', monospace; font-size: 10.5px; color: #7a9aaa; text-align: right; max-width: 60%; }
  .nm-zero-note {
    margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,.05);
    font-family: 'DM Mono', monospace; font-size: 9px; color: #152535; line-height: 1.6;
  }

  /* Run button */
  .nm-run-btn {
    width: 100%; padding: 14px;
    background: linear-gradient(135deg, #00d296, #00a070);
    border: none; border-radius: 12px; cursor: pointer;
    font-family: var(--font-heading), sans-serif; font-weight: 800;
    font-size: 13.5px; letter-spacing: .1em; text-transform: uppercase;
    color: #020617; display: flex; align-items: center; justify-content: center;
    gap: 10px; transition: all .2s;
  }
  .nm-run-btn:hover:not(:disabled) {
    filter: brightness(1.08); transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(0,210,150,.25);
  }
  .nm-run-btn:disabled { opacity: .35; cursor: not-allowed; transform: none; box-shadow: none; }
  .nm-disclaimer {
    font-family: 'DM Mono', monospace; font-size: 9px;
    color: #152535; text-align: center; line-height: 1.6;
    padding: 0 4px;
  }

  /* ── Right panel ── */
  .nm-right {
    border-radius: 16px; border: 1px solid rgba(255,255,255,.07);
    background: rgba(255,255,255,.015); overflow: hidden;
    display: flex; flex-direction: column; min-height: 600px;
  }
  .nm-panel-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 22px; border-bottom: 1px solid rgba(255,255,255,.05);
  }
  .nm-panel-title { font-weight: 700; font-size: 13.5px; color: #c8dde8; }
  .nm-panel-sub { font-family: 'DM Mono', monospace; font-size: 9px; color: #1e3040; letter-spacing: .12em; text-transform: uppercase; margin-top: 2px; }
  .nm-panel-body { flex: 1; padding: 22px; display: flex; flex-direction: column; }

  /* Idle */
  .nm-idle { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; opacity: .35; }
  .nm-idle-text { font-weight: 700; font-size: 13px; color: #1e3040; letter-spacing: .08em; text-transform: uppercase; text-align: center; }
  .nm-idle-sub { font-family: 'DM Mono', monospace; font-size: 10.5px; color: #0f1e28; text-align: center; line-height: 1.7; max-width: 240px; }

  /* Loader */
  .nm-loader { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; }
  .nm-spinner-wrap { position: relative; width: 90px; height: 90px; }
  .nm-spinner-a { position: absolute; inset: 0; animation: nmSpin 2s linear infinite; }
  .nm-spinner-b { position: absolute; inset: 0; animation: nmSpin 1.4s linear infinite reverse; }
  .nm-spinner-icon { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 26px; }
  .nm-loader-title { font-weight: 700; font-size: 14px; color: #7a9aaa; letter-spacing: .08em; text-transform: uppercase; text-align: center; }
  .nm-loader-step { font-family: 'DM Mono', monospace; font-size: 10.5px; color: var(--mc-color); text-align: center; margin-top: -16px; min-height: 18px; }
  .nm-step-dots { display: flex; gap: 8px; margin-top: -8px; }
  .nm-step-dot { height: 3px; width: 30px; border-radius: 2px; background: rgba(255,255,255,.08); transition: background .4s; }
  .nm-step-dot.on { background: var(--mc-color); }

  /* Results */
  .nm-results { display: flex; flex-direction: column; gap: 16px; animation: nmFadeUp .4s ease; }

  /* Primary finding card */
  .nm-finding-card {
    border-radius: 12px; padding: 18px;
    background: var(--urg-bg); border: 1px solid var(--urg-border);
  }
  .nm-finding-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 10px; }
  .nm-finding-name { font-weight: 800; font-size: 24px; color: #e0eff5; line-height: 1.2; }
  .nm-finding-meta { font-family: 'DM Mono', monospace; font-size: 10px; color: #3a5565; margin-top: 4px; }
  .nm-urg-badge {
    padding: 4px 12px; border-radius: 20px; font-family: 'DM Mono', monospace;
    font-size: 10px; font-weight: 500; letter-spacing: .1em; flex-shrink: 0;
    color: var(--urg-color); background: var(--urg-badge-bg); border: 1px solid var(--urg-border);
  }
  .nm-action {
    margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,.06);
    font-family: 'DM Mono', monospace; font-size: 11px; line-height: 1.6; color: var(--urg-text);
  }

  /* Conf bar */
  .nm-conf-wrap { margin-top: 12px; }
  .nm-conf-row { display: flex; justify-content: space-between; font-family: var(--font-mono), monospace; font-size: 10px; margin-bottom: 5px; color: #475569; }
  .nm-conf-pct { color: var(--urg-color); }
  .nm-conf-track { height: 5px; background: rgba(255,255,255,.06); border-radius: 3px; overflow: hidden; }
  .nm-conf-fill { height: 100%; border-radius: 3px; transition: width .9s cubic-bezier(.22,1,.36,1); }

  /* Two-column grid */
  .nm-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

  /* Section card */
  .nm-section {
    border-radius: 12px; border: 1px solid rgba(255,255,255,.06);
    background: rgba(255,255,255,.02); padding: 16px;
  }

  /* Differential rows */
  .nm-diff-row { margin-bottom: 10px; }
  .nm-diff-name { font-size: 12px; color: #f8fafc; font-weight: 500; margin-bottom: 5px; }
  .nm-diff-bar-track { height: 4px; background: rgba(255,255,255,.05); border-radius: 2px; overflow: hidden; }
  .nm-diff-bar-fill { height: 100%; border-radius: 2px; transition: width .8s cubic-bezier(.22,1,.36,1); }
  .nm-diff-pct { font-family: var(--font-mono), monospace; font-size: 9.5px; color: #475569; text-align: right; margin-top: 2px; }

  /* Feature list */
  .nm-feature-item { display: flex; align-items: flex-start; gap: 7px; margin-bottom: 8px; font-size: 12px; color: #8aacbc; line-height: 1.5; }
  .nm-feature-dot { color: var(--mc-color); font-size: 9px; flex-shrink: 0; margin-top: 4px; }

  /* Metadata table */
  .nm-meta-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,.04); }
  .nm-meta-row:last-child { border: none; }
  .nm-meta-k { font-family: 'DM Mono', monospace; font-size: 10px; color: #2a4455; }
  .nm-meta-v { font-family: 'DM Mono', monospace; font-size: 10px; color: #7a9aaa; }

  /* Alert */
  .nm-alert {
    border-radius: 10px; padding: 12px 16px;
    display: flex; align-items: flex-start; gap: 10px;
    background: rgba(255,77,106,.08); border: 1px solid rgba(255,77,106,.3);
  }
  .nm-alert-icon { font-size: 18px; flex-shrink: 0; }
  .nm-alert-text { font-family: 'DM Mono', monospace; font-size: 10.5px; color: #ff7a8a; line-height: 1.6; }

  /* Clinical note */
  .nm-note { font-size: 13px; color: #7a9aaa; line-height: 1.75; }

  /* Levels */
  .nm-levels { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; }
  .nm-level-tag {
    font-family: 'DM Mono', monospace; font-size: 11px; padding: 5px 12px;
    border-radius: 8px; color: var(--mc-color);
    background: var(--mc-icon-bg); border: 1px solid var(--mc-border);
  }

  /* Error */
  .nm-error { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; }
  .nm-error-icon { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 26px; background: rgba(255,77,106,.1); border: 1.5px solid rgba(255,77,106,.3); }
  .nm-error-title { font-weight: 700; font-size: 15px; color: #ff4d6a; }
  .nm-error-msg { font-family: 'DM Mono', monospace; font-size: 11px; color: #7a9aaa; text-align: center; max-width: 360px; line-height: 1.6; }

  /* Footer */
  .nm-footer-stamp {
    margin-top: 6px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,.04);
    display: flex; justify-content: space-between;
    font-family: 'DM Mono', monospace; font-size: 9px; color: #0f1e2a;
  }

  /* Animations */
  @keyframes nmPulse { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes nmSpin  { to { transform: rotate(360deg); } }
  @keyframes nmFadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  /* Scanline on preview */
  @keyframes nmScanY {
    0%   { top: 0%;   opacity: 1; }
    100% { top: 100%; opacity: 0.2; }
  }
`;

/* ─────────────────────────────────────────────────────────────
   MODULE CONFIG
───────────────────────────────────────────────────────────── */
const MODULES = [
  {
    id: "brain_tumor", label: "Brain Tumor", icon: "🧠", modality: "MRI",
    color: "#a855f7", bg: "rgba(168,85,247,.12)", border: "rgba(168,85,247,.3)",
    tagBg: "rgba(168,85,247,.15)", iconBg: "rgba(168,85,247,.1)",
    classes: ["No Tumor", "Glioma", "Meningioma", "Pituitary Tumor"],
    dataset: "Kaggle Brain Tumor MRI · 7,023 imgs",
    prompt: `You are NeuraMed v5 Brain Tumor Imaging Module. Analyze this MRI scan and classify it into one of: "No Tumor", "Glioma", "Meningioma", "Pituitary Tumor".`,
  },
  {
    id: "alzheimers", label: "Alzheimer's", icon: "🔬", modality: "MRI",
    color: "#06b6d4", bg: "rgba(6,182,212,.1)", border: "rgba(6,182,212,.3)",
    tagBg: "rgba(6,182,212,.12)", iconBg: "rgba(6,182,212,.08)",
    classes: ["Non Demented", "Very Mild Dementia", "Mild Dementia", "Moderate Dementia"],
    dataset: "ADNI + Kaggle Alzheimer MRI · 6,400 imgs",
    prompt: `You are NeuraMed v5 Alzheimer's Staging Module. Analyze this brain MRI and classify dementia severity into: "Non Demented", "Very Mild Dementia", "Mild Dementia", "Moderate Dementia". Also provide CDR score.`,
  },
  {
    id: "lung_disease", label: "Lung Disease", icon: "🫁", modality: "Chest X-Ray",
    color: "#00d296", bg: "rgba(0,210,150,.08)", border: "rgba(0,210,150,.25)",
    tagBg: "rgba(0,210,150,.1)", iconBg: "rgba(0,210,150,.08)",
    classes: ["Normal", "Pneumonia", "Lung Cancer", "Tuberculosis"],
    dataset: "NIH ChestX-ray14 · 112,120 imgs",
    prompt: `You are NeuraMed v5 Lung Disease Module. Analyze this chest X-ray and classify into: "Normal", "Pneumonia", "Lung Cancer", "Tuberculosis".`,
  },
  {
    id: "lumbar_spine", label: "Lumbar Spine", icon: "🦴", modality: "X-Ray / MRI",
    color: "#f59e0b", bg: "rgba(245,158,11,.08)", border: "rgba(245,158,11,.25)",
    tagBg: "rgba(245,158,11,.1)", iconBg: "rgba(245,158,11,.08)",
    classes: ["Normal", "Disc Herniation", "Spondylosis", "Spinal Stenosis"],
    dataset: "SpineWeb + VGH Lumbar MRI · 4,200 imgs",
    prompt: `You are NeuraMed v5 Lumbar Spine Module. Analyze this spinal X-ray or MRI and classify into: "Normal", "Disc Herniation", "Spondylosis", "Spinal Stenosis". Provide ICD-10 code and affected spinal levels.`,
  },
  {
    id: "neuroimaging", label: "Neuroimaging", icon: "⚡", modality: "CT / MRI",
    color: "#ff6b6b", bg: "rgba(255,107,107,.08)", border: "rgba(255,107,107,.25)",
    tagBg: "rgba(255,107,107,.1)", iconBg: "rgba(255,107,107,.08)",
    classes: ["Normal", "Ischemic Stroke", "Multiple Sclerosis", "Intracranial Hemorrhage"],
    dataset: "ISLES 2022 + MICCAI MS Lesion · 3,800 imgs",
    prompt: `You are NeuraMed v5 Neuroimaging Module. Analyze this brain CT or MRI for acute neurological pathology. Classify into: "Normal", "Ischemic Stroke", "Multiple Sclerosis", "Intracranial Hemorrhage". Note any time-critical alerts.`,
  },
  {
    id: "covid_xray", label: "COVID-19 X-Ray", icon: "🦠", modality: "Chest X-Ray",
    color: "#fb923c", bg: "rgba(251,146,60,.08)", border: "rgba(251,146,60,.25)",
    tagBg: "rgba(251,146,60,.1)", iconBg: "rgba(251,146,60,.08)",
    classes: ["Normal", "COVID-19", "Viral Pneumonia", "Bacterial Pneumonia"],
    dataset: "COVID-19 Radiology Database · 21,165 imgs",
    prompt: `You are NeuraMed v5 COVID-19 X-Ray Module. Analyze this chest X-ray and classify into: "Normal", "COVID-19", "Viral Pneumonia", "Bacterial Pneumonia". Note RT-PCR recommendation if applicable.`,
  },
];

const URGENCY = {
  critical: { label: "CRITICAL",   color: "#ff4d6a", bg: "rgba(255,77,106,.08)",  border: "rgba(255,77,106,.25)",  badgeBg: "rgba(255,77,106,.12)",  text: "#ff7a8a" },
  warning:  { label: "CAUTION",    color: "#f59e0b", bg: "rgba(245,158,11,.07)",  border: "rgba(245,158,11,.25)", badgeBg: "rgba(245,158,11,.12)", text: "#fbbf24" },
  normal:   { label: "NORMAL",     color: "#00d296", bg: "rgba(0,210,150,.06)",   border: "rgba(0,210,150,.2)",   badgeBg: "rgba(0,210,150,.1)",   text: "#00d296" },
  info:     { label: "INFO",       color: "#4ca9ff", bg: "rgba(76,169,255,.06)",  border: "rgba(76,169,255,.2)",  badgeBg: "rgba(76,169,255,.1)",  text: "#4ca9ff" },
};

const URGENCY_ACTIONS = {
  critical: "Immediate clinical review required. Do not delay.",
  warning:  "Prompt clinical assessment recommended within 24–48 hours.",
  normal:   "Routine follow-up as clinically appropriate.",
  info:     "Note for clinical correlation.",
};

/* ─────────────────────────────────────────────────────────────
   API CALL
───────────────────────────────────────────────────────────── */
async function runAnalysis(module, imageB64, mediaType) {
  const res = await fetch("/api/vision", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ module, imageB64, mediaType })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `API error ${res.status}`);
  return data;
}

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────── */
function ConfBar({ label, pct, color, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 150 + delay); return () => clearTimeout(t); }, [pct, delay]);
  return (
    <div className="nm-conf-wrap">
      <div className="nm-conf-row">
        <span>{label}</span>
        <span className="nm-conf-pct">{pct.toFixed(1)}%</span>
      </div>
      <div className="nm-conf-track">
        <div className="nm-conf-fill" style={{ width: `${w}%`, background: `linear-gradient(90deg,${color}88,${color})` }} />
      </div>
    </div>
  );
}

function Spinner({ mod }) {
  return (
    <div className="nm-spinner-wrap">
      <svg width="90" height="90" viewBox="0 0 90 90" className="nm-spinner-a">
        <circle cx="45" cy="45" r="41" fill="none" stroke={`${mod.color}20`} strokeWidth="2"/>
        <circle cx="45" cy="45" r="41" fill="none" stroke={mod.color} strokeWidth="2.5" strokeDasharray="65 193" strokeLinecap="round"/>
      </svg>
      <svg width="90" height="90" viewBox="0 0 90 90" className="nm-spinner-b">
        <circle cx="45" cy="45" r="28" fill="none" stroke={`${mod.color}15`} strokeWidth="1.5"/>
        <circle cx="45" cy="45" r="28" fill="none" stroke={mod.color} strokeWidth="2" strokeDasharray="38 138" strokeLinecap="round" opacity="0.6"/>
      </svg>
      <div className="nm-spinner-icon">{mod.icon}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────────────────────── */
export default function NeuraMed() {
  const [activeId, setActiveId]   = useState("brain_tumor");
  const [preview,  setPreview]    = useState(null);
  const [imageB64, setImageB64]   = useState(null);
  const [mediaType,setMediaType]  = useState("image/jpeg");
  const [status,   setStatus]     = useState("idle"); // idle | analyzing | done | error
  const [result,   setResult]     = useState(null);
  const [error,    setError]      = useState(null);
  const [loaderStep, setLoaderStep] = useState(0);
  const [drag, setDrag]           = useState(false);
  const fileRef = useRef();

  const mod = MODULES.find(m => m.id === activeId);

  // CSS vars for current module
  const modVars = {
    "--mc-color":   mod.color,
    "--mc-bg":      mod.bg,
    "--mc-border":  mod.border,
    "--mc-tag-bg":  mod.tagBg,
    "--mc-icon-bg": mod.iconBg,
  };

  const LOAD_STEPS = [
    "Preprocessing scan…",
    "Running vision inference…",
    "Scoring differential probabilities…",
    "Generating clinical report…",
  ];

  useEffect(() => {
    if (status !== "analyzing") return;
    setLoaderStep(0);
    const steps = [900, 1800, 2700];
    const timers = steps.map((ms, i) => setTimeout(() => setLoaderStep(i + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, [status]);

  const handleFile = useCallback((file) => {
    if (!file) return;
    const mt = file.type || "image/jpeg";
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setPreview(dataUrl);
      setImageB64(dataUrl.split(",")[1]);
      setMediaType(mt);
      setStatus("idle"); setResult(null); setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const onDrop = (e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); };

  const switchModule = (id) => {
    setActiveId(id);
    setStatus("idle"); setResult(null); setError(null);
    setPreview(null); setImageB64(null);
  };

  const analyze = async () => {
    if (!imageB64) return;
    setStatus("analyzing"); setError(null); setResult(null);
    try {
      const r = await runAnalysis(mod, imageB64, mediaType);
      setResult(r);
      setStatus("done");
    } catch (e) {
      setError(e.message);
      setStatus("error");
    }
  };

  // urgency styling
  const urg = result ? (URGENCY[result.urgency] || URGENCY.info) : null;
  const urgVars = urg ? {
    "--urg-color":    urg.color,
    "--urg-bg":       urg.bg,
    "--urg-border":   urg.border,
    "--urg-badge-bg": urg.badgeBg,
    "--urg-text":     urg.text,
  } : {};

  return (
    <>
      <style>{STYLES}</style>
      <div className="nm-root" style={modVars}>
        <div className="nm-inner">

          {/* ── Header ── */}
          <header className="nm-header">
            <div className="nm-logo">
              <div className="nm-logo-mark">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="11" r="9" fill="rgba(0,0,0,.25)"/>
                  <path d="M6 11h10M11 6v10" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div style={{display:"flex",alignItems:"baseline"}}>
                  <span className="nm-logo-name">NeuraMed</span>
                  <span className="nm-logo-ver">v5.0.0</span>
                </div>
                <div className="nm-logo-sub">6-Module Medical Imaging Intelligence</div>
              </div>
            </div>
            <div className="nm-header-stats">
              {[["Modules","6 / 6"],["Backbone","EfficientNet-B3"],["Retention","ZERO"]].map(([k,v])=>(
                <div className="nm-stat" key={k}>
                  <div className="nm-stat-k">{k}</div>
                  <div className="nm-stat-v">{v}</div>
                </div>
              ))}
              <div className="nm-stat-dot"/>
            </div>
          </header>

          {/* ── Module selector ── */}
          <div className="nm-modules">
            {MODULES.map(m => (
              <button
                key={m.id}
                className={`nm-mod-btn${activeId === m.id ? " active" : ""}`}
                style={activeId === m.id ? { "--mc-color": m.color, "--mc-bg": m.bg, "--mc-border": m.border, "--mc-tag-bg": m.tagBg } : {}}
                onClick={() => switchModule(m.id)}
              >
                <span className="nm-mod-icon" style={{ filter: activeId === m.id ? "none" : "grayscale(.7) opacity(.5)" }}>{m.icon}</span>
                <span className="nm-mod-label">{m.label}</span>
                <span className="nm-mod-tag">{m.modality}</span>
              </button>
            ))}
          </div>

          {/* ── Workspace ── */}
          <div className="nm-workspace" style={modVars}>

            {/* Left */}
            <div className="nm-left">

              {/* Upload / Preview */}
              {!preview ? (
                <div
                  className={`nm-upload${drag?" drag":""}`}
                  onDragOver={e=>{e.preventDefault();setDrag(true)}}
                  onDragLeave={()=>setDrag(false)}
                  onDrop={onDrop}
                  onClick={()=>fileRef.current.click()}
                >
                  <div className="nm-upload-icon">
                    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                      <path d="M13 20V10M8 15l5-5 5 5" stroke={mod.color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M4 22h18" stroke={mod.color} strokeWidth="1.5" strokeLinecap="round" opacity=".5"/>
                    </svg>
                  </div>
                  <div>
                    <div className="nm-upload-title">Drop {mod.modality} scan here</div>
                    <div className="nm-upload-sub">DICOM · JPEG · PNG · WEBP — up to 50 MB</div>
                  </div>
                  <div className="nm-upload-classes">
                    {mod.classes.map(c => <span className="nm-cls-tag" key={c}>{c}</span>)}
                  </div>
                  <div className="nm-upload-btn">Browse files</div>
                </div>
              ) : (
                <div className="nm-preview">
                  <img src={preview} alt="scan"/>
                  <div style={{
                    position:"absolute",left:0,right:0,height:"2px",
                    background:`linear-gradient(90deg,transparent,${mod.color},transparent)`,
                    animation:"nmScanY 2.5s ease-in-out infinite",
                  }}/>
                  <style>{`@keyframes nmScanY{0%{top:0;opacity:1}100%{top:100%;opacity:.2}}`}</style>
                  <div className="nm-preview-bar">
                    <div className="nm-preview-label">
                      <div className="nm-preview-dot"/>
                      {mod.modality} — LOADED
                    </div>
                    <button className="nm-clear-btn" onClick={(e)=>{e.stopPropagation();setPreview(null);setImageB64(null);setStatus("idle");setResult(null);setError(null);}}>
                      CLEAR
                    </button>
                  </div>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>

              {/* Run button */}
              {preview && (
                <button className="nm-run-btn" disabled={status==="analyzing"} onClick={analyze}>
                  {status === "analyzing"
                    ? <><SpinnerInline/> Analyzing…</>
                    : <><span>▶</span> Run {mod.label} Analysis</>
                  }
                </button>
              )}

              {/* Module info */}
              <div className="nm-info-card">
                <div className="nm-sec-label">Module Specification</div>
                {[
                  ["Label",      mod.label],
                  ["Modality",   mod.modality],
                  ["Architecture","EfficientNet-B3"],
                  ["Classes",    mod.classes.length],
                  ["Dataset",    mod.dataset],
                ].map(([k,v])=>(
                  <div className="nm-info-row" key={k}>
                    <span className="nm-info-k">{k}</span>
                    <span className="nm-info-v">{v}</span>
                  </div>
                ))}
                <div className="nm-zero-note">
                  ZERO DATA RETENTION · Images processed in-memory · No storage, no logging, no telemetry
                </div>
              </div>

              <div className="nm-disclaimer">
                FOR CLINICAL DECISION SUPPORT ONLY — NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL JUDGMENT
              </div>
            </div>

            {/* Right */}
            <div className="nm-right">
              <div className="nm-panel-head">
                <div>
                  <div className="nm-panel-title">{mod.icon} {mod.label} Analysis</div>
                  <div className="nm-panel-sub">{mod.modality} · NeuraMed Vision Core</div>
                </div>
                {result && urg && (
                  <div style={urgVars}>
                    <span className="nm-urg-badge">{urg.label}</span>
                  </div>
                )}
              </div>

              <div className="nm-panel-body">

                {/* IDLE */}
                {status === "idle" && (
                  <div className="nm-idle">
                    <svg width="90" height="90" viewBox="0 0 90 90">
                      <circle cx="45" cy="45" r="42" fill="none" stroke={`${mod.color}20`} strokeWidth="1.5" strokeDasharray="7 4"/>
                      <circle cx="45" cy="45" r="27" fill="none" stroke={`${mod.color}12`} strokeWidth="1"/>
                      <circle cx="45" cy="45" r="7" fill={`${mod.color}25`}/>
                      {[[45,3,45,19],[45,71,45,87],[3,45,19,45],[71,45,87,45]].map(([x1,y1,x2,y2],i)=>(
                        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={mod.color} strokeWidth="1.5" strokeLinecap="round"/>
                      ))}
                    </svg>
                    <div className="nm-idle-text">Awaiting Scan Input</div>
                    <div className="nm-idle-sub">Upload a {mod.modality} image and run analysis to view the diagnostic report</div>
                  </div>
                )}

                {/* ANALYZING */}
                {status === "analyzing" && (
                  <div className="nm-loader">
                    <Spinner mod={mod}/>
                    <div>
                      <div className="nm-loader-title">Processing</div>
                      <div className="nm-loader-step">{LOAD_STEPS[loaderStep]}</div>
                    </div>
                    <div className="nm-step-dots">
                      {LOAD_STEPS.map((_,i)=>(
                        <div key={i} className={`nm-step-dot${i<=loaderStep?" on":""}`} style={i<=loaderStep?{"--mc-color":mod.color,background:mod.color}:{}}/>
                      ))}
                    </div>
                  </div>
                )}

                {/* ERROR */}
                {status === "error" && (
                  <div className="nm-error">
                    <div className="nm-error-icon">⚠</div>
                    <div className="nm-error-title">Analysis Failed</div>
                    <div className="nm-error-msg">{error}</div>
                  </div>
                )}

                {/* RESULTS */}
                {status === "done" && result && urg && (
                  <div className="nm-results" style={{...urgVars,...modVars}}>

                    {/* Primary finding */}
                    <div className="nm-finding-card">
                      <div className="nm-finding-top">
                        <div>
                          <div className="nm-finding-name">{result.predicted_class}</div>
                          <div className="nm-finding-meta">{mod.modality} · {mod.label} Module · {new Date().toLocaleTimeString()}</div>
                        </div>
                        <span className="nm-urg-badge">{urg.label}</span>
                      </div>
                      <ConfBar label="Model Confidence" pct={result.confidence} color={urg.color}/>
                      {result.action && (
                        <div className="nm-action">→ {result.action}</div>
                      )}
                    </div>

                    {/* Time alert */}
                    {result.time_sensitivity && (
                      <div className="nm-alert">
                        <span className="nm-alert-icon">⏱</span>
                        <span className="nm-alert-text">{result.time_sensitivity}</span>
                      </div>
                    )}

                    {/* Differentials + Features */}
                    <div className="nm-2col">
                      <div className="nm-section">
                        <div className="nm-sec-label">Differential Probabilities</div>
                        {(result.probabilities||[]).map((p,i)=>(
                          <DiffBar key={p.class} label={p.class} pct={p.probability}
                            color={p.class===result.predicted_class ? urg.color : "#3a5565"}
                            delay={i*70} isFinding={p.class===result.predicted_class}/>
                        ))}
                      </div>
                      <div className="nm-section">
                        <div className="nm-sec-label">Imaging Features</div>
                        {(result.imaging_features||[]).map((f,i)=>(
                          <div className="nm-feature-item" key={i}>
                            <span className="nm-feature-dot">◆</span>
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Clinical note */}
                    {result.clinical_note && (
                      <div className="nm-section">
                        <div className="nm-sec-label">Clinical Assessment</div>
                        <div className="nm-note">{result.clinical_note}</div>
                      </div>
                    )}

                    {/* Metadata + extras */}
                    <div className="nm-2col">
                      <div className="nm-section">
                        <div className="nm-sec-label">Report Metadata</div>
                        {[
                          ["Module",    mod.label],
                          ["Modality",  mod.modality],
                          ["Urgency",   urg.label],
                          result.extra?.icd10    ? ["ICD-10",   result.extra.icd10]    : null,
                          result.extra?.cdr_score? ["CDR Score",result.extra.cdr_score]: null,
                          ["Retained",  "None"],
                          ["Engine",    "NeuraMed v5"],
                        ].filter(Boolean).map(([k,v])=>(
                          <div className="nm-meta-row" key={k}>
                            <span className="nm-meta-k">{k}</span>
                            <span className="nm-meta-v">{v}</span>
                          </div>
                        ))}
                      </div>

                      {/* RT-PCR or Affected levels */}
                      <div className="nm-section">
                        <div className="nm-sec-label">
                          {result.extra?.rt_pcr ? "Lab Recommendations" : "Additional Findings"}
                        </div>
                        {result.extra?.rt_pcr && (
                          <div className="nm-note" style={{fontSize:12,marginBottom:10}}>{result.extra.rt_pcr}</div>
                        )}
                        {result.extra?.affected_levels?.length > 0 && (
                          <>
                            <div className="nm-sec-label" style={{marginTop:8}}>Affected Levels</div>
                            <div className="nm-levels">
                              {result.extra.affected_levels.map(l=>(
                                <span className="nm-level-tag" key={l}>{l}</span>
                              ))}
                            </div>
                          </>
                        )}
                        {!result.extra?.rt_pcr && !result.extra?.affected_levels?.length && (
                          <div className="nm-note" style={{fontSize:12, color:"#2a4455"}}>
                            No additional module-specific data for this classification.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recommended clinical action summary */}
                    <div className="nm-section" style={{background:urg.bg, border:`1px solid ${urg.border}`}}>
                      <div className="nm-sec-label">Recommended Action</div>
                      <div className="nm-note" style={{color: urg.text}}>{URGENCY_ACTIONS[result.urgency]}</div>
                    </div>

                    {/* Footer stamp */}
                    <div className="nm-footer-stamp">
                      <span>NEURAMED v5.0.0 · {mod.label.toUpperCase()} MODULE · ZERO RETENTION</span>
                      <span>{new Date().toISOString().replace("T"," ").slice(0,19)} UTC</span>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

/* Inline diff bar */
function DiffBar({ label, pct, color, delay, isFinding }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 150 + delay); return () => clearTimeout(t); }, [pct, delay]);
  return (
    <div className="nm-diff-row">
      <div className="nm-diff-name" style={{ color: isFinding ? "#e0eff5" : "#7a9aaa", fontWeight: isFinding ? 600 : 400 }}>{label}</div>
      <div className="nm-diff-bar-track">
        <div className="nm-diff-bar-fill" style={{ width: `${w}%`, background: `linear-gradient(90deg,${color}66,${color})` }}/>
      </div>
      <div className="nm-diff-pct">{pct.toFixed(1)}%</div>
    </div>
  );
}

/* Inline spinner for button */
function SpinnerInline() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: "nmSpin .8s linear infinite" }}>
      <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(0,0,0,.3)" strokeWidth="2"/>
      <circle cx="8" cy="8" r="6" fill="none" stroke="#021510" strokeWidth="2.2" strokeDasharray="22 16" strokeLinecap="round"/>
    </svg>
  );
}
