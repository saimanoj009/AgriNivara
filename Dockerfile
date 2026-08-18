# ============================================================
# AgriNivara - Single Website Production Container
# React/Vite frontend + FastAPI backend + ML models
# ============================================================

# -------------------- FRONTEND BUILD --------------------
FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend ./
RUN npm run build


# -------------------- PYTHON RUNTIME --------------------
FROM python:3.11-slim AS runtime

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=7860

# -------------------- PYTHON DEPENDENCIES --------------------
COPY backend/requirements.txt ./backend/requirements.txt

RUN pip install --no-cache-dir -r backend/requirements.txt


# -------------------- BACKEND + MODELS --------------------
COPY backend ./backend


# IMPORTANT:
# Verify that both trained models actually exist
# inside the Docker image during the build.
RUN echo "============================================" && \
    echo "Checking AgriNivara model files..." && \
    echo "============================================" && \
    ls -lh ./backend/model && \
    test -f ./backend/model/crop_recommendation_model.joblib && \
    test -f ./backend/model/plant_disease_model.keras && \
    echo "============================================" && \
    echo "SUCCESS: Both ML models found!" && \
    echo "============================================"


# -------------------- FRONTEND --------------------
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist


# -------------------- CLEANUP --------------------
RUN rm -rf backend/app/__pycache__ \
           backend/__pycache__ \
           backend/venv \
           backend/.venv


# -------------------- PORT --------------------
EXPOSE 7860


# -------------------- START SERVER --------------------
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-7860}"]
