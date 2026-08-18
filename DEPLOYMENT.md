# AgriNivara — Deployment Ready

This project is configured for a **single website** deployment:

- React + Vite frontend
- FastAPI backend
- Crop recommendation model
- Plant disease model
- SQLite authentication database (created automatically on startup)
- One public URL

## Deployment target

The included Dockerfile is ready for Docker-based web services such as Render. The service builds the frontend and then FastAPI serves the generated React files and API from the same port.

### Files added for deployment

- `Dockerfile` — multi-stage frontend + Python runtime image
- `.dockerignore` — keeps local development files out of the image
- `render.yaml` — Render Blueprint configuration
- `.env.example` — environment variable reference

## Important

Set `AGRINIVARA_AUTH_SECRET` to a strong random secret in production. The Render Blueprint is configured to generate one automatically.

SQLite is suitable for an SIH/demo deployment, but its data is not durable on platforms with ephemeral disks. For a production system, replace SQLite with PostgreSQL.

## Local Docker test

```bash
docker build -t agrinivara .
docker run --rm -p 7860:7860 -e AGRINIVARA_AUTH_SECRET=change-me agrinivara
```

Then open `http://localhost:7860`.
