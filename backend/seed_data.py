"""
Seed script — populates the database with realistic demo data.
Run this after starting MongoDB to have a working demo.

Usage:
    python seed_data.py
"""

import asyncio
import random
import numpy as np
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "student_performance_db"

# --- Demo Users ---
USERS = [
    {"email": "admin@university.edu", "name": "Dr. Admin", "role": "admin", "password": "admin123"},
    {"email": "teacher@university.edu", "name": "Prof. Rajesh Kumar", "role": "teacher", "password": "teacher123"},
    {"email": "counsellor@university.edu", "name": "Ms. Neha Gupta", "role": "counsellor", "password": "counsellor123"},
    {"email": "priya.sharma@student.edu", "name": "Priya Sharma", "role": "student", "password": "student123"},
    {"email": "rahul.verma@student.edu", "name": "Rahul Verma", "role": "student", "password": "student123"},
]

# --- Student Names ---
FIRST_NAMES = [
    "Priya", "Rahul", "Ananya", "Karan", "Sneha", "Arjun", "Meera", "Vikram",
    "Pooja", "Rohan", "Divya", "Aditya", "Neha", "Siddharth", "Riya", "Amit",
    "Kavya", "Rajesh", "Deepika", "Nikhil", "Ishita", "Varun", "Shruti", "Akash",
    "Nandini", "Harsh", "Pallavi", "Dhruv", "Anjali", "Manish", "Tanya", "Saurabh",
    "Ritika", "Gaurav", "Swati", "Kunal", "Bhavna", "Pankaj", "Sonal", "Tushar",
    "Megha", "Ashish", "Komal", "Suresh", "Jyoti", "Aarav", "Tanvi", "Mohit",
    "Sakshi", "Yash", "Navya", "Pranav", "Simran", "Vivek", "Aarti", "Mayank",
    "Kiara", "Abhinav", "Preeti", "Rohit", "Madhuri", "Sameer", "Chitra", "Dev",
]

LAST_NAMES = [
    "Sharma", "Verma", "Iyer", "Mehta", "Patel", "Gupta", "Singh", "Reddy",
    "Kumar", "Nair", "Joshi", "Agarwal", "Chopra", "Bhat", "Desai", "Rao",
    "Malhotra", "Khanna", "Banerjee", "Mishra", "Saxena", "Kapoor", "Tiwari", "Pandey",
]

DEPARTMENTS = ["Computer Science", "Electronics", "Mechanical", "Civil", "Mathematics", "Physics"]
SECTIONS = ["A", "B", "C"]


def generate_student_data(idx: int) -> dict:
    """Generate a single realistic student record."""
    first = random.choice(FIRST_NAMES)
    last = random.choice(LAST_NAMES)
    name = f"{first} {last}"
    dept = random.choice(DEPARTMENTS)
    semester = random.randint(1, 8)
    section = random.choice(SECTIONS)

    # Generate correlated metrics (students who miss classes tend to do worse)
    base_quality = random.gauss(0.6, 0.25)  # 0=poor student, 1=excellent
    base_quality = max(0.05, min(0.98, base_quality))

    attendance = max(20, min(100, base_quality * 100 + random.gauss(0, 10)))
    assignment = max(10, min(100, base_quality * 95 + random.gauss(0, 12)))
    quiz = max(15, min(100, base_quality * 90 + random.gauss(0, 10)))
    midterm = max(10, min(100, base_quality * 85 + random.gauss(0, 15)))
    lms = max(0.5, min(25, base_quality * 15 + random.gauss(0, 3)))
    missed_classes = max(0, int(7 - base_quality * 8 + random.gauss(0, 1.5)))
    missed_assignments = max(0, int(5 - base_quality * 6 + random.gauss(0, 1)))
    study_hours = max(1, min(35, base_quality * 20 + random.gauss(0, 3)))
    prev_gpa = max(0.5, min(4.0, base_quality * 3.8 + random.gauss(0, 0.3)))

    return {
        "student_id": f"STU{2024000 + idx:07d}",
        "name": name,
        "email": f"{first.lower()}.{last.lower()}{idx}@student.edu",
        "department": dept,
        "semester": semester,
        "section": section,
        "metrics": {
            "attendance_pct": round(attendance, 1),
            "assignment_completion_pct": round(assignment, 1),
            "quiz_avg_score": round(quiz, 1),
            "midterm_score": round(midterm, 1),
            "lms_engagement_hours": round(lms, 1),
            "classes_missed_last_2_weeks": missed_classes,
            "assignments_missed": missed_assignments,
            "study_hours_per_week": round(study_hours, 1),
            "previous_gpa": round(prev_gpa, 2),
        },
        "risk_score": None,
        "risk_level": None,
        "top_signal": None,
        "predicted_grade": None,
        "shap_factors": None,
        "last_prediction_at": None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }


async def seed():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]

    # Drop existing collections
    await db.users.drop()
    await db.students.drop()
    await db.interventions.drop()
    print("🗑️  Cleared existing data")

    # Seed users
    for u in USERS:
        await db.users.insert_one({
            "email": u["email"],
            "name": u["name"],
            "role": u["role"],
            "password_hash": get_password_hash(u["password"]),
        })
    print(f"👤 Created {len(USERS)} demo users")

    # Seed students (64 for one realistic class + extras across departments)
    students = []
    for i in range(80):
        students.append(generate_student_data(i))

    # Ensure our demo student accounts map to student records
    students[0]["name"] = "Priya Sharma"
    students[0]["email"] = "priya.sharma@student.edu"
    students[0]["department"] = "Computer Science"
    students[0]["semester"] = 5
    students[0]["metrics"]["attendance_pct"] = 54.0
    students[0]["metrics"]["assignment_completion_pct"] = 40.0
    students[0]["metrics"]["quiz_avg_score"] = 62.0
    students[0]["metrics"]["lms_engagement_hours"] = 7.8
    students[0]["metrics"]["classes_missed_last_2_weeks"] = 5
    students[0]["metrics"]["assignments_missed"] = 3

    students[1]["name"] = "Rahul Verma"
    students[1]["email"] = "rahul.verma@student.edu"
    students[1]["department"] = "Computer Science"
    students[1]["semester"] = 5
    students[1]["metrics"]["attendance_pct"] = 71.0
    students[1]["metrics"]["assignment_completion_pct"] = 55.0
    students[1]["metrics"]["quiz_avg_score"] = 58.0
    students[1]["metrics"]["classes_missed_last_2_weeks"] = 3
    students[1]["metrics"]["assignments_missed"] = 2

    await db.students.insert_many(students)
    print(f"🎓 Created {len(students)} student records")

    # Create indexes
    await db.students.create_index("student_id", unique=True)
    await db.students.create_index("email")
    await db.students.create_index("risk_level")
    await db.students.create_index("risk_score")
    await db.students.create_index("department")
    await db.users.create_index("email", unique=True)
    print("📇 Created database indexes")

    # Run ML predictions
    print("\n🤖 Running ML predictions on all students...")
    try:
        from app.ml.predict import predict_student
        for student in students:
            result = predict_student(student["metrics"])
            await db.students.update_one(
                {"student_id": student["student_id"]},
                {"$set": {
                    "risk_score": result["risk_score"],
                    "risk_level": result["risk_level"],
                    "predicted_grade": result["predicted_grade"],
                    "top_signal": result["top_signal"],
                    "shap_factors": result["shap_factors"],
                    "last_prediction_at": datetime.now(timezone.utc),
                }},
            )
        print("✅ ML predictions complete for all students")
    except FileNotFoundError:
        print("⚠️  Model not trained yet — run 'python -m app.ml.train' first, then re-run seed")

    # Seed some interventions
    high_risk_students = await db.students.find({"risk_level": "high"}).to_list(5)
    intervention_types = ["counselling", "extra_tutoring", "parent_contact", "deadline_extension", "mentorship"]
    intervention_notes = [
        "Scheduled one-on-one session to discuss academic concerns",
        "Enrolled in peer tutoring program for Data Structures",
        "Called parents to discuss attendance issues",
        "Granted 1-week extension on pending assignments",
        "Paired with senior mentor for study support",
    ]

    for i, student in enumerate(high_risk_students):
        await db.interventions.insert_one({
            "student_id": student["student_id"],
            "student_name": student["name"],
            "intervention_type": intervention_types[i % len(intervention_types)],
            "notes": intervention_notes[i % len(intervention_notes)],
            "status": random.choice(["pending", "in_progress"]),
            "created_by": "seeder",
            "created_by_name": "Prof. Rajesh Kumar",
            "assigned_to": None,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        })
    print(f"🔔 Created {len(high_risk_students)} demo interventions")

    print("\n🎉 Seed complete! Demo credentials:")
    print("   Admin:      admin@university.edu / admin123")
    print("   Teacher:    teacher@university.edu / teacher123")
    print("   Counsellor: counsellor@university.edu / counsellor123")
    print("   Student:    priya.sharma@student.edu / student123")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
