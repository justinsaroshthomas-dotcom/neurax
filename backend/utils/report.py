"""
NeuraMed — Structured Report Builder
Converts raw model output into a standardised clinical report object.
"""

from __future__ import annotations

import datetime

from models.registry import MODULE_META

URGENCY_DISPLAY = {
    "critical": {"label": "CRITICAL",              "color": "#ff4d6a"},
    "warning":  {"label": "CAUTION",               "color": "#f5a623"},
    "normal":   {"label": "WITHIN NORMAL LIMITS",  "color": "#0ef3c0"},
    "info":     {"label": "INFORMATIONAL",          "color": "#4ca9ff"},
}

URGENCY_ACTION = {
    "critical": "Immediate clinical review required. Do not delay.",
    "warning":  "Prompt clinical assessment recommended within 24-48 hours.",
    "normal":   "Routine follow-up as clinically appropriate.",
    "info":     "Note for clinical correlation. Review at next scheduled visit.",
}


def build_report(module: str, result: dict) -> dict:
    """
    Build a structured radiology-style report from inference output.

    Returns
    -------
    {
      "module_label":    str,
      "modality":        str,
      "finding":         str,
      "confidence_pct":  float,
      "urgency":         { label, color },
      "action":          str,
      "differentials":   [ {class, probability} ],
      "clinical_note":   str | None,
      "timestamp_utc":   str,
      "disclaimer":      str,
      ... module-specific extras
    }
    """
    meta      = MODULE_META.get(module, {})
    urgency   = result.get("urgency", "info")
    cls       = result.get("predicted_class", "Unknown")
    conf      = result.get("confidence", 0.0)
    probs     = result.get("probabilities", [])
    inf_ms    = result.get("inference_ms", 0)

    # Differentials = all classes except top prediction, sorted by prob
    differentials = [p for p in probs if p["class"] != cls]

    report = {
        "module_label":   meta.get("label", module),
        "icon":           meta.get("icon", ""),
        "modality":       meta.get("modality", ""),
        "finding":        cls,
        "confidence_pct": conf,
        "urgency":        URGENCY_DISPLAY.get(urgency, URGENCY_DISPLAY["info"]),
        "action":         URGENCY_ACTION.get(urgency, ""),
        "differentials":  differentials,
        "clinical_note":  result.get("clinical_note"),
        "inference_ms":   inf_ms,
        "timestamp_utc":  datetime.datetime.utcnow().isoformat() + "Z",
        "disclaimer": (
            "FOR CLINICAL DECISION SUPPORT ONLY. "
            "This AI analysis does not constitute a medical diagnosis. "
            "All findings must be reviewed and verified by a qualified "
            "radiologist or clinician before clinical action."
        ),
    }

    # Append module-specific fields
    for key in ("cdr_score", "mmse_range", "icd10_code", "affected_levels",
                "radiological_features", "cxr_pattern", "rt_pcr_note",
                "time_sensitivity", "imaging_markers", "who_grade"):
        if key in result:
            report[key] = result[key]

    return report
