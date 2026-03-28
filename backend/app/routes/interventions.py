"""Intervention tracking routes."""

from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime, timezone
from bson import ObjectId

from app.database import get_database
from app.auth import get_current_user, RoleChecker
from app.models.intervention import InterventionCreate, InterventionResponse, InterventionUpdate

router = APIRouter(prefix="/api/interventions", tags=["Interventions"])

allow_staff = RoleChecker(["admin", "teacher", "counsellor"])


@router.post("/", status_code=201)
async def create_intervention(intervention: InterventionCreate, user: dict = Depends(allow_staff)):
    db = get_database()

    # Verify student exists
    student = await db.students.find_one({"student_id": intervention.student_id})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    doc = {
        "student_id": intervention.student_id,
        "student_name": student["name"],
        "intervention_type": intervention.intervention_type.value,
        "notes": intervention.notes,
        "status": "pending",
        "created_by": user["user_id"],
        "created_by_name": user["name"],
        "assigned_to": intervention.assigned_to,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    result = await db.interventions.insert_one(doc)
    return {"message": "Intervention created", "id": str(result.inserted_id)}


@router.get("/", response_model=List[dict])
async def list_interventions(student_id: str = None, user: dict = Depends(allow_staff)):
    db = get_database()
    query = {}
    if student_id:
        query["student_id"] = student_id

    interventions = []
    async for doc in db.interventions.find(query).sort("created_at", -1).limit(100):
        doc["id"] = str(doc.pop("_id"))
        interventions.append(doc)
    return interventions


@router.patch("/{intervention_id}")
async def update_intervention(intervention_id: str, update: InterventionUpdate, user: dict = Depends(allow_staff)):
    db = get_database()
    update_data = update.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_data["updated_at"] = datetime.now(timezone.utc)
    result = await db.interventions.update_one(
        {"_id": ObjectId(intervention_id)}, {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Intervention not found")
    return {"message": "Intervention updated"}
