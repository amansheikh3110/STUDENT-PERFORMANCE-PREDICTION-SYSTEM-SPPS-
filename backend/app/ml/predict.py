"""
Prediction service — loads the trained model, generates risk scores,
and uses SHAP to explain each prediction.
"""

import os
import numpy as np
import pandas as pd
import joblib
import shap
from datetime import datetime, timezone

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "trained_model")
MODEL_PATH = os.path.join(MODEL_DIR, "xgb_risk_model.pkl")
FEATURE_NAMES_PATH = os.path.join(MODEL_DIR, "feature_names.pkl")

RISK_LABELS = {0: "low", 1: "medium", 2: "high"}
GRADE_MAP = {0: "A/B (Pass)", 1: "C/D (Borderline)", 2: "F (Fail)"}

# Human-readable feature names for SHAP explanations
FEATURE_DISPLAY = {
    "attendance_pct": "Attendance",
    "assignment_completion_pct": "Assignment Completion",
    "quiz_avg_score": "Quiz Performance",
    "midterm_score": "Midterm Score",
    "lms_engagement_hours": "LMS Engagement",
    "classes_missed_last_2_weeks": "Recent Absences",
    "assignments_missed": "Missed Assignments",
    "study_hours_per_week": "Study Hours",
    "previous_gpa": "Previous GPA",
}

_model = None
_feature_names = None
_explainer = None


def _load_model():
    global _model, _feature_names, _explainer
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError("Model not trained yet. Run: python -m app.ml.train")
        _model = joblib.load(MODEL_PATH)
        _feature_names = joblib.load(FEATURE_NAMES_PATH)
        _explainer = shap.TreeExplainer(_model)
    return _model, _feature_names, _explainer


def _generate_top_signal(shap_values_row, feature_names, metrics: dict) -> str:
    """Generate a human-readable explanation from the top SHAP contributor."""
    abs_shap = np.abs(shap_values_row)
    top_idx = np.argmax(abs_shap)
    feature = feature_names[top_idx]
    display_name = FEATURE_DISPLAY.get(feature, feature)
    value = metrics.get(feature, "?")

    signal_templates = {
        "attendance_pct": f"Attendance at {value:.0f}% (below safe threshold)",
        "assignment_completion_pct": f"Only {value:.0f}% assignments completed",
        "quiz_avg_score": f"Quiz average is {value:.0f}/100",
        "midterm_score": f"Midterm score: {value:.0f}/100",
        "lms_engagement_hours": f"Only {value:.1f}h/week on LMS",
        "classes_missed_last_2_weeks": f"{int(value)} classes missed in last 2 weeks",
        "assignments_missed": f"{int(value)} assignments missed",
        "study_hours_per_week": f"Only {value:.1f}h study/week",
        "previous_gpa": f"Previous GPA: {value:.2f}/4.0",
    }

    return signal_templates.get(feature, f"{display_name}: {value}")


def _get_shap_factors(shap_values_row, feature_names, metrics: dict) -> list:
    """Return all SHAP feature contributions sorted by impact."""
    factors = []
    for i, feat in enumerate(feature_names):
        factors.append({
            "feature": feat,
            "display_name": FEATURE_DISPLAY.get(feat, feat),
            "value": float(metrics.get(feat, 0)),
            "impact": round(float(shap_values_row[i]), 4),
            "abs_impact": round(float(abs(shap_values_row[i])), 4),
        })
    factors.sort(key=lambda x: x["abs_impact"], reverse=True)
    return factors


def predict_student(metrics: dict) -> dict:
    """Predict risk for a single student given their metrics dict."""
    model, feature_names, explainer = _load_model()

    # Build feature vector
    features = [metrics.get(f, 0) for f in feature_names]
    X = pd.DataFrame([features], columns=feature_names)

    # Predict class and probability
    pred_class = int(model.predict(X)[0])
    pred_proba = model.predict_proba(X)[0]

    # Risk score = weighted probability toward high risk (0-100)
    risk_score = round(float(pred_proba[1] * 50 + pred_proba[2] * 100), 1)

    # SHAP explanation — use the predicted class's SHAP values
    shap_values = explainer.shap_values(X)
    if isinstance(shap_values, list):
        shap_row = shap_values[pred_class][0]
    elif hasattr(shap_values, 'shape') and len(shap_values.shape) == 3:
        shap_row = shap_values[0, :, pred_class]
    else:
        shap_row = shap_values[0]

    top_signal = _generate_top_signal(shap_row, feature_names, metrics)
    shap_factors = _get_shap_factors(shap_row, feature_names, metrics)

    return {
        "risk_score": risk_score,
        "risk_level": RISK_LABELS[pred_class],
        "predicted_grade": GRADE_MAP[pred_class],
        "top_signal": top_signal,
        "shap_factors": shap_factors,
        "probabilities": {
            "on_track": round(float(pred_proba[0]), 3),
            "medium_risk": round(float(pred_proba[1]), 3),
            "high_risk": round(float(pred_proba[2]), 3),
        },
    }


async def predict_single_student(db, student_id: str) -> dict | None:
    """Load student from DB, predict, save results back."""
    student = await db.students.find_one({"student_id": student_id})
    if not student:
        return None

    result = predict_student(student["metrics"])

    await db.students.update_one(
        {"student_id": student_id},
        {"$set": {
            "risk_score": result["risk_score"],
            "risk_level": result["risk_level"],
            "predicted_grade": result["predicted_grade"],
            "top_signal": result["top_signal"],
            "shap_factors": result["shap_factors"],
            "last_prediction_at": datetime.now(timezone.utc),
        }},
    )

    return {"student_id": student_id, **result}


async def run_predictions_for_all(db) -> dict:
    """Batch predict for every student in the database."""
    cursor = db.students.find({})
    count = 0
    high_risk = 0

    async for student in cursor:
        sid = student["student_id"]
        result = predict_student(student["metrics"])

        await db.students.update_one(
            {"student_id": sid},
            {"$set": {
                "risk_score": result["risk_score"],
                "risk_level": result["risk_level"],
                "predicted_grade": result["predicted_grade"],
                "top_signal": result["top_signal"],
                "shap_factors": result["shap_factors"],
                "last_prediction_at": datetime.now(timezone.utc),
            }},
        )
        count += 1
        if result["risk_level"] == "high":
            high_risk += 1

    return {
        "message": f"Predictions completed for {count} students",
        "total_predicted": count,
        "high_risk_found": high_risk,
    }
