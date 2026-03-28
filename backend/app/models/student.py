"""Student data models."""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class StudentBase(BaseModel):
    student_id: str
    name: str
    email: str
    department: str
    semester: int
    section: Optional[str] = None


class StudentMetrics(BaseModel):
    attendance_pct: float           # 0-100
    assignment_completion_pct: float # 0-100
    quiz_avg_score: float           # 0-100
    midterm_score: Optional[float] = None  # 0-100
    lms_engagement_hours: float     # weekly hours
    classes_missed_last_2_weeks: int
    assignments_missed: int
    study_hours_per_week: float
    previous_gpa: float            # 0-4.0


class StudentRecord(StudentBase):
    metrics: StudentMetrics
    risk_score: Optional[float] = None        # 0-100
    risk_level: Optional[str] = None          # high / medium / low
    top_signal: Optional[str] = None          # ML explanation
    predicted_grade: Optional[str] = None
    shap_factors: Optional[List[dict]] = None # [{feature, value, impact}]
    last_prediction_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class StudentCreateRequest(StudentBase):
    metrics: StudentMetrics


class StudentUpdateMetrics(BaseModel):
    attendance_pct: Optional[float] = None
    assignment_completion_pct: Optional[float] = None
    quiz_avg_score: Optional[float] = None
    midterm_score: Optional[float] = None
    lms_engagement_hours: Optional[float] = None
    classes_missed_last_2_weeks: Optional[int] = None
    assignments_missed: Optional[int] = None
    study_hours_per_week: Optional[float] = None
    previous_gpa: Optional[float] = None
