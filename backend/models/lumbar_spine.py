"""
NeuraMed Module 04 — Lumbar Spine Pathology Classification
X-Ray / MRI -> 4-class: Normal / Disc Herniation / Spondylosis / Spinal Stenosis

Dataset basis : SpineWeb + VGH Lumbar MRI Dataset (4,200 images)
Architecture  : EfficientNet-B3, 224x224
"""

from models.base_model import BaseImagingModel


class LumbarSpineModel(BaseImagingModel):
    MODULE_NAME = "lumbar_spine"
    CLASSES = [
        "Normal",
        "Disc Herniation",
        "Spondylosis",
        "Spinal Stenosis",
    ]
    INPUT_SIZE = (224, 224)
    URGENCY_MAP = {
        "Normal":          "normal",
        "Disc Herniation": "warning",
        "Spondylosis":     "info",
        "Spinal Stenosis": "warning",
    }

    ICD10_MAP = {
        "Normal":          "Z96.641",
        "Disc Herniation": "M51.16",
        "Spondylosis":     "M47.816",
        "Spinal Stenosis": "M48.06",
    }

    AFFECTED_LEVELS = {
        "Disc Herniation": ["L4-L5", "L5-S1"],
        "Spondylosis":     ["L3-L4", "L4-L5", "L5-S1"],
        "Spinal Stenosis": ["L3-L4", "L4-L5"],
        "Normal":          [],
    }

    CLINICAL_NOTES = {
        "Normal": (
            "Lumbar spine alignment and disc spaces within normal limits. "
            "No significant degenerative changes, herniation, or stenosis identified."
        ),
        "Disc Herniation": (
            "Disc herniation identified, most commonly at L4-L5 or L5-S1. "
            "Conservative management (physiotherapy, NSAIDs) first-line. "
            "MRI lumbosacral spine advised if neurological deficits present. "
            "Neurosurgical referral if cauda equina syndrome suspected."
        ),
        "Spondylosis": (
            "Degenerative changes consistent with lumbar spondylosis — osteophyte "
            "formation, disc space narrowing, facet joint arthropathy. "
            "Physiotherapy and pain management. DEXA scan if osteoporosis risk factors present."
        ),
        "Spinal Stenosis": (
            "Narrowing of the lumbar spinal canal consistent with spinal stenosis. "
            "Neurogenic claudication pattern: pain worse on walking, relieved by flexion. "
            "Epidural steroid injection or surgical decompression (laminectomy) "
            "may be considered based on symptom severity."
        ),
    }

    def predict(self, tensor):
        result = super().predict(tensor)
        cls = result["predicted_class"]
        result["clinical_note"]    = self.CLINICAL_NOTES.get(cls, "")
        result["icd10_code"]       = self.ICD10_MAP.get(cls, "-")
        result["affected_levels"]  = self.AFFECTED_LEVELS.get(cls, [])
        return result
