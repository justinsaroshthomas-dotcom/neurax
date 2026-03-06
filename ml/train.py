"""
NeuraMed — Disease Prediction ML Model
=======================================
Train a Random Forest classifier on symptom-disease data.
Outputs: accuracy, F1, precision, recall scores.
Saves the trained model to ml/model.joblib

Usage:
    python ml/train.py
"""

import json
import random
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    classification_report,
    confusion_matrix,
)
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# ─────────────────────────────────────────
# Disease-Symptom Knowledge Base
# (same data as the Next.js seed)
# ─────────────────────────────────────────

SYMPTOMS = [
    "Fever", "Fatigue", "Chills", "Weight Loss", "Sweating", "Malaise",
    "Cough", "Shortness of Breath", "Chest Pain", "Sore Throat", "Runny Nose", "Wheezing",
    "Nausea", "Vomiting", "Diarrhea", "Abdominal Pain", "Loss of Appetite", "Bloating",
    "Headache", "Dizziness", "Confusion", "Blurred Vision", "Seizures", "Numbness",
    "Joint Pain", "Muscle Pain", "Stiffness", "Swelling", "Back Pain",
    "Rash", "Itching", "Skin Discoloration", "Dry Skin", "Hair Loss",
    "Palpitations", "High Blood Pressure", "Swollen Legs", "Rapid Heartbeat",
    "Frequent Urination", "Painful Urination", "Blood in Urine",
    "Ear Pain", "Hearing Loss", "Nasal Congestion",
    "Anxiety", "Insomnia", "Depression",
    "Yellowing of Skin", "Dark Urine", "Excessive Thirst",
]

DISEASES = {
    "Common Cold": {
        "symptoms": {"Cough": 0.9, "Sore Throat": 0.85, "Runny Nose": 0.9,
                     "Nasal Congestion": 0.8, "Headache": 0.5, "Fatigue": 0.4},
        "severity": "low",
    },
    "Influenza": {
        "symptoms": {"Fever": 0.95, "Cough": 0.8, "Muscle Pain": 0.85,
                     "Fatigue": 0.9, "Chills": 0.8, "Headache": 0.7, "Sore Throat": 0.5},
        "severity": "medium",
    },
    "COVID-19": {
        "symptoms": {"Fever": 0.8, "Cough": 0.85, "Shortness of Breath": 0.9,
                     "Fatigue": 0.85, "Muscle Pain": 0.6, "Headache": 0.6, "Loss of Appetite": 0.5},
        "severity": "high",
    },
    "Pneumonia": {
        "symptoms": {"Cough": 0.9, "Fever": 0.85, "Shortness of Breath": 0.9,
                     "Chest Pain": 0.8, "Chills": 0.7, "Fatigue": 0.75, "Sweating": 0.6},
        "severity": "high",
    },
    "Gastroenteritis": {
        "symptoms": {"Diarrhea": 0.9, "Vomiting": 0.85, "Nausea": 0.8,
                     "Abdominal Pain": 0.85, "Fever": 0.6, "Fatigue": 0.5},
        "severity": "medium",
    },
    "Migraine": {
        "symptoms": {"Headache": 0.95, "Nausea": 0.7, "Blurred Vision": 0.65,
                     "Dizziness": 0.6, "Insomnia": 0.4, "Fatigue": 0.5},
        "severity": "medium",
    },
    "Type 2 Diabetes": {
        "symptoms": {"Excessive Thirst": 0.9, "Frequent Urination": 0.85,
                     "Fatigue": 0.7, "Blurred Vision": 0.6, "Weight Loss": 0.5, "Numbness": 0.6},
        "severity": "high",
    },
    "Hypertension": {
        "symptoms": {"High Blood Pressure": 0.95, "Headache": 0.6,
                     "Blurred Vision": 0.5, "Shortness of Breath": 0.5,
                     "Palpitations": 0.55, "Dizziness": 0.4},
        "severity": "high",
    },
    "Rheumatoid Arthritis": {
        "symptoms": {"Joint Pain": 0.95, "Stiffness": 0.9, "Swelling": 0.85,
                     "Fatigue": 0.6, "Fever": 0.3, "Muscle Pain": 0.5},
        "severity": "medium",
    },
    "Hepatitis B": {
        "symptoms": {"Yellowing of Skin": 0.9, "Dark Urine": 0.85, "Fatigue": 0.7,
                     "Abdominal Pain": 0.65, "Nausea": 0.6, "Joint Pain": 0.4, "Fever": 0.5},
        "severity": "high",
    },
    "Asthma": {
        "symptoms": {"Wheezing": 0.95, "Shortness of Breath": 0.9,
                     "Cough": 0.7, "Chest Pain": 0.5},
        "severity": "medium",
    },
    "Urinary Tract Infection": {
        "symptoms": {"Painful Urination": 0.95, "Frequent Urination": 0.9,
                     "Blood in Urine": 0.7, "Abdominal Pain": 0.5, "Fever": 0.4},
        "severity": "low",
    },
    "Malaria": {
        "symptoms": {"Fever": 0.95, "Chills": 0.9, "Sweating": 0.85,
                     "Headache": 0.7, "Muscle Pain": 0.65, "Vomiting": 0.5, "Fatigue": 0.7},
        "severity": "critical",
    },
    "Dengue Fever": {
        "symptoms": {"Fever": 0.95, "Headache": 0.8, "Muscle Pain": 0.85,
                     "Joint Pain": 0.7, "Rash": 0.6, "Nausea": 0.5, "Fatigue": 0.75},
        "severity": "high",
    },
    "Anxiety Disorder": {
        "symptoms": {"Anxiety": 0.95, "Insomnia": 0.8, "Palpitations": 0.7,
                     "Rapid Heartbeat": 0.65, "Dizziness": 0.5,
                     "Shortness of Breath": 0.4, "Malaise": 0.5},
        "severity": "medium",
    },
    "Eczema": {
        "symptoms": {"Itching": 0.95, "Rash": 0.9, "Dry Skin": 0.8,
                     "Skin Discoloration": 0.6},
        "severity": "low",
    },
    "Meningitis": {
        "symptoms": {"Fever": 0.9, "Headache": 0.9, "Stiffness": 0.85,
                     "Confusion": 0.8, "Nausea": 0.6, "Seizures": 0.7, "Rash": 0.5},
        "severity": "critical",
    },
    "Chronic Kidney Disease": {
        "symptoms": {"Fatigue": 0.7, "Swollen Legs": 0.8, "Nausea": 0.6,
                     "Frequent Urination": 0.65, "High Blood Pressure": 0.6,
                     "Loss of Appetite": 0.55, "Numbness": 0.5},
        "severity": "high",
    },
}


def generate_training_data(n_samples_per_disease=200, noise_rate=0.1):
    """
    Generate synthetic training data from the disease-symptom knowledge base.
    Each sample is a binary vector of symptoms with added noise.
    """
    symptom_index = {name: i for i, name in enumerate(SYMPTOMS)}
    n_features = len(SYMPTOMS)

    X = []
    y = []

    for disease_name, disease_info in DISEASES.items():
        disease_symptoms = disease_info["symptoms"]

        for _ in range(n_samples_per_disease):
            sample = np.zeros(n_features)

            # Activate symptoms based on their weight (probability)
            for symptom_name, weight in disease_symptoms.items():
                if symptom_name in symptom_index:
                    # Higher weight = higher chance of being present
                    if random.random() < weight:
                        sample[symptom_index[symptom_name]] = 1.0

            # Add random noise (false positives)
            for i in range(n_features):
                if sample[i] == 0 and random.random() < noise_rate:
                    sample[i] = 1.0

            # Ensure at least 2 symptoms are active
            if sample.sum() < 2:
                primary_symptoms = list(disease_symptoms.keys())[:2]
                for s in primary_symptoms:
                    if s in symptom_index:
                        sample[symptom_index[s]] = 1.0

            X.append(sample)
            y.append(disease_name)

    return np.array(X), np.array(y)


def train_model():
    """Train the Random Forest model and print evaluation metrics."""
    print("=" * 60)
    print("  NeuraMed — Disease Prediction Model Training")
    print("=" * 60)
    print()

    # Generate training data
    print("[1/4] Generating synthetic training data...")
    random.seed(42)
    np.random.seed(42)
    X, y = generate_training_data(n_samples_per_disease=300, noise_rate=0.08)
    print(f"       Dataset: {len(X)} samples, {len(SYMPTOMS)} features, {len(DISEASES)} diseases")
    print()

    # Encode labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    # Split data
    print("[2/4] Splitting into train/test sets (80/20)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    print(f"       Train: {len(X_train)} samples | Test: {len(X_test)} samples")
    print()

    # Train model
    print("[3/4] Training Random Forest Classifier...")
    model = RandomForestClassifier(
        n_estimators=150,
        max_depth=20,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)
    print("       [OK] Model trained successfully")
    print()

    # Evaluate
    print("[4/4] Evaluating model performance...")
    y_pred = model.predict(X_test)

    accuracy = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average="weighted")
    precision = precision_score(y_test, y_pred, average="weighted")
    recall = recall_score(y_test, y_pred, average="weighted")

    print()
    print("─" * 60)
    print("  MODEL EVALUATION METRICS")
    print("─" * 60)
    print(f"  Accuracy:   {accuracy:.4f}  ({accuracy * 100:.2f}%)")
    print(f"  F1 Score:   {f1:.4f}  ({f1 * 100:.2f}%)")
    print(f"  Precision:  {precision:.4f}  ({precision * 100:.2f}%)")
    print(f"  Recall:     {recall:.4f}  ({recall * 100:.2f}%)")
    print("─" * 60)
    print()

    # Per-class report
    print("  PER-DISEASE CLASSIFICATION REPORT:")
    print()
    report = classification_report(y_test, y_pred, target_names=le.classes_)
    print(report)

    # Save model
    model_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(model_dir, "model.joblib")
    meta_path = os.path.join(model_dir, "model_meta.json")

    joblib.dump(model, model_path)

    meta = {
        "symptoms": SYMPTOMS,
        "diseases": list(le.classes_),
        "disease_info": {
            name: {
                "severity": info["severity"],
                "symptoms": list(info["symptoms"].keys()),
            }
            for name, info in DISEASES.items()
        },
        "metrics": {
            "accuracy": round(accuracy, 4),
            "f1_score": round(f1, 4),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
        },
        "training_samples": len(X_train),
        "test_samples": len(X_test),
    }

    with open(meta_path, "w") as f:
        json.dump(meta, f, indent=2)

    print(f"  [OK] Model saved to: {model_path}")
    print(f"  [OK] Metadata saved to: {meta_path}")
    print()
    print("=" * 60)
    print("  Training complete! Run 'python ml/server.py' to start serving.")
    print("=" * 60)


if __name__ == "__main__":
    train_model()
