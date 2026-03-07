"""
NeuraMed Module 05 — Neuroimaging Analysis
Brain scan -> 4-class: Normal / Ischemic Stroke / Multiple Sclerosis / Intracranial Hemorrhage

Dataset basis : ISLES 2022 + MICCAI MS Lesion (3,800 images)
Architecture  : EfficientNet-B3 with attention map, 256x256
"""

from models.base_model import BaseImagingModel


class NeuroimagingModel(BaseImagingModel):
    MODULE_NAME = "neuroimaging"
    CLASSES = [
        "Normal",
        "Ischemic Stroke",
        "Multiple Sclerosis",
        "Intracranial Hemorrhage",
    ]
    INPUT_SIZE = (256, 256)
    URGENCY_MAP = {
        "Normal":                   "normal",
        "Ischemic Stroke":          "critical",
        "Multiple Sclerosis":       "warning",
        "Intracranial Hemorrhage":  "critical",
    }

    TIME_SENSITIVITY = {
        "Normal":                   None,
        "Ischemic Stroke":          "CODE STROKE — tPA window: <=4.5h from onset",
        "Multiple Sclerosis":       "Urgent neurology referral within 2 weeks",
        "Intracranial Hemorrhage":  "NEUROSURGICAL EMERGENCY — immediate CT angio",
    }

    IMAGING_MARKERS = {
        "Normal": [
            "Grey-white matter differentiation preserved",
            "No midline shift",
            "Ventricles normal calibre",
        ],
        "Ischemic Stroke": [
            "Restricted diffusion on DWI (hyperintense)",
            "ADC map hypointensity",
            "Corresponding FLAIR/T2 hyperintensity",
            "Loss of grey-white matter differentiation (early)",
        ],
        "Multiple Sclerosis": [
            "Periventricular T2/FLAIR hyperintensities",
            "Juxtacortical and infratentorial lesions",
            "Dawson's fingers pattern",
            "Active lesions enhance with gadolinium",
        ],
        "Intracranial Hemorrhage": [
            "Hyperdense collection on CT",
            "T1 hyperintensity (subacute) / T2 variable",
            "Mass effect / midline shift",
            "Perihaematomal oedema",
        ],
    }

    CLINICAL_NOTES = {
        "Normal": (
            "No acute intracranial pathology identified. White matter signal "
            "within normal limits. No mass, haemorrhage, or infarct detected."
        ),
        "Ischemic Stroke": (
            "DWI/ADC pattern consistent with acute ischemic stroke. IMMEDIATE "
            "activation of stroke pathway. CT angiography head and neck to assess "
            "for large vessel occlusion. tPA if within 4.5h window and no contraindications. "
            "Mechanical thrombectomy if LVO confirmed."
        ),
        "Multiple Sclerosis": (
            "White matter lesion pattern consistent with demyelinating disease. "
            "McDonald 2017 criteria assessment required. Lumbar puncture for "
            "oligoclonal bands, VEP, and specialist neurology review. "
            "Consider high-dose IV methylprednisolone for acute relapse."
        ),
        "Intracranial Hemorrhage": (
            "Intracranial haemorrhage identified. NEUROSURGICAL EMERGENCY. "
            "Reverse anticoagulation if applicable. Urgent CT angiogram to "
            "exclude AVM or aneurysm. Blood pressure control (target SBP <140 mmHg). "
            "Neurosurgical team review for evacuation decision."
        ),
    }

    def predict(self, tensor):
        result = super().predict(tensor)
        cls = result["predicted_class"]
        result["clinical_note"]    = self.CLINICAL_NOTES.get(cls, "")
        result["time_sensitivity"] = self.TIME_SENSITIVITY.get(cls)
        result["imaging_markers"]  = self.IMAGING_MARKERS.get(cls, [])
        return result
