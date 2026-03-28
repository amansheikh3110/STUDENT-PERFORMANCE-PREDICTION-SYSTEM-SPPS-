"""ML prediction routes."""

from fastapi import APIRouter, Depends, HTTPException
from app.database import get_database
from app.auth import RoleChecker
from app.ml.predict import run_predictions_for_all, predict_single_student

router = APIRouter(prefix="/api/predictions", tags=["Predictions"])


@router.post("/run-all")
async def trigger_batch_predictions(user: dict = Depends(RoleChecker(["admin"]))):
    """Run ML predictions for all students (admin-only batch job)."""
    db = get_database()
    result = await run_predictions_for_all(db)
    return result


@router.post("/run/{student_id}")
async def trigger_single_prediction(student_id: str, user: dict = Depends(RoleChecker(["admin", "teacher"]))):
    """Run prediction for a single student."""
    db = get_database()
    result = await predict_single_student(db, student_id)
    if not result:
        raise HTTPException(status_code=404, detail="Student not found")
    return result
