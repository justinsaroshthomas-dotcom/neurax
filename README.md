# Neurax — Clinical Intelligence Core

**6-module medical imaging intelligence platform**  
Zero data retention · Local inference · EfficientNet-B3 backbone

---

## Architecture

```
neuramed/
├── backend/                     ← Python FastAPI ML server
│   ├── main.py                  ← FastAPI app, /analyze/{module} endpoints
│   ├── models/
│   │   ├── base_model.py        ← EfficientNet-B3 base class
│   │   ├── brain_tumor.py       ← Module 01: MRI → 4-class tumor
│   │   ├── alzheimers.py        ← Module 02: MRI → CDR staging
│   │   ├── lung_disease.py      ← Module 03: CXR → 4-class lung
│   │   ├── lumbar_spine.py      ← Module 04: X-Ray/MRI → spine
│   │   ├── neuroimaging.py      ← Module 05: CT/MRI → neuro emergency
│   │   ├── covid_xray.py        ← Module 06: CXR → COVID-19
│   │   └── registry.py          ← Module metadata
│   ├── utils/
│   │   ├── preprocessing.py     ← Image → normalised tensor
│   │   └── report.py            ← Structured radiology report builder
│   ├── weights/                 ← Place .pth fine-tuned weights here
│   └── requirements.txt
│
├── src/                         ← Next.js 16 UI
│   ├── app/
│   │   ├── dashboard/page.tsx   ← Multimodal intelligence dashboard
│   │   └── settings/            ← Control center
│   ├── components/imaging/
│   │   ├── ModuleSelector.tsx   ← 6-module grid switcher
│   │   ├── UploadZone.tsx       ← Drag-and-drop scan upload
│   │   ├── AnalysisPanel.tsx    ← Full results + probability chart
│   │   └── StatusBar.tsx        ← API health indicator
│   ├── lib/imaging.ts           ← API client + module config
│   └── types/imaging.ts         ← TypeScript types
│
├── ml/                          ← Symptom ML engine (505 diseases)
│   ├── server.py                ← Flask prediction server
│   ├── train.py                 ← MLP training pipeline
│   ├── vision_engine.py         ← Legacy vision engine (kept for compat)
│   ├── model.joblib
│   └── model_meta.json
│
└── start_neuramed.bat           ← One-click launcher
```

---

## Imaging Modules

| # | Module | Modality | Classes | Dataset |
|---|--------|----------|---------|---------|
| 01 | Brain Tumor | MRI | No Tumor / Glioma / Meningioma / Pituitary | Kaggle Brain Tumor MRI · 7,023 |
| 02 | Alzheimer's | MRI | Non Demented / Very Mild / Mild / Moderate | ADNI + Kaggle · 6,400 |
| 03 | Lung Disease | Chest X-Ray | Normal / Pneumonia / Lung Cancer / TB | NIH ChestX-ray14 · 112,120 |
| 04 | Lumbar Spine | X-Ray / MRI | Normal / Disc Herniation / Spondylosis / Stenosis | SpineWeb · 4,200 |
| 05 | Neuroimaging | CT / MRI | Normal / Stroke / MS / Hemorrhage | ISLES 2022 · 3,800 |
| 06 | COVID-19 X-Ray | Chest X-Ray | Normal / COVID-19 / Viral / Bacterial | COVID-19 DB · 21,165 |

---

## Setup

### 1. Backend (Vision Core)

```bash
cd backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**GPU support** (recommended):
```bash
pip install torch==2.5.1+cu121 torchvision==0.20.1+cu121 --index-url https://download.pytorch.org/whl/cu121
```

**Add fine-tuned weights:**  
Place `.pth` files in `backend/weights/` named after the module:
```
weights/
  brain_tumor.pth
  alzheimers.pth
  lung_disease.pth
  lumbar_spine.pth
  neuroimaging.pth
  covid_xray.pth
```
If no weights are found, ImageNet-pretrained EfficientNet-B3 is used.

### 2. Symptom Engine (Legacy)

```bash
pip install -r ml/requirements.txt
python ml/train.py
python ml/server.py
```

### 3. Frontend

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## API Reference

```
GET  /health                       Health check + active modules
GET  /modules                      Module metadata
POST /analyze/{module}             Single-module inference
POST /analyze/batch                Multi-module batch inference
```

**Example:**
```bash
curl -X POST http://localhost:8000/analyze/brain_tumor -F "file=@brain_mri.jpg"
```

**Response:**
```json
{
  "module": "brain_tumor",
  "result": {
    "predicted_class": "Glioma",
    "confidence": 94.7,
    "probabilities": [...],
    "urgency": "critical",
    "clinical_note": "...",
    "inference_ms": 42.1
  },
  "report": {
    "finding": "Glioma",
    "confidence_pct": 94.7,
    "urgency": { "label": "CRITICAL", "color": "#ff4d6a" },
    "action": "Immediate clinical review required.",
    "clinical_note": "...",
    "disclaimer": "FOR CLINICAL DECISION SUPPORT ONLY..."
  },
  "retained": false
}
```

---

## Zero Data Retention

- All images are processed in-memory only
- No scan data is written to disk, database, or logs
- Image bytes are explicitly deleted after inference
- CORS restricted to localhost:3000 by default

---

## Fine-tuning Your Own Weights

Each model uses EfficientNet-B3 with a custom head. To fine-tune:

```python
from models.brain_tumor import BrainTumorModel
import torch

model = BrainTumorModel(device="cuda")
net = model._model
# Train with your dataset...
torch.save(net.state_dict(), "weights/brain_tumor.pth")
```

---

> Neurax is a clinical decision support tool. All AI findings must be reviewed and verified by a qualified radiologist or clinician before clinical action. Not a substitute for professional medical judgment.

---

Made by IBM Team 63. All rights reserved.
Development team: Justin Thomas (Lead), Devika NS, Krishnajith Vijay, Sivaranjps.
