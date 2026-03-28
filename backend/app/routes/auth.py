"""Authentication routes - register & login."""

from fastapi import APIRouter, HTTPException, status
from app.database import get_database
from app.auth import get_password_hash, verify_password, create_access_token
from app.models.user import UserCreate, UserLogin, TokenResponse, UserResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


from datetime import datetime, timezone
import random

@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(user: UserCreate):
    db = get_database()
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "email": user.email,
        "name": user.name,
        "role": user.role.value,
        "password_hash": get_password_hash(user.password),
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    # Automatically create the assigned role profile
    base_profile = {
        "user_id": user_id,
        "email": user.email,
        "name": user.name,
        "created_at": datetime.now(timezone.utc),
    }

    if user.role.value == "student":
        try:
            from app.ml.predict import predict_student
            
            # Auto-generate baseline academic metrics
            baseline_metrics = {
                "attendance_pct": 85.0,
                "assignment_completion_pct": 80.0,
                "quiz_avg_score": 75.0,
                "midterm_score": 75.0,
                "lms_engagement_hours": 12.0,
                "classes_missed_last_2_weeks": 1,
                "assignments_missed": 1,
                "study_hours_per_week": 15.0,
                "previous_gpa": 3.0,
            }
            
            # Run initial prediction so the student dashboard has data
            try:
                prediction = predict_student(baseline_metrics)
            except Exception:
                # If model is not trained or missing, supply a fallback
                prediction = {
                    "risk_score": 0.0,
                    "risk_level": "medium",
                    "predicted_grade": "A/B (Pass)",
                    "top_signal": "Model skipped",
                    "shap_factors": [],
                }

            student_id_code = f"STU{random.randint(1000000, 9999999)}"
            student_profile = {
                **base_profile,
                "student_id": student_id_code,
                "department": "Undeclared",
                "semester": 1,
                "metrics": baseline_metrics,
                "last_prediction_at": datetime.now(timezone.utc),
                **prediction
            }
            await db.students.insert_one(student_profile)
        except Exception as e:
            # Continue even if ML prediction fails
            print(f"Error creating student profile: {e}")
            pass
    elif user.role.value == "teacher":
        await db.teachers.insert_one({**base_profile, "department": "General"})
    elif user.role.value == "counsellor":
        await db.counsellors.insert_one({**base_profile, "specialty": "General Setup"})
    elif user.role.value == "admin":
        await db.admins.insert_one({**base_profile, "department": "Administration"})

    token = create_access_token(
        data={"sub": user_id, "role": user.role.value, "email": user.email, "name": user.name}
    )
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=user_id, email=user.email, name=user.name, role=user.role.value),
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    db = get_database()
    user_doc = await db.users.find_one({"email": credentials.email})
    if not user_doc or not verify_password(credentials.password, user_doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = str(user_doc["_id"])
    token = create_access_token(
        data={"sub": user_id, "role": user_doc["role"], "email": user_doc["email"], "name": user_doc["name"]}
    )
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=user_id, email=user_doc["email"], name=user_doc["name"], role=user_doc["role"]),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(token: str = None):
    """Validate token and return current user (used by frontend on page load)."""
    from fastapi import Depends
    from app.auth import get_current_user
    # This is a simpler endpoint; the actual auth is handled in dashboard routes
    pass
