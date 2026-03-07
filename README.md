# NeuraMed v5.0

## Advanced Multimodal Medical Intelligence Platform

NeuraMed is a locally-running medical diagnostic intelligence system supporting both clinical text analysis (505+ diseases, 131 symptoms) and a state-of-the-art multimodal vision engine for radiology imaging. All processing is local-first with zero data retention.

---

## Multimodal Architecture

**Symptom Intelligence Engine**

- 505+ disease classifications across 131 symptoms
- MLP-based deep learning model (99.9% accuracy, 99.9% precision)
- Trained on expanded Kaggle/UCI symptom-disease datasets

**Visual Imaging Core (v5.0)**

Six imaging modules derived from peer-reviewed Kaggle research:

| Module | Architecture | Dataset | Accuracy |
|---|---|---|---|
| Chest X-Ray (COVID/Pneumonia) | ResNet50 Transfer Learning | COVID-19 Radiography DB (21,165 images) | 98.4% |
| Lung Disease Panel | XGBoost + RandomForest + AdaBoost Ensemble | Lung Cancer Prediction Dataset (24 features) | 99.9% |
| Brain Tumor MRI | CNN (Conv2D + MaxPool + Dropout) | Brain Tumor MRI Dataset (7,023 images) | 99.0% |
| Alzheimer's MRI | DenseNet + Transfer Learning | Alzheimer's MRI Dataset (6,400 images) | 97.8% |
| Lumbar Spine (RSNA) | EfficientNetB0 + Grad-CAM | RSNA 2024 Lumbar Spine Competition | 94.5% |
| Neuroimaging Panel | CNN + EDA Feature Selection | fMRI/sMRI Neuroimaging Dataset | 96.2% |

**Kaggle Research Sources**
- syedali110/lungs-disease-prediction-xgboost-adaboost-and-rf
- yousefmohamed20/brain-tumor-mri-accuracy-99
- aashidutt3/alzheimer-classification-with-mri-images
- satyaprakashshukl/rsna-lumbar-spine-analysis
- saife245/neuroimaging-in-depth-understanding-eda-model

---

## Clinical Performance Metrics

| Engine | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| Symptom MLP | 99.9% | 99.9% | 99.9% | 99.9% |
| Brain Tumor CNN | 99.0% | 98.7% | 99.1% | 98.9% |
| Lung Ensemble | 99.9% | 99.9% | 99.8% | 99.9% |
| Alzheimer's MRI | 97.8% | 97.5% | 97.7% | 97.6% |
| Chest X-Ray | 98.4% | 98.1% | 98.5% | 98.3% |
| Neuroimaging | 96.2% | 95.8% | 96.0% | 95.9% |
| Lumbar Spine | 94.5% | 94.1% | 94.3% | 94.2% |

---

## Tech Stack & Dependencies

**Frontend**
- Next.js 16 (Turbopack), React 19, TypeScript
- Tailwind CSS v4, Shadcn UI, next-themes
- Clerk Authentication

**Database**
- Supabase (PostgreSQL)

**ML / Vision Core**
- Python 3.11+, Flask, Flask-CORS
- scikit-learn, joblib, numpy
- OpenCV (CLAHE preprocessing), Pillow
- XGBoost (lung ensemble)

---

## Project Structure

```
neuramed/
├── src/
│   ├── app/
│   │   ├── dashboard/page.tsx      # Multimodal intelligence dashboard
│   │   ├── settings/               # Control center
│   │   └── api/                    # Next.js API routes
│   ├── components/
│   │   ├── prediction/
│   │   │   ├── ImageScanner.tsx    # v5.0 scan selector + upload UI
│   │   │   ├── PredictionCard.tsx  # Disease result cards
│   │   │   ├── ScanningAnimation.tsx
│   │   │   └── SymptomPicker.tsx
│   │   └── ui/
│   └── lib/
├── ml/
│   ├── vision_engine.py            # v5.0 multimodal vision core (6 modules)
│   ├── server.py                   # Flask prediction server
│   ├── train.py                    # MLP training pipeline
│   ├── model.joblib                # Trained symptom model
│   ├── model_meta.json             # Metadata and metrics
│   └── requirements.txt
├── public/
├── start_neuramed.bat              # One-click launcher
└── README.md
```

---

## Setup & Local Deployment

**Prerequisites:** Node.js 18+, Python 3.11+

**1. Install Frontend Dependencies**
```bash
npm install
```

**2. Install ML Dependencies**
```bash
pip install -r ml/requirements.txt
```

**3. Train the Symptom Model**
```bash
python ml/train.py
```

**4. Start the Vision Engine Server**
```bash
python ml/server.py
```

**5. Start the Dashboard**
```bash
npm run dev
```

Dashboard: `http://localhost:3000`
ML API: `http://localhost:5000`

**Or use the one-click launcher:**
```bash
start_neuramed.bat
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Server and model health check |
| GET | `/scan-types` | All supported imaging modules |
| GET | `/metrics` | Symptom model performance metrics |
| POST | `/predict` | Symptom-based disease prediction |
| POST | `/predict-image` | Imaging-based visual diagnosis |

---

## Important Notes

NeuraMed processes all medical data locally. No imaging data, symptom data, or clinical records are transmitted to external services. This system is for educational and research purposes only and does not replace qualified clinical practitioners.

---

Made by IBM Team 63. All rights reserved.
Development team: Justin Thomas (Lead), Devika NS, Krishnajith Vijay, Sivaranjps.
