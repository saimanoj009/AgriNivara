# 🌾 AgriNivara

### **AI-Powered Smart Agriculture Decision Support Platform**

> **Smarter Decisions. Healthier Crops. Better Farming. 🌱**

AgriNivara is an AI-powered smart agriculture platform designed to help farmers make **data-driven, explainable, and actionable farming decisions**.

It combines **Machine Learning, Computer Vision, soil analysis, weather intelligence, risk analysis, farm simulation, and farmer support** into a unified platform.

Instead of providing isolated agricultural information, AgriNivara translates farm data into **simple recommendations that farmers can understand and act upon.**

---

## 🌱 Why AgriNivara?

Farmers often need to make critical decisions based on changing conditions:

* Which crop is suitable for my soil?
* Is my crop at risk because of weather?
* Why are my plant leaves changing?
* Should I irrigate now?
* Are my soil nutrients suitable for this crop?
* What happens if rainfall or temperature changes?
* How can I get support when I face a farming problem?

AgriNivara brings these decision-support capabilities together in **one intelligent agricultural platform**.

---

# 🚀 Core Capabilities

### 🌾 Intelligent Crop Recommendation

AgriNivara analyzes:

* Nitrogen (N)
* Phosphorus (P)
* Potassium (K)
* Soil pH
* Temperature
* Humidity
* Rainfall

and recommends a suitable crop based on the trained machine-learning model.

**Goal:** Help farmers make better crop-selection decisions before cultivation.

---

### 🦠 AI Plant Disease Detection

Farmers can upload a plant-leaf image and receive an AI-based disease prediction.

**Pipeline:**

```text
Leaf Image
    ↓
Image Preprocessing
    ↓
Deep Learning Model
    ↓
Disease Classification
    ↓
Result + Agricultural Guidance
```

This enables early identification of potential plant-health problems.

---

### 💧 Smart Farm & Irrigation Decision Support

AgriNivara combines farm conditions and weather information to help farmers make better irrigation decisions.

The system considers factors such as:

* Crop conditions
* Temperature
* Rainfall
* Humidity
* Soil information
* Weather trends

The objective is to avoid unnecessary irrigation while supporting healthy crop growth.

---

### 🌦️ Weather Intelligence

AgriNivara integrates weather information to provide agricultural context rather than simply displaying raw weather data.

Farmers can use weather information while planning:

* Irrigation
* Crop management
* Spraying
* Field activities
* Risk mitigation

---

### ⚠️ Agricultural Risk Analysis

AgriNivara identifies potential risks associated with:

* Temperature
* Rainfall
* Soil conditions
* Crop conditions
* Weather changes

The platform converts these factors into understandable risk information and recommended actions.

---

### 🧪 Soil Analysis

Farmers can evaluate soil conditions using nutrient and pH information.

The system helps interpret:

* NPK levels
* Soil pH
* Crop suitability
* Potential soil-related risks

> AgriNivara is a decision-support platform and does not replace professional laboratory soil testing.

---

### 📊 Farm Analysis

Farmers can perform a broader analysis of their farming conditions.

The platform provides:

* Suitability assessment
* Risk indicators
* Explanations
* Recommended actions
* Farm-specific insights

This brings multiple agricultural factors together instead of evaluating them independently.

---

### 🔄 What-If Farm Simulation

Farmers can explore how changing farming conditions may affect recommendations.

For example:

```text
Current Conditions
       ↓
Change Rainfall / Temperature / Soil Inputs
       ↓
Run Simulation
       ↓
Compare Result
       ↓
Understand Possible Outcome
```

This allows farmers to explore scenarios before making decisions in the real world.

---

### 👨‍🌾 Farmer Support System

AgriNivara provides a dedicated farmer-support workflow including:

* Farmer authentication
* Farmer profile
* Alerts
* Help requests
* Administrative responses
* Agricultural assistance

The goal is to connect intelligent decision support with practical farmer assistance.

---

# 🤖 AI & Machine Learning

## 🌾 Crop Recommendation Model

**Algorithm:** Random Forest Classifier

### Input Features

```text
N
P
K
Temperature
Humidity
pH
Rainfall
```

### Model

```text
crop_recommendation_model.joblib
```

The trained model predicts a suitable crop based on the supplied agricultural conditions.

---

## 🦠 Plant Disease Model

**Technology:** TensorFlow / Keras Deep Learning

### Input

```text
Plant Leaf Image
```

### Model

```text
plant_disease_model.keras
```

The model performs image-based plant disease classification.

---

# 🧠 Decision-Support Architecture

```text
                         ┌─────────────────────┐
                         │      FARMER         │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   AGRINIVARA UI     │
                         │ React + Vite        │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
              Soil & Farm      Plant Image      Weather Data
                 Data             Data              │
                    │               │               │
                    ▼               ▼               ▼
              ┌──────────┐   ┌────────────┐   ┌─────────────┐
              │ Crop ML  │   │ Disease AI │   │ Weather     │
              │ Model    │   │ Model      │   │ Intelligence│
              └────┬─────┘   └─────┬──────┘   └──────┬──────┘
                   │               │                  │
                   └───────────────┼──────────────────┘
                                   ▼
                         ┌─────────────────────┐
                         │  FARM ANALYSIS &    │
                         │  RISK ENGINE         │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ ACTIONABLE FARM     │
                         │ RECOMMENDATIONS     │
                         └─────────────────────┘
```

---

# 🏗️ System Architecture

```text
┌───────────────────────────────────────────────┐
│                 FRONTEND                      │
│                                               │
│ React + Vite                                  │
│ Farmer Dashboard                              │
│ Crop Recommendation                           │
│ Plant Diagnostics                             │
│ Weather Intelligence                          │
│ Soil Analysis                                 │
│ Farm Analysis                                 │
│ What-If Simulation                            │
│ Farmer Support                                │
└───────────────────────┬───────────────────────┘
                        │
                        │ REST API
                        ▼
┌───────────────────────────────────────────────┐
│                  BACKEND                      │
│                                               │
│ Python + FastAPI                              │
│ Authentication                                │
│ AI Inference                                  │
│ Farm Analysis                                 │
│ Risk Analysis                                 │
│ What-If Engine                                │
│ Farmer Support APIs                           │
└───────────────┬───────────────┬───────────────┘
                │               │
                ▼               ▼
       ┌───────────────┐ ┌──────────────────┐
       │ ML / AI Models│ │ External APIs    │
       │               │ │                  │
       │ Random Forest │ │ Open-Meteo       │
       │ TensorFlow    │ │ OpenStreetMap    │
       │ Keras         │ │                  │
       └───────────────┘ └──────────────────┘
                │
                ▼
       ┌──────────────────┐
       │ SQLite Database  │
       └──────────────────┘
```

---

# ✨ Platform Experience

AgriNivara is designed around a **farmer-first experience**.

### Farmer Workflow

```text
Login
  ↓
Farmer Dashboard
  ↓
Enter Farm / Soil Information
  ↓
Crop Recommendation
  ↓
Analyze Weather & Risks
  ↓
Upload Leaf Image
  ↓
Disease Detection
  ↓
Farm Analysis
  ↓
Explore What-If Scenarios
  ↓
Receive Actionable Insights
```

The platform aims to make complex agricultural analysis easier to understand through a clean and accessible interface.

---

# 🔌 API Endpoints

## System

```http
GET /health
```

## Agriculture & AI

```http
POST /predict-crop
POST /predict-disease
POST /farm-analysis
POST /what-if
```

## Authentication

```http
POST /auth/signup
POST /auth/login
GET  /auth/me
```

## Farmer Support

```http
GET  /alerts
GET  /farmer/help
POST /farmer/help
```

## Administration

```http
GET   /admin/stats
GET   /admin/farmers
PATCH /admin/help/{id}
```

---

# 🛠️ Technology Stack

| Layer             | Technology              |
| ----------------- | ----------------------- |
| Frontend          | React, Vite, JavaScript |
| Backend           | Python, FastAPI         |
| Machine Learning  | Scikit-learn            |
| Deep Learning     | TensorFlow, Keras       |
| Database          | SQLite                  |
| Weather Data      | Open-Meteo              |
| Location Data     | OpenStreetMap           |
| API Communication | REST APIs               |
| Containerization  | Docker                  |
| Deployment        | Railway                 |
| Version Control   | Git & GitHub            |

---

# 📁 Project Structure

```text
AgriNivara/
│
├── backend/
│   ├── app/
│   │   └── main.py
│   │
│   └── model/
│       ├── crop_recommendation_model.joblib
│       └── plant_disease_model.keras
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── MODEL_SETUP.md
├── requirements.txt
├── Dockerfile
├── README.md
└── .gitignore
```

---

# 🚀 Run AgriNivara Locally

## 1. Clone the Repository

```bash
git clone <repository-url>
cd AgriNivara
```

## 2. Create a Virtual Environment

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

## 3. Install Backend Dependencies

```bash
pip install -r requirements.txt
```

## 4. Start the Backend

```bash
uvicorn main:app --reload
```

The API will be available at:

```text
http://localhost:8000
```

Interactive API documentation:

```text
http://localhost:8000/docs
```

## 5. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# ☁️ Deployment

AgriNivara is containerized using Docker and deployed using Railway.

### Deployment Architecture

```text
GitHub Repository
       │
       ▼
     Docker
       │
       ▼
    Railway
       │
       ├── FastAPI Backend
       └── React Frontend
```

The production application can be accessed through the deployed Railway URL.

---

# 🎯 Project Objective

The objective of AgriNivara is to transform multiple agricultural data sources into **simple, explainable, and actionable decision support**.

Instead of forcing farmers to interpret raw:

* Soil values
* Weather information
* Crop conditions
* Disease predictions
* Risk indicators

AgriNivara brings these inputs together and presents them as understandable farming insights.

---

# 🌍 Expected Impact

AgriNivara is designed to support farmers in making better-informed decisions related to:

🌱 **Crop Selection**

🧪 **Soil Management**

💧 **Irrigation Planning**

🌦️ **Weather-Aware Farming**

🦠 **Early Plant Disease Identification**

⚠️ **Agricultural Risk Awareness**

📊 **Farm Decision Analysis**

🔄 **Scenario-Based Planning**

👨‍🌾 **Farmer Support**

The larger vision is to make agricultural decision-support technology **accessible, understandable, and practical for farmers.**

---

# 🔐 Responsible AI

AgriNivara is designed as a **decision-support system**, not a replacement for qualified agricultural professionals.

AI predictions should be considered alongside:

* Local agricultural conditions
* Farmer experience
* Soil laboratory results
* Agricultural officers / experts
* Crop-specific recommendations

For disease diagnosis and treatment decisions, professional agricultural guidance should be consulted when required.

---

# 📌 Current Project Status

| Component               | Status        |
| ----------------------- | ------------- |
| Crop Recommendation     | ✅ Implemented |
| Plant Disease Detection | ✅ Implemented |
| Weather Analysis        | ✅ Implemented |
| Soil Analysis           | ✅ Implemented |
| Risk Analysis           | ✅ Implemented |
| Farm Analysis           | ✅ Implemented |
| What-If Simulation      | ✅ Implemented |
| Farmer Authentication   | ✅ Implemented |
| Alerts                  | ✅ Implemented |
| Farmer Help System      | ✅ Implemented |
| Admin Dashboard         | ✅ Implemented |
| Docker Deployment       | ✅ Implemented |
| Railway Deployment      | ✅ Live        |

---

# 🏆 Why AgriNivara?

AgriNivara is not just a crop recommendation model or a disease detection application.

It brings multiple agricultural decision-support capabilities together into a **single platform**:

```text
             ┌─────────────────────┐
             │      AgriNivara     │
             └──────────┬──────────┘
                        │
       ┌────────────────┼────────────────┐
       │                │                │
       ▼                ▼                ▼
   Crop AI          Plant AI        Weather
       │                │                │
       └────────────────┼────────────────┘
                        │
                        ▼
                  Risk Analysis
                        │
                        ▼
                  Farm Analysis
                        │
                        ▼
                 What-If Planning
                        │
                        ▼
              Actionable Decisions
```

The focus is simple:

> **Convert agricultural data into decisions that farmers can understand and act upon.**

---

# 🌾 Vision

Our vision is to build a future where farmers can access intelligent agricultural decision support without needing to understand complex machine-learning models or raw datasets.

### **From Data → Intelligence → Action.**

**AgriNivara — Smarter Decisions. Healthier Crops. Better Farming. 🌱**

---

## 📄 License

This project is developed for educational, innovation, and agricultural technology purposes.

---

## 👥 Team

**AgriNivara Development Team**

Built with ❤️ for smarter and more sustainable agriculture.
