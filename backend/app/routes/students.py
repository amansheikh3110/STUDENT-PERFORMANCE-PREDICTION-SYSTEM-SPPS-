"""Student CRUD routes."""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from bson import ObjectId
from datetime import datetime, timezone

from app.database import get_database
from app.auth import get_current_user, RoleChecker
from app.models.student import StudentCreateRequest, StudentRecord, StudentUpdateMetrics

router = APIRouter(prefix="/api/students", tags=["Students"])

allow_staff = RoleChecker(["admin", "teacher", "counsellor"])
allow_all = RoleChecker(["admin", "teacher", "counsellor", "student"])


def _serialize_student(doc: dict) -> dict:
    """Convert MongoDB document to serializable dict."""
    doc["id"] = str(doc.pop("_id", ""))
    return doc


@router.get("/", response_model=List[dict])
async def list_students(
    department: Optional[str] = None,
    semester: Optional[int] = None,
    risk_level: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    user: dict = Depends(allow_staff),
):
    """List students with optional filters."""
    db = get_database()
    query = {}
    if department:
        query["department"] = department
    if semester:
        query["semester"] = semester
    if risk_level:
        query["risk_level"] = risk_level
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"student_id": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
        ]

    cursor = db.students.find(query).skip(skip).limit(limit).sort("risk_score", -1)
    students = []
    async for doc in cursor:
        students.append(_serialize_student(doc))
    return students


@router.get("/count")
async def count_students(user: dict = Depends(allow_staff)):
    db = get_database()
    total = await db.students.count_documents({})
    high = await db.students.count_documents({"risk_level": "high"})
    medium = await db.students.count_documents({"risk_level": "medium"})
    low = await db.students.count_documents({"risk_level": "low"})
    return {"total": total, "high_risk": high, "medium_risk": medium, "on_track": low}


@router.get("/{student_id}")
async def get_student(student_id: str, user: dict = Depends(allow_all)):
    """Get a single student's full profile."""
    db = get_database()

    # Students can only view their own profile
    if user["role"] == "student":
        student_doc = await db.students.find_one({"student_id": student_id})
        linked_user = await db.users.find_one({"email": student_doc["email"] if student_doc else ""})
        if not linked_user or str(linked_user["_id"]) != user["user_id"]:
            raise HTTPException(status_code=403, detail="Students can only view their own profile")

    doc = await db.students.find_one({"student_id": student_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Student not found")

    # Fetch interventions for this student
    interventions = []
    async for iv in db.interventions.find({"student_id": student_id}).sort("created_at", -1).limit(10):
        iv["id"] = str(iv.pop("_id"))
        interventions.append(iv)

    result = _serialize_student(doc)
    result["interventions"] = interventions
    return result


@router.post("/", status_code=201)
async def create_student(student: StudentCreateRequest, user: dict = Depends(RoleChecker(["admin"]))):
    db = get_database()
    existing = await db.students.find_one({"student_id": student.student_id})
    if existing:
        raise HTTPException(status_code=400, detail="Student ID already exists")

    doc = student.model_dump()
    doc["risk_score"] = None
    doc["risk_level"] = None
    doc["top_signal"] = None
    doc["predicted_grade"] = None
    doc["shap_factors"] = None
    doc["last_prediction_at"] = None
    doc["created_at"] = datetime.now(timezone.utc)
    doc["updated_at"] = datetime.now(timezone.utc)

    await db.students.insert_one(doc)
    return {"message": "Student created", "student_id": student.student_id}


@router.patch("/{student_id}/metrics")
async def update_student_metrics(
    student_id: str,
    metrics_update: StudentUpdateMetrics,
    user: dict = Depends(RoleChecker(["admin", "teacher"])),
):
    db = get_database()
    update_data = {f"metrics.{k}": v for k, v in metrics_update.model_dump(exclude_none=True).items()}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_data["updated_at"] = datetime.now(timezone.utc)
    result = await db.students.update_one({"student_id": student_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"message": "Metrics updated"}
