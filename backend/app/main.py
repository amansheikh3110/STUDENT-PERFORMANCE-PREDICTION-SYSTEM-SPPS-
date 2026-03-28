"""FastAPI main application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import connect_to_mongo, close_mongo_connection
from app.config import FRONTEND_URL
from app.routes.auth import router as auth_router
from app.routes.students import router as students_router
from app.routes.dashboard import router as dashboard_router
from app.routes.predictions import router as predictions_router
from app.routes.interventions import router as interventions_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup & shutdown hooks."""
    await connect_to_mongo()
    yield
    await close_mongo_connection()


app = FastAPI(
    title="Student Performance Prediction System",
    description="AI-powered platform for predicting student academic risk using XGBoost & SHAP",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(students_router)
app.include_router(dashboard_router)
app.include_router(predictions_router)
app.include_router(interventions_router)


@app.get("/")
async def root():
    return {
        "name": "Student Performance Prediction System API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/api/health")
async def health():
    return {"status": "healthy"}
