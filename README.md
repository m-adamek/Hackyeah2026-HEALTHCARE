# 🏋️‍♂️ GymBud - AI-Powered Training Companion

**GymBud** is an intelligent, AI-driven fitness and health tracking application built for the **HackYeah 2026 - Healthcare** category. It goes beyond simple rep counting by offering deep insights into readiness, recovery, biomechanics, and nutrition.

## 🌟 Key Features

* **AI-Powered Insights**: Uses Machine Learning (Scikit-learn) to detect training plateaus, correlate diet/macros with performance, and predict overtraining risks.
* **Smart Dashboard**: Instantly view your daily Readiness score, Recovery status, Calories, and Macros.
* **Knowledge Hub & Expert Plans**: Searchable exercise database, curated beginner workout templates, and educational articles on diet and equipment.
* **Camera Technique Feedback**: (Mock/UI) Real-time camera feedback that analyzes your form (e.g., knee stability during squats) and offers corrections.
* **Doctor Health Report**: Tracks sleep, wellbeing, and symptoms (Symptom Tracker) to generate a comprehensive PDF-ready report for medical professionals.
* **Dual Roles (User & Trainer)**: Built-in toggle for trainers to manage and communicate with their clients.
* **Wearable Integration**: Designed to seamlessly connect with Apple Health, Google Fit, and smartwatches (Garmin, Whoop, Oura).

## 🛠️ Tech Stack

* **Frontend**: Vanilla JavaScript (Single Page Application), HTML5, CSS3, Phosphor Icons.
* **Backend**: Python 3, FastAPI, Uvicorn.
* **Machine Learning**: `scikit-learn`, `pandas`, `numpy` (used for TF-IDF contextual recommendations and Random Forest fatigue/plateau classification).

## 📂 Project Structure

```text
HACKYEAH/
├── backend/
│   ├── main.py          # FastAPI application & endpoints
│   └── ai_engine.py     # Scikit-learn ML models & insight generation
├── css/
│   └── style.css        # UI styles, animations, and transitions
├── js/
│   ├── app.js           # Main SPA router and view rendering
│   ├── mockData.js      # Realistic simulated data for history, diet, and exercises
│   └── analyticsEngine.js # Client-side logic for parsing health metrics
├── index.html           # Entry point
└── requirements.txt     # Python dependencies
```

## 🚀 How to Run Locally

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the backend server**:
   The frontend is served as static files directly through the FastAPI app.
   ```bash
   uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
   ```

3. **Open the app**:
   Navigate to `http://localhost:8000` in your web browser.

## 🤝 Hackathon Note
This project was developed rapidly during HackYeah 2026. It features a complete, responsive mobile-first UI using Vanilla JS and a functioning Python backend that demonstrates practical ML capabilities in a healthcare/fitness context.