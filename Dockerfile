# ============================================================
# AgriNivara - Single Website Production Container
# React/Vite frontend + FastAPI backend + ML models
# ============================================================

FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

FROM python:3.11-slim AS runtime
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=7860

# TensorFlow and scientific Python dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Backend source and trained models
COPY backend ./backend

# Production React build
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Do not ship training/cache artifacts in the runtime image.
RUN rm -rf backend/app/__pycache__ backend/__pycache__ \
           backend/venv backend/.venv

EXPOSE 7860

CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-7860}"]
