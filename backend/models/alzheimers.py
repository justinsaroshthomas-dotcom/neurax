"""
NeuraMed Module 02 — Alzheimer's Disease Staging
MRI scan -> 4-class severity grading (CDR-aligned)

Dataset basis : ADNI + Kaggle Alzheimer MRI (6,400 images)
Architecture  : EfficientNet-B3 fine-tuned, 176x176
CDR reference : Clinical Dementia Rating scale
"""

from models.base_model import BaseImagingModel


class AlzheimersModel(BaseImagingModel):
    MODULE_NAME = "alzheimers"
    CLASSES = [
        "Non Demented",
        "Very Mild Dementia",
        "Mild Dementia",
        "Moderate Dementia",
    ]
    INPUT_SIZE = (176, 176)
    URGENCY_MAP = {
        "Non Demented":      "normal",
        "Very Mild Dementia": "info",
        "Mild Dementia":     "warning",
        "Moderate Dementia": "critical",
    }

    # CDR scores and structural correlates
    CDR_MAP = {
        "Non Demented":      {"cdr": "0",   "mmse_range": "27-30"},
        "Very Mild Dementia": {"cdr": "0.5", "mmse_range": "21-26"},
        "Mild Dementia":     {"cdr": "1",   "mmse_range": "11-20"},
        "Moderate Dementia": {"cdr": "2",   "mmse_range": "3-10"},
    }

    CLINICAL_NOTES = {
        "Non Demented": (
            "No significant cortical atrophy or hippocampal volume loss detected. "
            "Entorhinal cortex thickness within normal limits for age."
        ),
        "Very Mild Dementia": (
            "Subtle medial temporal lobe changes. Corresponds to CDR 0.5 — "
            "mild cognitive impairment stage. Neuropsychological assessment "
            "and repeat MRI in 12 months recommended."
        ),
        "Mild Dementia": (
            "Moderate hippocampal atrophy and cortical thinning consistent with "
            "CDR 1. Full dementia workup including CSF biomarkers (Ab42, tau) "
            "or amyloid PET advised. Consider cholinesterase inhibitor therapy."
        ),
        "Moderate Dementia": (
            "Significant diffuse cortical and subcortical atrophy. CDR 2 staging. "
            "Urgent geriatric/neurology review. Caregiver support assessment "
            "and medication review (donepezil, memantine) indicated."
        ),
    }

    def predict(self, tensor):
        result = super().predict(tensor)
        cls = result["predicted_class"]
        result["clinical_note"] = self.CLINICAL_NOTES.get(cls, "")
        result["cdr_score"]     = self.CDR_MAP.get(cls, {}).get("cdr", "-")
        result["mmse_range"]    = self.CDR_MAP.get(cls, {}).get("mmse_range", "-")
        return result
