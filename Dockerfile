# ============================================================
# AgriNivara - Single Website Production Container
# React/Vite Frontend + FastAPI Backend + ML Models
# ============================================================


# ============================================================
# 1. FRONTEND BUILD
# ============================================================

FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend

# Install frontend dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copy frontend source
COPY frontend ./

# Build React/Vite application
RUN npm run build


# ============================================================
# 2. PYTHON RUNTIME
# ============================================================

FROM python:3.11-slim AS runtime

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=7860


# ============================================================
# 3. PYTHON DEPENDENCIES
# ============================================================

COPY backend/requirements.txt ./backend/requirements.txt

RUN pip install --no-cache-dir -r backend/requirements.txt


# ============================================================
# 4. BACKEND + ML MODELS
# ============================================================

COPY backend ./backend


# ============================================================
# 5. VERIFY ML MODELS
# ============================================================

RUN echo "==================================================" && \
    echo "AgriNivara - Checking ML Model Files" && \
    echo "==================================================" && \
    echo "Backend directory:" && \
    ls -lah ./backend && \
    echo "--------------------------------------------------" && \
    echo "Model directory:" && \
    ls -lah ./backend/model && \
    echo "--------------------------------------------------" && \
    echo "Checking Crop Recommendation Model..." && \
    test -f ./backend/model/crop_recommendation_model.joblib && \
    echo "OK: crop_recommendation_model.joblib found" && \
    echo "--------------------------------------------------" && \
    echo "Checking Plant Disease Model..." && \
    test -f ./backend/model/plant_disease_model.keras && \
    echo "OK: plant_disease_model.keras found" && \
    echo "--------------------------------------------------" && \
    echo "Model file sizes:" && \
    du -h ./backend/model/crop_recommendation_model.joblib && \
    du -h ./backend/model/plant_disease_model.keras && \
    echo "==================================================" && \
    echo "SUCCESS: BOTH ML MODELS ARE PRESENT IN IMAGE" && \
    echo "=================================================="


# ============================================================
# 6. COPY PRODUCTION FRONTEND
# ============================================================

COPY --from=frontend-builder /app/frontend/dist ./frontend/dist


# ============================================================
# 7. CLEANUP
# ============================================================

RUN rm -rf \
    backend/__pycache__ \
    backend/app/__pycache__ \
    backend/venv \
    backend/.venv


# ============================================================
# 8. PORT
# ============================================================

EXPOSE 7860


# ============================================================
# 9. START FASTAPI SERVER
# ============================================================

CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-7860}"]
