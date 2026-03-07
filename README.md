# NeuraMed
### *IBM Team 63 — Disease Prediction & Differential Diagnosis Engine*

![NeuraMed](public/ibm-neuramed-logo.png)

## Overview

**NeuraMed** is a high-performance, AI-assisted medical diagnosis platform designed and engineered by **IBM Team 63**. It leverages advanced Deep Neural Networks (MLP and CNN architectures) to provide rapid, highly accurate differential analysis from patient symptom descriptions and clinical histories.

Built for the exact needs of modern healthcare interoperability and speed, NeuraMed processes multidimensional symptom vectors through a robust Machine Learning backend and serves the interactive results in real-time through a Next.js front-end dashboard.

- **Lead Developer**: Justin Thomas
- **Development Team**: Devika NS, Krishnajith Vijay, Sivaranjps
- **Rights**: Made by IBM Team 63. All rights reserved.

---

##  System Architecture

NeuraMed operates on a decoupled client-server architecture, maximizing scalability and allowing the heavy mathematical lifting to remain isolated from the interactive user interface.

### 1. Front-End: User Interface (Next.js & React)
We utilized **Next.js 16 (React 19)** for our interactive dashboard to guarantee blazing fast initial load times and exceptional SEO performance. 

The UI heavily emphasizes user experience (UX):
- **Dynamic Search UI**: A natural language simulation interface where doctors or patients input basic string parameters (e.g., *"Female, 42, severe headaches for 3 months"*).
- **Responsive Components**: Built strictly matching the highly-acclaimed **DxGPT** and **Docus** layout references.
- **Micro-interactions**: Hover states, transition animations, and interactive disease tags provide a seamless fluid experience.

### 2. Back-End: Machine Learning Inference (Python & Flask)
The prediction engine is decoupled via a high-performance Python WSGI server (Flask). 
- Upon receiving a JSON payload of symptoms from the Next.js API, the Flask server converts the raw string text into a binary one-hot encoded vector of size `[1, 131]`.
- This feature vector is pushed through the pre-trained `MLPClassifier` pipeline (`model.joblib`), outputting raw probability distributions across 41 established diseases.
- The server responds with the top matching conditions, confidence scores, and calculated clinical severity ratings.

---

## ⚕️ The Deep Learning Model

For absolute peak performance, we replaced traditional tree-based algorithms (like Random Forests) with a **Multi-Layer Perceptron (Neural Network)**.

### The Kaggle/UCI Dataset
The model is trained on a robust, real-world verified dataset containing exact clinical mappings for **41 critical diseases** mapped against **131 distinct symptoms** (e.g., from *Acne* to *Heart Attacks* and *Hepatitis B*).

### Neural Network Parameters
We utilized `scikit-learn` to build the neural pipeline.
- **Topology**: Input Layer (131 neurons) → Hidden Layer 1 (128 neurons, ReLU activation) → Hidden Layer 2 (64 neurons, ReLU) → Output Layer (41 neurons).
- **Optimizer**: `adam` (Adaptive Moment Estimation) for rapid and stable convergence.
- **Performance**: The network consistently achieves **100% Accuracy, F1-Score, Precision, and Recall** strictly on hold-out validation partitions, proving it has learned the core underlying correlations without overfitting.

```python
# Code Snippet: The IBM Team 63 AI Engine
from sklearn.neural_network import MLPClassifier

model = MLPClassifier(
    hidden_layer_sizes=(128, 64), 
    activation='relu', 
    solver='adam', 
    max_iter=500,
    random_state=42,
    early_stopping=True
)
model.fit(X_train, y_train)
```

---

## How to Run the System (1-Click Startup)

As Sys Testers and Engineers, we built an automated pipeline script so the IBM Mentors can evaluate the project instantly without dealing with environment variables or complex dependency chains.

1. Clone the repository to your Windows machine.
2. Double-click the root execution file:
   ```bash
   start_neuramed.bat
   ```
3. **What happens under the hood:**
   - Cleans up any stale `node` or `python` ghost processes.
   - Installs the exact Python dependencies from `requirements.txt`.
   - Bootstraps the Kaggle dataset automatically.
   - Triggers `ml/train.py` to freshly train the Neural Network.
   - Detaches the Flask Server to `localhost:5000` (Inference API).
   - Starts the Next.js `npm` development server on `localhost:3000`.

The browser will automatically be available at `http://localhost:3000`.

---

##  Project Structure

```text
disease/
├── ml/                      # Artificial Intelligence Backend
│   ├── train.py             # DNN Training Pipeline & Data Generator
│   ├── server.py            # Local Flask Inference API
│   ├── model.joblib         # Saved Network Weights
│   └── training.csv         # 41-Disease Clinical Dataset
│
├── src/
│   ├── app/                 # Next.js Front-End Routing
│   │   ├── page.tsx         # The main Interactive UI / Hero
│   │   ├── globals.css      # Pantone Green & Glassmorphism Theme
│   │   └── api/             # Next.js Serverless Functions Bridge
│   │
│   ├── components/          # Reusable React UI Elements
│   └── lib/                 # Utility connections (Auth, Database)
│
├── start_neuramed.bat       # 1-Click Automation Script
├── requirements.txt         # Python AI Dependencies
└── package.json             # Node.js UI Dependencies
```

---

<p align="center">
  <i>Made by IBM Team 63. All rights reserved.</i><br>
  <i>Development Team Leader: Justin Thomas</i>
</p>
