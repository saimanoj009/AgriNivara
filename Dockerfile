# ============================================================
# AgriNivara - Production Container
# React/Vite + FastAPI + ML Models
# ============================================================

# ============================================================
# FRONTEND BUILD
# ============================================================
FROM node:22-alpine AS frontend-builder

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./frontend/

RUN cd frontend && npm ci

COPY frontend ./frontend

RUN cd frontend && npm run build


# ============================================================
# PYTHON RUNTIME
# ============================================================
FROM python:3.11-slim AS runtime

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=7860


# ============================================================
# SYSTEM DEPENDENCIES
# ============================================================
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        unzip && \
    rm -rf /var/lib/apt/lists/*


# ============================================================
# PYTHON DEPENDENCIES
# ============================================================
COPY backend/requirements.txt ./backend/requirements.txt

RUN pip install --no-cache-dir -r backend/requirements.txt


# ============================================================
# COPY BACKEND
# ============================================================
COPY backend ./backend


# ============================================================
# BUNDLED ML MODELS
# ============================================================
# backend/model/ is copied above and contains the real plant disease
# model. Do not replace it with a Git LFS pointer.
RUN if [ -f /app/backend/model/plant_disease_model.keras ] && [ $(stat -c%s /app/backend/model/plant_disease_model.keras) -gt 100000000 ]; then \
        echo "Plant disease model present in image."; \
    else \
        echo "Plant disease model optional or loaded dynamically."; \
    fi

# ============================================================
# COPY FRONTEND PRODUCTION BUILD
# ============================================================
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist


# ============================================================
# CLEANUP
# ============================================================
RUN rm -rf \
    backend/app/__pycache__ \
    backend/__pycache__ \
    backend/venv \
    backend/.venv


# ============================================================
# PORT
# ============================================================
EXPOSE 7860


# ============================================================
# START FASTAPI
# ============================================================
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-7860}"]
