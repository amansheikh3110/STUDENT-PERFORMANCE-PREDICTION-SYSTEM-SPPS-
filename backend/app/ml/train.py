"""
Train an XGBoost model on synthetic student data.
Run this script once to generate the model file used by the prediction service.

Usage:
    python -m app.ml.train
"""

import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from xgboost import XGBClassifier
import joblib

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "trained_model")
MODEL_PATH = os.path.join(MODEL_DIR, "xgb_risk_model.pkl")
FEATURE_NAMES_PATH = os.path.join(MODEL_DIR, "feature_names.pkl")

FEATURE_COLS = [
    "attendance_pct",
    "assignment_completion_pct",
    "quiz_avg_score",
    "midterm_score",
    "lms_engagement_hours",
    "classes_missed_last_2_weeks",
    "assignments_missed",
    "study_hours_per_week",
    "previous_gpa",
]


def generate_synthetic_data(n_samples: int = 2000) -> pd.DataFrame:
    """Generate realistic synthetic student data for training."""
    np.random.seed(42)

    data = {
        "attendance_pct": np.clip(np.random.normal(75, 18, n_samples), 10, 100),
        "assignment_completion_pct": np.clip(np.random.normal(70, 20, n_samples), 0, 100),
        "quiz_avg_score": np.clip(np.random.normal(65, 15, n_samples), 10, 100),
        "midterm_score": np.clip(np.random.normal(60, 20, n_samples), 0, 100),
        "lms_engagement_hours": np.clip(np.random.exponential(5, n_samples), 0.5, 30),
        "classes_missed_last_2_weeks": np.random.poisson(2, n_samples),
        "assignments_missed": np.random.poisson(1.5, n_samples),
        "study_hours_per_week": np.clip(np.random.normal(10, 5, n_samples), 0, 40),
        "previous_gpa": np.clip(np.random.normal(2.8, 0.7, n_samples), 0.5, 4.0),
    }

    df = pd.DataFrame(data)

    # Create risk label based on weighted combination (mimics real-world patterns)
    risk_score = (
        (100 - df["attendance_pct"]) * 0.20
        + (100 - df["assignment_completion_pct"]) * 0.18
        + (100 - df["quiz_avg_score"]) * 0.15
        + (100 - df["midterm_score"]) * 0.15
        + df["classes_missed_last_2_weeks"] * 5
        + df["assignments_missed"] * 6
        + (30 - df["lms_engagement_hours"]) * 0.5
        + (20 - df["study_hours_per_week"]) * 0.8
        + (4.0 - df["previous_gpa"]) * 8
    )

    # Add noise
    risk_score += np.random.normal(0, 5, n_samples)

    # Classify: 0 = on_track (low risk), 1 = medium risk, 2 = high risk
    df["risk_label"] = pd.cut(
        risk_score,
        bins=[-np.inf, 35, 55, np.inf],
        labels=[0, 1, 2],
    ).astype(int)

    return df


def train_model():
    """Train XGBoost classifier and save to disk."""
    os.makedirs(MODEL_DIR, exist_ok=True)

    print("📊 Generating synthetic training data...")
    df = generate_synthetic_data(3000)

    X = df[FEATURE_COLS]
    y = df["risk_label"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print("🤖 Training XGBoost model...")
    model = XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        use_label_encoder=False,
        eval_metric="mlogloss",
        random_state=42,
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    print("\n📈 Model Performance:")
    print(f"   Accuracy: {accuracy_score(y_test, y_pred):.3f}")
    print("\n" + classification_report(y_test, y_pred, target_names=["On Track", "Medium Risk", "High Risk"]))

    # Save
    joblib.dump(model, MODEL_PATH)
    joblib.dump(FEATURE_COLS, FEATURE_NAMES_PATH)
    print(f"\n✅ Model saved to {MODEL_PATH}")

    return model


if __name__ == "__main__":
    train_model()
