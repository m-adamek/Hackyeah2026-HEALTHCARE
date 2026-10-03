from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from backend.data import (
    UserProfile, History, TodayPlan, ExerciseDB, 
    WorkoutPlans, ProfileData, WorkoutHistory, DietData, AvailableTrainers, SymptomsList
)
import os
import uuid
from pydantic import BaseModel
from datetime import datetime

class SymptomCreate(BaseModel):
    location: str
    timing: str
    intensity: int

class WellbeingCreate(BaseModel):
    energy: int

class PlanGenerateRequest(BaseModel):
    prompt: str
    tags: list[str]

class DietCreate(BaseModel):
    name: str
    kcal: int

app = FastAPI(title="GymBud API")

# Setup CORS just in case
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Endpoints
@app.get("/api/profile")
def get_profile():
    return UserProfile

@app.get("/api/history")
def get_history():
    return History

@app.get("/api/today-plan")
def get_today_plan():
    return TodayPlan

@app.get("/api/exercises")
def get_exercises():
    return ExerciseDB

@app.get("/api/workout-plans")
def get_workout_plans():
    return WorkoutPlans

@app.get("/api/profile-data")
def get_profile_data():
    return ProfileData

@app.get("/api/workout-history")
def get_workout_history():
    return WorkoutHistory

@app.get("/api/diet")
def get_diet():
    return DietData

@app.get("/api/trainers")
def get_trainers():
    return AvailableTrainers

@app.get("/api/symptoms")
def get_symptoms():
    return SymptomsList

@app.post("/api/symptoms")
def add_symptom(symptom: SymptomCreate):
    new_symptom = {
        "id": f"s_{uuid.uuid4().hex[:8]}",
        "date": datetime.utcnow().isoformat() + "Z",
        "location": symptom.location,
        "timing": symptom.timing,
        "intensity": symptom.intensity
    }
    SymptomsList.append(new_symptom)
    return {"status": "success", "data": new_symptom}

@app.get("/api/doctor-report")
def get_doctor_report():
    # Simple backend aggregation logic
    workouts = History.get("workouts", [])
    completed_workouts = [w for w in workouts if w.get("completed")]
    total_workouts = len(completed_workouts)
    avg_duration = sum(w.get("duration", 0) for w in completed_workouts) // max(1, total_workouts)
    
    # Prepare symptoms list for the report
    recent_symptoms = SymptomsList[-5:] # get up to last 5
    
    return {
        "stats": {
            "totalWorkouts": total_workouts,
            "avgDuration": avg_duration,
            "recentLoadChange": f"{total_workouts} workouts analyzed via backend logic."
        },
        "symptoms": recent_symptoms,
        "recovery": {
            "avgSleep": "6h 45m (down from 7h 30m)",
            "wellbeing": "Increased fatigue upon waking."
        },
        "diet": {
            "avgKcal": 2850,
            "macros": "Protein: 35%, Fat: 25%, Carbs: 40%",
            "note": "Patient maintains a high protein intake, which correlates with their recent strength training phase."
        }
    }

@app.post("/api/wellbeing")
def add_wellbeing(data: WellbeingCreate):
    new_entry = {
        "date": datetime.utcnow().strftime("%Y-%m-%d"),
        "sleep": 7.0,
        "fatigue": max(1, 11 - data.energy),
        "energy": data.energy
    }
    History["wellbeing"].append(new_entry)
    return {"status": "success", "data": new_entry}

from backend.ai_engine import AIEngine
ai_engine = AIEngine(ExerciseDB)

@app.post("/api/generate-plan")
def generate_plan(req: PlanGenerateRequest):
    plan_data = ai_engine.generate_workout_plan(req.prompt, req.tags)
    
    new_plan = {
        "id": f"p_{uuid.uuid4().hex[:8]}",
        "name": plan_data["title"],
        "description": plan_data["description"],
        "exercises": [{"name": ExerciseDB[ex].get("name", ex), "sets": 3, "reps": "10"} for ex in plan_data["exercises"]]
    }
    WorkoutPlans.append(new_plan)
    return {"status": "success", "data": new_plan}

@app.get("/api/insights")
def get_ai_insights():
    insights = ai_engine.generate_insights(History, SymptomsList)
    return {"status": "success", "insights": insights}

@app.post("/api/analyze-posture")
def analyze_posture():
    # In reality, this would receive an image/video frame
    result = ai_engine.analyze_posture("ex_unknown")
    return {"status": "success", "analysis": result}

@app.post("/api/diet")
def add_diet(data: DietCreate):
    new_entry = {
        "id": f"d_{uuid.uuid4().hex[:8]}",
        "name": data.name,
        "time": datetime.utcnow().strftime("%H:%M"),
        "kcal": data.kcal
    }
    DietData["entries"].append(new_entry)
    return {"status": "success", "data": new_entry}

# Mount static files to serve the frontend
# Get the absolute path to the project root (one level up from backend)
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
app.mount("/", StaticFiles(directory=project_root, html=True), name="static")
