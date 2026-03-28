"""Intervention tracking models."""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class InterventionType(str, Enum):
    COUNSELLING = "counselling"
    PARENT_CONTACT = "parent_contact"
    EXTRA_TUTORING = "extra_tutoring"
    DEADLINE_EXTENSION = "deadline_extension"
    MENTORSHIP = "mentorship"
    OTHER = "other"


class InterventionStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class InterventionCreate(BaseModel):
    student_id: str
    intervention_type: InterventionType
    notes: str
    assigned_to: Optional[str] = None  # counsellor/teacher id


class InterventionResponse(BaseModel):
    id: str
    student_id: str
    student_name: str
    intervention_type: str
    notes: str
    status: str
    created_by: str
    created_by_name: str
    assigned_to: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class InterventionUpdate(BaseModel):
    status: Optional[InterventionStatus] = None
    notes: Optional[str] = None
