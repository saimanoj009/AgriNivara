# AgriNivara — SIH Final Build

## Major fixes in this version

1. Real authentication is implemented through FastAPI + SQLite.
2. Random credentials no longer log in.
3. Admin login:
   - Username: `Admin`
   - Password: `admin@9`
4. Farmer signup creates a real local account.
5. Protected React routes:
   - `/dashboard`
   - `/crop-recommendation`
   - `/disease-detection`
   - `/admin`
6. Crop Recommendation page remains connected to the Random Forest backend.
7. Disease Detection now has a working UI route connected to `/predict-disease`.
8. Admin dashboard shows registered farmers and login/account activity.
9. Passwords are stored as PBKDF2-HMAC-SHA256 hashes, not plain text.
10. Session tokens are signed on the backend and stored in browser local storage for this SIH demo.
11. Existing AI decision-support modules (XAI, suitability, risk analysis, action plan, what-if simulation, weather/location integration) are preserved.

## Run backend

```bash
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend should show:

`AgriNivara - AI Agriculture Decision Support API`

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend normally opens at the Vite URL shown in the terminal.

## Login

### Admin
Username: `Admin`
Password: `admin@9`

### Farmer
1. Open Create Account.
2. Register a 10-digit mobile number and password.
3. Login using the same mobile number and password.

## SIH demo flow

Landing → Login → Farmer Dashboard → Crop Recommendation → enter N/P/K + pH + location → real-time weather → AI crop recommendation → explainability → suitability → risks → action plan → What-If.

For plant health:

Farmer Dashboard → Disease Detection → upload leaf image → AI prediction + confidence + top predictions.

For judges:

Login → `Admin` / `admin@9` → Admin Dashboard → show farmer adoption/system monitoring.

## Important

For production deployment, replace the demo authentication secret using the environment variable:

`AGRINIVARA_AUTH_SECRET`

Also move authentication to a production identity/database service and use HTTPS.

The fixed Admin credentials were included exactly as requested for the SIH demonstration.
