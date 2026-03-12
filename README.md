# Neurax Intelligence — Clinical Intelligence Core

**6-module medical imaging intelligence platform + AI Symptom Engine**  
Zero data retention · Local inference · EfficientNet-B3 backbone

**Live Demo:** [https://disease-ashen.vercel.app](https://disease-ashen.vercel.app)

---

## Architecture

```
neurax/
├── src/                         ← Next.js 16 UI (Glass-Neon aesthetic)
│   ├── app/
│   │   ├── dashboard/page.tsx   ← Multimodal intelligence dashboard
│   │   └── settings/            ← Control center
│   ├── components/prediction/
│   │   ├── ScanningAnimation.tsx ← Real-time scanning UI
│   │   └── SymptomPicker.tsx    ← Interactive symptom input
│   ├── lib/catalog.server.ts    ← Local disease catalog
│   └── lib/metrics-store.ts     ← Real-time accuracy metrics
│
├── ml/                          ← Advanced ML Pipeline (505 diseases)
│   ├── data/                    ← Multi-source training datasets
│   ├── generated/               ← Optimized joblib model artifacts
│   ├── server.py                ← Local inference server
│   └── train.py                 ← High-accuracy training pipeline
│
├── design/                      ← Design blueprints & wireframes
│
└── neurax.db                    ← Local encrypted health vault
```

---

## Features

- **Elite Clinical UI**: Premium "Glass-Neon" interface with intuitive navigation.
- **Multimodal Analysis**: Seamlessly switch between Medical Imaging and Clinical Symptom Scanning.
- **High Accuracy ML**: Tuned Gradient Boosting models achieving near-perfect metrics.
- **Real-time Metrics**: Dynamic display of model precision, recall, and F1 scores.
- **Zero Data Retention**: Privacy-first approach where all data stays on your local machine.

---

## Setup

### 1. Requirements
- Node.js 20+
- Python 3.10+
- Scikit-learn, Pandas, Joblib (for ML core)

### 2. Quick Start

```bash
# Install UI dependencies
npm install

# Initialize ML models
python ml/train.py

# Start the dashboard
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment

The platform is optimized for Vercel deployment and local hosting.

- **GitHub Repository**: [neurax](https://github.com/justinsaroshthomas-dotcom/neurax.git)
- **Deployment URL**: [https://disease-ashen.vercel.app](https://disease-ashen.vercel.app)

---

> **Note**: Neurax Intelligence is a clinical decision support tool. It is designed to assist medical professionals and should not be used as a standalone diagnostic tool.

---

Made by IBM Team 63. All rights reserved.
**Development Team**: Justin Thomas (Lead), Devika NS, Krishnajith Vijay, Sivaranjps.
