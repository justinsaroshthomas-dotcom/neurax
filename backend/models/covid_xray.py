"""
NeuraMed Module 06 — COVID-19 Chest X-Ray Classification
CXR -> 4-class: Normal / COVID-19 / Viral Pneumonia / Bacterial Pneumonia

Dataset basis : COVID-19 Radiography Database (Kaggle/Qatar Univ.) — 21,165 images
Architecture  : EfficientNet-B3, 256x256
"""

from models.base_model import BaseImagingModel


class CovidXRayModel(BaseImagingModel):
    MODULE_NAME = "covid_xray"
    CLASSES = [
        "Normal",
        "COVID-19",
        "Viral Pneumonia",
        "Bacterial Pneumonia",
    ]
    INPUT_SIZE = (256, 256)
    URGENCY_MAP = {
        "Normal":              "normal",
        "COVID-19":            "critical",
        "Viral Pneumonia":     "warning",
        "Bacterial Pneumonia": "warning",
    }

    CXR_PATTERNS = {
        "Normal": [
            "Clear lung parenchyma",
            "No interstitial infiltrates",
            "Normal vascular markings",
        ],
        "COVID-19": [
            "Bilateral, peripheral, lower-zone ground-glass opacities",
            "Crazy-paving pattern (late stage)",
            "Consolidation with peripheral distribution",
            "Sparing of central / perihilar regions",
            "Absence of pleural effusion (early disease)",
        ],
        "Viral Pneumonia": [
            "Bilateral interstitial / peribronchial infiltrates",
            "Hyperinflation",
            "Diffuse reticular pattern",
            "Hilar adenopathy in some cases",
        ],
        "Bacterial Pneumonia": [
            "Lobar or segmental consolidation",
            "Air bronchograms",
            "Unilateral predominance (common)",
            "Pleural effusion possible",
        ],
    }

    RT_PCR_NOTE = {
        "COVID-19": "CONFIRM with RT-PCR. Isolate per IPC protocol.",
        "Viral Pneumonia": "Consider RT-PCR to exclude SARS-CoV-2.",
        "Bacterial Pneumonia": "Sputum culture + blood cultures before antibiotics.",
        "Normal": None,
    }

    CLINICAL_NOTES = {
        "Normal": (
            "No acute pulmonary infiltrates. Clear lung fields bilaterally. "
            "If clinically suspected, RT-PCR testing remains the gold standard."
        ),
        "COVID-19": (
            "Imaging features highly consistent with COVID-19 pneumonia — bilateral "
            "peripheral GGO. Immediate RT-PCR confirmation and IPC isolation. "
            "Oxygen saturation monitoring, dexamethasone if SpO2 < 94% on air. "
            "Remdesivir consideration per current national guidelines."
        ),
        "Viral Pneumonia": (
            "Bilateral interstitial infiltrates consistent with viral pneumonia. "
            "Influenza A/B PCR, respiratory viral panel, and RT-PCR for SARS-CoV-2 "
            "recommended. Supportive care; antivirals if influenza confirmed."
        ),
        "Bacterial Pneumonia": (
            "Lobar consolidation consistent with bacterial pneumonia. CURB-65 "
            "severity scoring recommended. Blood cultures and sputum before "
            "antibiotics. Empirical beta-lactam +/- macrolide per local CAP protocol."
        ),
    }

    def predict(self, tensor):
        result = super().predict(tensor)
        cls = result["predicted_class"]
        result["clinical_note"]  = self.CLINICAL_NOTES.get(cls, "")
        result["cxr_pattern"]    = self.CXR_PATTERNS.get(cls, [])
        result["rt_pcr_note"]    = self.RT_PCR_NOTE.get(cls)
        return result
