"""Application configuration settings."""

import os

# MongoDB
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "student_performance_db")

# JWT
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-change-in-production-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# ML Model
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "trained_model")

# CORS
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
