# ============================================================
# AgriNivara - Production Dockerfile
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


# -------------------- VERIFY MODEL FILES --------------------
RUN echo "============================================" && \
    echo "AgriNivara Model Verification" && \
    echo "============================================" && \
    ls -lah /app/backend/model && \
    echo "--------------------------------------------" && \
    echo "Crop model:" && \
    ls -lh /app/backend/model/crop_recommendation_model.joblib && \
    echo "Plant disease model:" && \
    ls -lh /app/backend/model/plant_disease_model.keras && \
    echo "============================================"


# -------------------- FRONTEND --------------------
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist


# -------------------- CLEANUP --------------------
RUN rm -rf \
    backend/app/__pycache__ \
    backend/__pycache__ \
    backend/venv \
    backend/.venv


# -------------------- PORT --------------------
EXPOSE 7860


# -------------------- START SERVER --------------------
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-7860}"]
