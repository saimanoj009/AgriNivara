🌾 AgriNivara

AI-Powered Smart Agriculture Decision Support System

AgriNivara is an AI-powered agriculture platform that helps farmers make better decisions using Machine Learning, Computer Vision, soil analysis, and weather data.

🚀 Key Features
🌱 Crop Recommendation – Recommends suitable crops based on N, P, K, pH, temperature, humidity, and rainfall.
🦠 Crop Disease Detection – Detects plant diseases from uploaded leaf images using a deep learning model.
🌦️ Weather Analysis – Uses weather data to support better farming decisions.
🧪 Soil Analysis – Evaluates soil nutrients and pH suitability.
⚠️ Risk Analysis – Identifies temperature, rainfall, and soil-related risks.
📊 Farm Analysis – Provides suitability scores, explanations, and action plans.
🔄 What-If Simulation – Shows how changes in farming conditions can affect crop recommendations.
👨‍🌾 Farmer Support – Includes authentication, alerts, and help requests.
🛠️ Tech Stack

Frontend: React, Vite, JavaScript
Backend: Python, FastAPI
Machine Learning: Scikit-learn, TensorFlow, Keras
Database: SQLite
APIs: Open-Meteo, OpenStreetMap
Deployment: Railway

🤖 AI Models
Crop Recommendation
Random Forest Classifier
Input: N, P, K, temperature, humidity, pH, rainfall
Model: crop_recommendation_model.joblib
Plant Disease Detection
Deep Learning / TensorFlow Keras
Input: Plant leaf image
Model: plant_disease_model.keras
📁 Project Structure
AgriNivara/
├── backend/
│   ├── main.py
│   └── model/
│       ├── crop_recommendation_model.joblib
│       └── plant_disease_model.keras
├── frontend/
├── requirements.txt
├── Dockerfile
└── README.md
▶️ Run Locally
git clone <repository-url>
cd AgriNivara


python -m venv venv
venv\Scripts\activate


pip install -r requirements.txt


uvicorn main:app --reload

API documentation:

http://localhost:8000/docs
🔌 Main API Endpoints
GET  /health
POST /predict-crop
POST /predict-disease
POST /farm-analysis
POST /what-if


POST /auth/signup
POST /auth/login
GET  /auth/me
🎯 Objective

The main objective of AgriNivara is to transform agricultural data into simple, explainable, and actionable recommendations, helping farmers improve crop selection, identify diseases early, and manage farming risks.

⚠️ Disclaimer

AgriNivara provides AI-based decision support and should not replace professional agricultural advice or laboratory soil testing.

AgriNivara — Smarter Decisions. Healthier Crops. Better Farming. 🌱
