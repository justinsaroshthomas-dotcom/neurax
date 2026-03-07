"""
NeuraMed Module 03 — Lung Disease Classification
Chest X-Ray -> 4-class: Normal / Pneumonia / Lung Cancer / Tuberculosis

Dataset basis : NIH ChestX-ray14 + PadChest (112,120 images subset)
Architecture  : EfficientNet-B3, 256x256
"""

from models.base_model import BaseImagingModel


class LungDiseaseModel(BaseImagingModel):
    MODULE_NAME = "lung_disease"
    CLASSES = [
        "Normal",
        "Pneumonia",
        "Lung Cancer",
        "Tuberculosis",
    ]
    INPUT_SIZE = (256, 256)
    URGENCY_MAP = {
        "Normal":       "normal",
        "Pneumonia":    "warning",
        "Lung Cancer":  "critical",
        "Tuberculosis": "critical",
    }

    RADIOLOGICAL_FEATURES = {
        "Normal": [
            "Clear lung fields bilaterally",
            "No consolidation, effusion, or mass",
            "Normal cardiothoracic ratio (<0.50)",
        ],
        "Pneumonia": [
            "Lobar or segmental consolidation",
            "Air bronchograms may be present",
            "Patchy opacification",
            "Possible pleural effusion",
        ],
        "Lung Cancer": [
            "Solitary pulmonary nodule or mass (>3 cm)",
            "Irregular spiculated margins",
            "Possible hilar lymphadenopathy",
            "Pleural effusion or rib erosion in advanced disease",
        ],
        "Tuberculosis": [
            "Upper lobe predominant infiltrates",
            "Cavitary lesions possible",
            "Hilar / mediastinal adenopathy",
            "Miliary pattern in disseminated disease",
        ],
    }

    CLINICAL_NOTES = {
        "Normal": (
            "No active cardiopulmonary pathology identified. Lung fields clear, "
            "mediastinum within normal limits."
        ),
        "Pneumonia": (
            "Consolidation pattern consistent with pneumonia. Sputum culture, CBC, "
            "CRP, and procalcitonin recommended. Empirical antibiotic therapy per "
            "local CAP protocol. Follow-up CXR at 6 weeks."
        ),
        "Lung Cancer": (
            "Pulmonary mass/nodule with features raising concern for primary "
            "lung malignancy. Urgent CT chest with contrast and oncology referral "
            "required. Consider PET-CT and tissue biopsy per MDT discussion."
        ),
        "Tuberculosis": (
            "Radiographic features consistent with active or post-primary "
            "tuberculosis. Sputum AFB smear/culture and IGRA/Mantoux test "
            "recommended. Isolate patient and notify public health per local protocol."
        ),
    }

    def predict(self, tensor):
        result = super().predict(tensor)
        cls = result["predicted_class"]
        result["clinical_note"]         = self.CLINICAL_NOTES.get(cls, "")
        result["radiological_features"] = self.RADIOLOGICAL_FEATURES.get(cls, [])
        return result
