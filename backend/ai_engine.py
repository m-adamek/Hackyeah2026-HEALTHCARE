import random
import numpy as np
import pandas as pd
from typing import List, Dict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.ensemble import RandomForestClassifier

class AIEngine:
    def __init__(self, exercise_db: Dict):
        self.exercise_db = exercise_db
        self.exercise_ids = list(exercise_db.keys())
        
        # Prepare text corpus for ML-based recommendation (TF-IDF + Cosine Similarity)
        self.corpus = []
        for ex_id in self.exercise_ids:
            ex = exercise_db[ex_id]
            # Combine name, primary muscle, and tags into a searchable document
            name = ex.get("name", "")
            primary = ex.get("primary", "")
            tags = " ".join(ex.get("tags", []))
            doc = f"{name} {primary} {tags}".lower()
            self.corpus.append(doc)
            
        self.vectorizer = TfidfVectorizer()
        if self.corpus:
            self.tfidf_matrix = self.vectorizer.fit_transform(self.corpus)
            
        # Prepare a basic ML model for Insights/Overtraining risk prediction
        self._train_insights_model()

    def _train_insights_model(self):
        """Trains a basic RandomForest model for predicting overtraining risk."""
        # Dummy data for training the risk model: [sleep_hours, fatigue_level, symptom_intensity_sum]
        # Labels: 0 (LOW), 1 (MEDIUM), 2 (HIGH)
        X_train = np.array([
            [8.0, 2, 0], [7.5, 3, 0], [9.0, 1, 0],  # Low risk
            [6.0, 6, 4], [5.5, 7, 5], [6.5, 5, 2],  # Medium risk
            [4.0, 9, 15], [5.0, 8, 12], [3.5, 10, 20] # High risk
        ])
        y_train = np.array([0, 0, 0, 1, 1, 1, 2, 2, 2])
        
        self.risk_classifier = RandomForestClassifier(n_estimators=10, random_state=42)
        self.risk_classifier.fit(X_train, y_train)
        
    def generate_workout_plan(self, prompt: str, tags: List[str]) -> Dict:
        """
        ML-based plan generator.
        Uses TF-IDF and Cosine Similarity to find exercises matching the prompt.
        """
        if not self.corpus:
            return self._fallback_plan(prompt, tags)
            
        # Vectorize user prompt
        prompt_vec = self.vectorizer.transform([prompt.lower()])
        
        # Calculate similarity between prompt and all exercises
        similarities = cosine_similarity(prompt_vec, self.tfidf_matrix).flatten()
        
        # Get top matching indices
        top_indices = similarities.argsort()[::-1]
        
        selected_ex = []
        for idx in top_indices:
            ex_id = self.exercise_ids[idx]
            ex_data = self.exercise_db[ex_id]
            
            # Optional tag filtering
            if tags:
                if any(t in ex_data.get("tags", []) for t in tags):
                    selected_ex.append(ex_id)
            else:
                selected_ex.append(ex_id)
                
            if len(selected_ex) >= 5: # max 5 exercises
                break
                
        if len(selected_ex) < 3:
            # Fallback if too strict
            selected_ex = self.exercise_ids[:4]
            
        duration = f"{len(selected_ex) * 10} min"
        
        return {
            "title": f"AI Plan: {prompt[:15]}...",
            "description": f"Generated based on prompt using TF-IDF NLP model.",
            "duration": duration,
            "tags": tags + ["AI Gen", "ML Matched"],
            "exercises": selected_ex
        }
        
    def _fallback_plan(self, prompt: str, tags: List[str]) -> Dict:
        # Simple fallback
        selected = self.exercise_ids[:4]
        return {
            "title": "Basic AI Plan",
            "description": "Generated via basic fallback.",
            "duration": "40 min",
            "tags": tags,
            "exercises": selected
        }

    def analyze_posture(self, exercise_id: str) -> Dict:
        """
        Mock for Computer Vision pipeline.
        In a real scenario, we would use OpenCV / MediaPipe / YOLO here.
        """
        # Placeholder for CV-based posture analysis
        score = random.randint(75, 95)
        return {
            "score": score,
            "feedback": {"issue": "Mock vision output", "fix": "N/A", "severity": "low"},
            "joint_angles": {
                "hip": random.randint(70, 110),
                "knee": random.randint(80, 120)
            },
            "status": "CV model requires image input."
        }
        
    def generate_insights(self, history: List[Dict], symptoms: List[Dict]) -> Dict:
        """
        Predictive analytics using a trained RandomForest model.
        """
        # Calculate current features
        # 1. sleep_hours, 2. fatigue_level, 3. symptom_intensity_sum
        avg_sleep = 7.0
        avg_fatigue = 5.0
        
        # Check history object type, sometimes it's a dict, sometimes list
        wellbeing_data = []
        if isinstance(history, dict) and "wellbeing" in history:
            wellbeing_data = history["wellbeing"][-3:]
        elif isinstance(history, list):
            wellbeing_data = history[-3:]
            
        if wellbeing_data:
            # Safely get sleep/fatigue values
            sleeps = [w.get("sleep", 7.0) for w in wellbeing_data if isinstance(w, dict)]
            fatigues = [w.get("fatigue", 5.0) for w in wellbeing_data if isinstance(w, dict)]
            if sleeps: avg_sleep = sum(sleeps) / len(sleeps)
            if fatigues: avg_fatigue = sum(fatigues) / len(fatigues)
                
        symptom_intensity_sum = sum(s.get("intensity", 0) for s in symptoms[-3:] if isinstance(s, dict))
        
        features = np.array([[avg_sleep, avg_fatigue, symptom_intensity_sum]])
        
        # Predict risk using ML model
        risk_pred = self.risk_classifier.predict(features)[0]
        
        risk_map = {0: "LOW", 1: "MEDIUM", 2: "HIGH"}
        risk_level = risk_map.get(risk_pred, "UNKNOWN")
        
        if risk_level == "HIGH":
            recommendation = "High fatigue detected by ML model. Consider a deload week."
        elif risk_level == "MEDIUM":
            recommendation = "Moderate risk. Monitor your sleep and recovery."
        else:
            recommendation = "Recovery is optimal. Keep pushing the intensity."
            
        return {
            "overtraining_risk": risk_level,
            "recommendation": recommendation,
            "volume_status": "Optimal" if risk_level != "HIGH" else "Too High",
            "model_features_used": {
                "avg_sleep": round(avg_sleep, 2),
                "avg_fatigue": round(avg_fatigue, 2),
                "symptom_intensity_sum": symptom_intensity_sum
            }
        }
