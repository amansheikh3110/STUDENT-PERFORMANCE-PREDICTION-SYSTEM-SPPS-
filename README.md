# Student Performance Prediction System (SPPS)

The Student Performance Prediction System (SPPS) is an AI-powered EdTech web application designed to locally predict student outcomes and identify at-risk students before they fail. It leverages modern machine learning alongside a strict "Industrial Skeuomorphic" UX to provide educational administrators, teachers, and counsellors with precise, real-time data regarding student trajectories. Instead of standard analytical dashboards, SPPS operates like a "mission control" or "industrial systems monitor," ensuring a highly tactical and urgent user experience.

## Features

- **Industrial Skeuomorphic UI**: A tactical, hardware-inspired interface emphasizing urgency and data clarity, abandoning soft "glassmorphic" trends.
- **Predictive AI Model**: Uses XGBoost to classify the probability of a student failing based on attendance, scores, and LMS hours.
- **SHAP Integration**: Explains *why* the AI made its prediction, breaking down risk factors (e.g., missed assignments vs. low attendance).
- **Role-Based Access Control**:
  - **Admin**: Macro system overview with aggregated histograms and risk indices.
  - **Teacher**: Class-specific readouts and actionable rosters.
  - **Counsellor**: Intervention Kanban boards for managing at-risk subjects.
  - **Student**: Isolated view of personal performance telemetry and drift analysis.

## Tech Stack

- **Backend**: Python 3.13, FastAPI, MongoDB (Motor), Uvicorn, XGBoost, SHAP.
- **Frontend**: React 19 (TypeScript), Vite, Tailwind CSS v4, Recharts.

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- **Node.js & npm**: Recommended to use the latest LTS.
- **Python 3.13+**: For the ML backend.
- **MongoDB**: Must be running locally at `mongodb://localhost:27017`.

### 1. Database Setup

Ensure your local MongoDB instance is running before starting the application. It will auto-create the necessary databases.

### 2. Backend Setup

Open a new terminal and navigate to the `backend` directory:
```bash
cd backend
```

Create a virtual environment:
```bash
python -m venv venv
```

Activate the virtual environment:
- **Windows**: `.\venv\Scripts\activate`
- **Mac/Linux**: `source venv/bin/activate`

Install dependencies:
```bash
pip install -r requirements.txt
```

*(Optional)* Seed the database with test data:
```bash
python seed_data.py
```

Run the backend development server:
```bash
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`.

### 3. Frontend Setup

Open *another* new terminal and navigate to the `frontend` directory:
```bash
cd frontend
```

Install the dependencies:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`.

---

## ☁️ Git Deployment Guide

If you are ready to push this to GitHub, run the following commands in the root directory of the project:

```bash
# Initialize the repository (if not already done)
git init

# Stage all files (the .gitignore prevents large files/node_modules from being added)
git add .

# Commit the changes
git commit -m "Initial commit: SPPS core infrastructure"

# Add your remote repository (replace URL with your actual GitHub repo)
git remote add origin https://github.com/your-username/your-repo-name.git

# Push to the main branch
git push -u origin main
```
