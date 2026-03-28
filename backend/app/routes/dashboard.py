"""Dashboard aggregate routes for all roles."""

from fastapi import APIRouter, Depends
from app.database import get_database
from app.auth import get_current_user, RoleChecker

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/admin")
async def admin_dashboard(user: dict = Depends(RoleChecker(["admin"]))):
    """Institutional overview - total students, risk distribution, department breakdown."""
    db = get_database()

    total = await db.students.count_documents({})
    high = await db.students.count_documents({"risk_level": "high"})
    medium = await db.students.count_documents({"risk_level": "medium"})
    low = await db.students.count_documents({"risk_level": "low"})
    total_interventions = await db.interventions.count_documents({})
    pending_interventions = await db.interventions.count_documents({"status": "pending"})

    # Department-wise aggregation
    pipeline = [
        {"$group": {
            "_id": "$department",
            "count": {"$sum": 1},
            "avg_risk": {"$avg": "$risk_score"},
            "high_risk": {"$sum": {"$cond": [{"$eq": ["$risk_level", "high"]}, 1, 0]}},
        }},
        {"$sort": {"avg_risk": -1}},
    ]
    dept_stats = []
    async for doc in db.students.aggregate(pipeline):
        dept_stats.append({"department": doc["_id"], "count": doc["count"],
                           "avg_risk": round(doc["avg_risk"] or 0, 1), "high_risk": doc["high_risk"]})

    # Risk score distribution (buckets)
    risk_distribution = [
        {"range": "0-20", "count": await db.students.count_documents({"risk_score": {"$gte": 0, "$lt": 20}})},
        {"range": "20-40", "count": await db.students.count_documents({"risk_score": {"$gte": 20, "$lt": 40}})},
        {"range": "40-60", "count": await db.students.count_documents({"risk_score": {"$gte": 40, "$lt": 60}})},
        {"range": "60-80", "count": await db.students.count_documents({"risk_score": {"$gte": 60, "$lt": 80}})},
        {"range": "80-100", "count": await db.students.count_documents({"risk_score": {"$gte": 80, "$lte": 100}})},
    ]

    return {
        "total_students": total,
        "high_risk": high,
        "medium_risk": medium,
        "on_track": low,
        "total_interventions": total_interventions,
        "pending_interventions": pending_interventions,
        "department_stats": dept_stats,
        "risk_distribution": risk_distribution,
    }


@router.get("/teacher")
async def teacher_dashboard(user: dict = Depends(RoleChecker(["teacher"]))):
    """Class-level overview for teachers."""
    db = get_database()

    total = await db.students.count_documents({})
    high = await db.students.count_documents({"risk_level": "high"})
    medium = await db.students.count_documents({"risk_level": "medium"})
    low = await db.students.count_documents({"risk_level": "low"})

    # Average metrics
    pipeline = [
        {"$group": {
            "_id": None,
            "avg_attendance": {"$avg": "$metrics.attendance_pct"},
            "avg_assignment": {"$avg": "$metrics.assignment_completion_pct"},
            "avg_quiz": {"$avg": "$metrics.quiz_avg_score"},
            "avg_risk": {"$avg": "$risk_score"},
        }}
    ]
    avg_stats = {}
    async for doc in db.students.aggregate(pipeline):
        avg_stats = {
            "avg_attendance": round(doc.get("avg_attendance") or 0, 1),
            "avg_assignment_completion": round(doc.get("avg_assignment") or 0, 1),
            "avg_quiz_score": round(doc.get("avg_quiz") or 0, 1),
            "avg_risk_score": round(doc.get("avg_risk") or 0, 1),
        }

    # Top at-risk students
    at_risk = []
    async for doc in db.students.find({"risk_level": "high"}).sort("risk_score", -1).limit(10):
        at_risk.append({
            "student_id": doc["student_id"],
            "name": doc["name"],
            "risk_score": doc.get("risk_score"),
            "risk_level": doc.get("risk_level"),
            "top_signal": doc.get("top_signal"),
            "attendance": doc["metrics"]["attendance_pct"],
            "avg_grade": doc["metrics"]["quiz_avg_score"],
        })

    return {
        "total_students": total,
        "high_risk": high,
        "medium_risk": medium,
        "on_track": low,
        "avg_stats": avg_stats,
        "at_risk_students": at_risk,
    }


@router.get("/student")
async def student_dashboard(user: dict = Depends(RoleChecker(["student"]))):
    """Personal view for the logged-in student."""
    db = get_database()

    # Find the student record linked to this user's email
    user_doc = await db.users.find_one({"email": user["email"]})
    if not user_doc:
        return {"error": "User not found"}

    student = await db.students.find_one({"email": user["email"]})
    if not student:
        return {"error": "No student record linked", "metrics": None}

    student["id"] = str(student.pop("_id"))

    # Recent interventions
    interventions = []
    async for iv in db.interventions.find({"student_id": student["student_id"]}).sort("created_at", -1).limit(5):
        iv["id"] = str(iv.pop("_id"))
        interventions.append(iv)

    student["interventions"] = interventions
    return student


@router.get("/counsellor")
async def counsellor_dashboard(user: dict = Depends(RoleChecker(["counsellor"]))):
    """Counsellor view - focused on interventions and high-risk students."""
    db = get_database()

    total_interventions = await db.interventions.count_documents({})
    pending = await db.interventions.count_documents({"status": "pending"})
    in_progress = await db.interventions.count_documents({"status": "in_progress"})
    completed = await db.interventions.count_documents({"status": "completed"})

    high_risk_count = await db.students.count_documents({"risk_level": "high"})

    # Recent interventions
    recent_interventions = []
    async for iv in db.interventions.find().sort("created_at", -1).limit(15):
        iv["id"] = str(iv.pop("_id"))
        recent_interventions.append(iv)

    # High risk students needing attention
    at_risk = []
    async for doc in db.students.find({"risk_level": "high"}).sort("risk_score", -1).limit(10):
        at_risk.append({
            "student_id": doc["student_id"],
            "name": doc["name"],
            "department": doc["department"],
            "risk_score": doc.get("risk_score"),
            "top_signal": doc.get("top_signal"),
        })

    return {
        "total_interventions": total_interventions,
        "pending": pending,
        "in_progress": in_progress,
        "completed": completed,
        "high_risk_count": high_risk_count,
        "recent_interventions": recent_interventions,
        "at_risk_students": at_risk,
    }
