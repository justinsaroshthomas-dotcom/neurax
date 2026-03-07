"""
NeuraMed Module 01 — Brain Tumor MRI Classification
MRI scan -> 4-class: No Tumor / Glioma / Meningioma / Pituitary

Dataset basis : Kaggle Brain Tumor MRI Dataset (7,023 images)
Architecture  : EfficientNet-B3 fine-tuned, 224x224
"""

from models.base_model import BaseImagingModel


class BrainTumorModel(BaseImagingModel):
    MODULE_NAME = "brain_tumor"
    CLASSES = [
        "No Tumor",
        "Glioma",
        "Meningioma",
        "Pituitary Tumor",
    ]
    INPUT_SIZE = (224, 224)
    URGENCY_MAP = {
        "No Tumor":        "normal",
        "Glioma":          "critical",
        "Meningioma":      "warning",
        "Pituitary Tumor": "warning",
    }

    WHO_GRADE_HINT = {
        "Glioma":          "Grade II–IV (requires histopathological confirmation)",
        "Meningioma":      "Grade I–II (typically benign; surgery if symptomatic)",
        "Pituitary Tumor": "Varies — functional vs non-functional adenoma",
        "No Tumor":        None,
    }

    CLINICAL_NOTES = {
        "No Tumor": (
            "No intracranial mass or space-occupying lesion identified. "
            "Grey-white matter differentiation preserved. Ventricles normal calibre. "
            "No midline shift or mass effect."
        ),
        "Glioma": (
            "Intra-axial mass with features consistent with glioma. "
            "WHO grading requires biopsy — IDH1/IDH2 mutation status, "
            "MGMT methylation, and 1p/19q codeletion should be assessed. "
            "Urgent neuro-oncology MDT referral. Gadolinium-enhanced MRI "
            "for boundary delineation recommended."
        ),
        "Meningioma": (
            "Extra-axial dural-based mass consistent with meningioma. "
            "Homogeneous enhancement with dural tail sign expected. "
            "If asymptomatic: serial MRI surveillance (6-monthly). "
            "If symptomatic or growing: neurosurgical resection or SRS."
        ),
        "Pituitary Tumor": (
            "Sellar/parasellar mass consistent with pituitary adenoma. "
            "Comprehensive anterior pituitary hormone panel required "
            "(GH, ACTH, TSH, LH, FSH, prolactin). Formal visual field "
            "testing (Humphrey perimetry) for optic chiasm compression. "
            "Consider trans-sphenoidal resection for macroadenomas."
        ),
    }

    def predict(self, tensor):
        result = super().predict(tensor)
        cls = result["predicted_class"]
        result["clinical_note"] = self.CLINICAL_NOTES.get(cls, "")
        result["who_grade"]     = self.WHO_GRADE_HINT.get(cls)
        return result
