from pathlib import Path
import os
import asyncio
import hashlib
import urllib.request
import urllib.error
import zipfile
import sqlite3
import hmac
import base64
import json
import secrets
import traceback
import threading
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

import joblib
import pandas as pd
import numpy as np

from fastapi import (
    FastAPI,
    HTTPException,
    UploadFile,
    File,
    Header,
    Form,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field


# ============================================================
# OPTIONAL TENSORFLOW IMPORT
# ============================================================
# TensorFlow is intentionally NOT imported at module import time.
# The plant disease model is loaded in a background thread after
# FastAPI startup so the API can start responding immediately.

tf = None

print("TensorFlow import deferred until background plant disease model load.")


# ============================================================
# AGRINIVARA - AI AGRICULTURE API
# ============================================================

print("=" * 70)
print("AgriNivara - AI Agriculture Decision Support API v2.6")
print("=" * 70)


# ============================================================
# PROJECT PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

FRONTEND_DIST = BASE_DIR.parent / "frontend" / "dist"

CROP_MODEL_PATH = (
    BASE_DIR / "model" / "crop_recommendation_model.joblib"
)

# The real plant-disease model is bundled in the deployment package.
# This avoids Git LFS/runtime-download problems and makes the backend
# deterministic: it always loads the model from backend/model/.
DEFAULT_MODEL_FILENAME = "plant_disease_model.keras"
PLANT_MODEL_PATH = Path(
    os.getenv("PLANT_DISEASE_MODEL_PATH", str(BASE_DIR / "model" / DEFAULT_MODEL_FILENAME))
)
PLANT_MODEL_MIN_BYTES = int(os.getenv("PLANT_DISEASE_MODEL_MIN_BYTES", "100000000"))
MODEL_LOAD_WAIT_SECONDS = int(os.getenv("PLANT_DISEASE_MODEL_LOAD_WAIT_SECONDS", "180"))


print("\nPROJECT PATHS")
print("-" * 70)
print(f"BASE_DIR              : {BASE_DIR}")
print(f"CROP_MODEL_PATH       : {CROP_MODEL_PATH}")
print(f"PLANT_MODEL_PATH      : {PLANT_MODEL_PATH}")
print(f"FRONTEND_DIST         : {FRONTEND_DIST}")


# ============================================================
# PLANT DISEASE CLASSES
# ============================================================

PLANT_DISEASE_CLASSES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",

    "Blueberry___healthy",

    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",

    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",

    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",

    "Orange___Haunglongbing_(Citrus_greening)",

    "Peach___Bacterial_spot",
    "Peach___healthy",

    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",

    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",

    "Raspberry___healthy",

    "Soybean___healthy",

    "Squash___Powdery_mildew",

    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",

    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy",
]


# ============================================================
# LOAD CROP RECOMMENDATION MODEL
# ============================================================

print("\n" + "-" * 70)
print("Loading crop recommendation model...")
print("-" * 70)

if not CROP_MODEL_PATH.exists():

    raise FileNotFoundError(
        f"Crop recommendation model not found at:\n"
        f"{CROP_MODEL_PATH}"
    )

try:

    crop_model = joblib.load(CROP_MODEL_PATH)

    print("SUCCESS: Crop recommendation model loaded.")

    try:
        print(
            f"Crop model classes: "
            f"{len(crop_model.classes_)}"
        )
    except Exception:
        pass

except Exception as e:

    print("ERROR: Unable to load crop recommendation model.")
    print(f"Error type: {type(e).__name__}")
    print(f"Error: {str(e)}")

    raise RuntimeError(
        f"Unable to load crop recommendation model: {e}"
    )


# ============================================================
# BACKGROUND PLANT DISEASE MODEL LOADER
# ============================================================

class DiseaseModelLoader:
    """Download (when necessary) and load the Keras plant-disease model safely."""

    def __init__(self, model_path: Path, model_url: str = ""):
        self.model_path = Path(model_path)
        self.model_url = model_url
        self._model = None
        self._error = None
        self._status = "not_started"
        self._thread = None
        self._lock = threading.Lock()
        self._started_at = None
        self._finished_at = None
        self._downloaded = False

    @staticmethod
    def _is_lfs_pointer(path: Path) -> bool:
        try:
            if path.stat().st_size > 1024:
                return False
            text = path.read_text(errors="ignore")
            return text.startswith("version https://git-lfs.github.com/spec/v1")
        except Exception:
            return False

    def _is_valid_model_file(self, path: Path) -> bool:
        if not path.exists() or not path.is_file():
            return False
        try:
            if path.stat().st_size < PLANT_MODEL_MIN_BYTES:
                return False
            if not zipfile.is_zipfile(path):
                return False
            with zipfile.ZipFile(path, "r") as z:
                names = set(z.namelist())
                if not {"config.json", "metadata.json", "model.weights.h5"}.intersection(names):
                    return False
            return True
        except Exception:
            return False

    def _sha256(self, path: Path) -> str:
        digest = hashlib.sha256()
        with path.open("rb") as f:
            for chunk in iter(lambda: f.read(1024 * 1024), b""):
                digest.update(chunk)
        return digest.hexdigest().lower()

    def _download_model(self) -> None:
        if not self.model_url:
            raise RuntimeError(
                f"Plant disease model not found or invalid at {self.model_path}. "
                "Place the original plant_disease_model.keras file in backend/model/ "
                "or set the PLANT_DISEASE_MODEL_URL environment variable."
            )
        print(f"Downloading plant disease model from {self.model_url}...")
        self.model_path.parent.mkdir(parents=True, exist_ok=True)
        req = urllib.request.Request(
            self.model_url,
            headers={"User-Agent": "AgriNivara-Downloader/1.0"}
        )
        with urllib.request.urlopen(req) as response, open(self.model_path, "wb") as out_file:
            while True:
                chunk = response.read(1024 * 1024)
                if not chunk:
                    break
                out_file.write(chunk)
        self._downloaded = True
        print(f"Download complete: {self.model_path}")

    def start_background_loading(self) -> None:
        with self._lock:
            if self._thread is not None and self._thread.is_alive():
                return
            self._status = "loading"
            self._started_at = datetime.now(timezone.utc).isoformat()
            self._finished_at = None
            self._thread = threading.Thread(
                target=self.load_model,
                name="plant-disease-model-loader",
                daemon=True,
            )
            self._thread.start()

    def load_model(self) -> None:
        global tf, plant_model, plant_model_error
        try:
            print("Preparing plant disease model...")
            if not self._is_valid_model_file(self.model_path):
                if self.model_url:
                    self._download_model()
                else:
                    if self.model_path.exists() and self._is_lfs_pointer(self.model_path):
                        raise RuntimeError(
                            f"Git LFS pointer detected at {self.model_path}. "
                            "Use the real plant_disease_model.keras file or set PLANT_DISEASE_MODEL_URL."
                        )
                    raise RuntimeError(
                        f"Plant disease model at {self.model_path} is missing or invalid. "
                        "Place the original plant_disease_model.keras file in backend/model/ or set PLANT_DISEASE_MODEL_URL environment variable."
                    )

            model_size = self.model_path.stat().st_size
            print(f"Plant disease model ready: {model_size / 1024 / 1024:.1f} MB")
            print("Importing TensorFlow (lazy import)...")
            import tensorflow as tensorflow_module
            tf = tensorflow_module
            print(f"TensorFlow version: {tf.__version__}")

            print("Loading Keras model...")
            try:
                model = tf.keras.models.load_model(self.model_path, compile=False)
            except Exception as first_error:
                print(f"Standard Keras loading failed: {type(first_error).__name__}: {first_error}")
                try:
                    model = tf.keras.models.load_model(
                        self.model_path, compile=False, safe_mode=False
                    )
                except TypeError:
                    raise first_error

            with self._lock:
                self._model = model
                self._error = None
                self._status = "loaded"
                self._finished_at = datetime.now(timezone.utc).isoformat()
            plant_model = model
            plant_model_error = None

            print("SUCCESS: Plant disease model loaded successfully.")
            print(f"Model input shape: {getattr(model, 'input_shape', 'unknown')}")
            print(f"Model output shape: {getattr(model, 'output_shape', 'unknown')}")
            try:
                model_classes = int(model.output_shape[-1])
                if model_classes != len(PLANT_DISEASE_CLASSES):
                    print(f"WARNING: model has {model_classes} outputs; configured class list has {len(PLANT_DISEASE_CLASSES)}")
            except Exception as e:
                print(f"Could not check class count: {e}")

        except Exception as e:
            error_text = f"{type(e).__name__}: {str(e)}"
            with self._lock:
                self._model = None
                self._error = error_text
                self._status = "failed"
                self._finished_at = datetime.now(timezone.utc).isoformat()
            plant_model = None
            plant_model_error = error_text
            print("ERROR: PLANT DISEASE MODEL FAILED TO LOAD")
            print(error_text)
            traceback.print_exc()

    def get_model(self):
        with self._lock:
            return self._model

    def info(self) -> Dict[str, Any]:
        with self._lock:
            status = self._status
            error = self._error
            model_loaded = self._model is not None
            started_at = self._started_at
            finished_at = self._finished_at
        exists = self.model_path.exists()
        size = self.model_path.stat().st_size if exists else 0
        return {
            "status": status,
            "loaded": model_loaded,
            "model_path": str(self.model_path),
            "model_file_exists": exists,
            "model_file_size_bytes": size,
            "model_file_size_mb": round(size / 1024 / 1024, 2),
            "model_url_configured": bool(self.model_url),
            "model_downloaded_this_start": self._downloaded,
            "model_error": error,
            "started_at": started_at,
            "finished_at": finished_at,
        }


DEFAULT_PLANT_MODEL_URL = "https://media.githubusercontent.com/media/saimanoj009/AgriNivara/main/backend/model/plant_disease_model.keras"
PLANT_MODEL_URL = os.getenv("PLANT_DISEASE_MODEL_URL", os.getenv("MODEL_URL", DEFAULT_PLANT_MODEL_URL))

# Single loader instance used by the API.
disease_model_loader = DiseaseModelLoader(PLANT_MODEL_PATH, PLANT_MODEL_URL)

# Backward-compatible variables used by existing routes.
plant_model = None
plant_model_error = None


# ============================================================
# AUTHENTICATION & USER MANAGEMENT
# ============================================================

AUTH_DB_PATH = BASE_DIR / "agrinivara_users.db"

AUTH_SECRET = os.getenv(
    "AGRINIVARA_AUTH_SECRET",
    "change-this-secret-before-production"
)


def _db():

    conn = sqlite3.connect(AUTH_DB_PATH)

    conn.row_factory = sqlite3.Row

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            mobile TEXT UNIQUE NOT NULL,
            location TEXT DEFAULT '',
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS help_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            mobile TEXT NOT NULL,
            message TEXT NOT NULL,
            image_data TEXT DEFAULT NULL,
            status TEXT NOT NULL DEFAULT 'Open',
            admin_reply TEXT DEFAULT NULL,
            created_at TEXT NOT NULL
        )
        """
    )

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            image_data TEXT DEFAULT NULL,
            created_at TEXT NOT NULL,
            read_by_user INTEGER NOT NULL DEFAULT 0
        )
        """
    )

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS activity (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mobile TEXT NOT NULL,
            action TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )

    conn.commit()

    return conn


def _hash_password(password: str) -> str:

    salt = secrets.token_bytes(16)

    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode(),
        salt,
        120000
    )

    return base64.b64encode(
        salt + digest
    ).decode()


def _verify_password(
    password: str,
    stored: str
) -> bool:

    try:

        raw = base64.b64decode(
            stored.encode()
        )

        salt = raw[:16]
        expected = raw[16:]

        actual = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode(),
            salt,
            120000
        )

        return hmac.compare_digest(
            actual,
            expected
        )

    except Exception:

        return False


def _make_token(
    user_id: str,
    role: str,
    mobile: str
) -> str:

    payload = {
        "uid": user_id,
        "role": role,
        "mobile": mobile,
        "exp": int(
            datetime.now(
                timezone.utc
            ).timestamp()
        ) + 60 * 60 * 12
    }

    encoded = base64.urlsafe_b64encode(
        json.dumps(
            payload,
            separators=(",", ":")
        ).encode()
    ).decode().rstrip("=")

    signature = hmac.new(
        AUTH_SECRET.encode(),
        encoded.encode(),
        hashlib.sha256
    ).hexdigest()

    return f"{encoded}.{signature}"


def _verify_token(token: str) -> dict:

    try:

        encoded, signature = token.split(
            ".",
            1
        )

        expected = hmac.new(
            AUTH_SECRET.encode(),
            encoded.encode(),
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(
            signature,
            expected
        ):
            raise ValueError(
                "Invalid signature"
            )

        padding = "=" * (
            -len(encoded) % 4
        )

        payload = json.loads(
            base64.urlsafe_b64decode(
                (
                    encoded + padding
                ).encode()
            ).decode()
        )

        if int(payload["exp"]) < int(
            datetime.now(
                timezone.utc
            ).timestamp()
        ):
            raise ValueError(
                "Token expired"
            )

        return payload

    except Exception:

        raise HTTPException(
            status_code=401,
            detail=(
                "Invalid or expired "
                "authentication token."
            )
        )


def _require_token(
    authorization: Optional[str]
) -> dict:

    if (
        not authorization
        or not authorization.startswith("Bearer ")
    ):

        raise HTTPException(
            status_code=401,
            detail="Authentication required."
        )

    return _verify_token(
        authorization[7:].strip()
    )


# ============================================================
# AUTH SCHEMAS
# ============================================================

class SignupRequest(BaseModel):

    name: str = Field(
        ...,
        min_length=2,
        max_length=80
    )

    mobile: str = Field(
        ...,
        min_length=10,
        max_length=10
    )

    location: str = Field(
        "",
        max_length=120
    )

    password: str = Field(
        ...,
        min_length=6,
        max_length=128
    )


class LoginRequest(BaseModel):

    identifier: str = Field(
        ...,
        min_length=1,
        max_length=80
    )

    password: str = Field(
        ...,
        min_length=1,
        max_length=128
    )


class AuthResponse(BaseModel):

    success: bool
    token: str
    role: str
    user: Dict[str, Any]


# Initialize DB
_db()


# ============================================================
# CROP REQUIREMENTS
# ============================================================

CROP_REQUIREMENTS: Dict[str, Dict[str, Any]] = {

    "rice": {
        "N": (60, 120, 90),
        "P": (35, 60, 48),
        "K": (35, 50, 42),
        "temperature": (20.0, 30.0, 24.0),
        "humidity": (70.0, 90.0, 82.0),
        "ph": (5.5, 7.2, 6.4),
        "rainfall": (150.0, 300.0, 220.0)
    },

    "maize": {
        "N": (60, 100, 80),
        "P": (35, 60, 48),
        "K": (15, 30, 20),
        "temperature": (18.0, 29.0, 23.0),
        "humidity": (55.0, 75.0, 65.0),
        "ph": (5.5, 7.5, 6.3),
        "rainfall": (60.0, 120.0, 90.0)
    },

    "chickpea": {
        "N": (20, 60, 40),
        "P": (55, 80, 68),
        "K": (70, 90, 80),
        "temperature": (17.0, 22.0, 19.0),
        "humidity": (14.0, 20.0, 17.0),
        "ph": (6.0, 8.5, 7.2),
        "rainfall": (65.0, 95.0, 80.0)
    },

    "kidneybeans": {
        "N": (15, 40, 20),
        "P": (55, 80, 67),
        "K": (15, 25, 20),
        "temperature": (15.0, 24.0, 20.0),
        "humidity": (18.0, 25.0, 21.0),
        "ph": (5.5, 6.0, 5.7),
        "rainfall": (95.0, 150.0, 110.0)
    },

    "pigeonpeas": {
        "N": (15, 40, 20),
        "P": (55, 80, 68),
        "K": (18, 30, 20),
        "temperature": (27.0, 38.0, 31.0),
        "humidity": (45.0, 68.0, 55.0),
        "ph": (5.0, 7.5, 6.2),
        "rainfall": (90.0, 200.0, 150.0)
    },

    "mothbeans": {
        "N": (15, 40, 22),
        "P": (35, 60, 48),
        "K": (15, 25, 20),
        "temperature": (24.0, 32.0, 28.0),
        "humidity": (40.0, 65.0, 53.0),
        "ph": (3.5, 10.0, 7.0),
        "rainfall": (30.0, 75.0, 50.0)
    },

    "mungbean": {
        "N": (15, 40, 20),
        "P": (35, 60, 48),
        "K": (15, 25, 20),
        "temperature": (27.0, 30.0, 28.5),
        "humidity": (80.0, 90.0, 85.0),
        "ph": (6.2, 7.2, 6.7),
        "rainfall": (35.0, 60.0, 50.0)
    },

    "blackgram": {
        "N": (35, 60, 40),
        "P": (55, 80, 67),
        "K": (15, 25, 19),
        "temperature": (25.0, 35.0, 30.0),
        "humidity": (60.0, 75.0, 65.0),
        "ph": (6.5, 7.8, 7.1),
        "rainfall": (60.0, 75.0, 68.0)
    },

    "lentil": {
        "N": (15, 40, 20),
        "P": (55, 80, 68),
        "K": (15, 25, 20),
        "temperature": (18.0, 30.0, 24.0),
        "humidity": (60.0, 70.0, 65.0),
        "ph": (5.9, 7.8, 6.8),
        "rainfall": (35.0, 55.0, 45.0)
    },

    "pomegranate": {
        "N": (15, 40, 20),
        "P": (10, 30, 20),
        "K": (35, 45, 40),
        "temperature": (18.0, 25.0, 22.0),
        "humidity": (85.0, 95.0, 90.0),
        "ph": (5.5, 7.2, 6.4),
        "rainfall": (100.0, 115.0, 107.0)
    },

    "banana": {
        "N": (80, 120, 100),
        "P": (70, 95, 82),
        "K": (45, 55, 50),
        "temperature": (25.0, 31.0, 27.0),
        "humidity": (75.0, 85.0, 80.0),
        "ph": (5.5, 6.5, 6.0),
        "rainfall": (90.0, 120.0, 100.0)
    },

    "mango": {
        "N": (15, 40, 20),
        "P": (15, 40, 27),
        "K": (25, 35, 30),
        "temperature": (27.0, 36.0, 31.0),
        "humidity": (45.0, 55.0, 50.0),
        "ph": (4.5, 7.0, 5.8),
        "rainfall": (85.0, 100.0, 95.0)
    },

    "grapes": {
        "N": (15, 40, 23),
        "P": (120, 145, 133),
        "K": (195, 205, 200),
        "temperature": (8.0, 42.0, 24.0),
        "humidity": (80.0, 85.0, 82.0),
        "ph": (5.5, 6.5, 6.0),
        "rainfall": (65.0, 75.0, 70.0)
    },

    "watermelon": {
        "N": (80, 120, 99),
        "P": (5, 30, 17),
        "K": (45, 55, 50),
        "temperature": (24.0, 27.0, 25.5),
        "humidity": (80.0, 90.0, 85.0),
        "ph": (6.0, 6.8, 6.4),
        "rainfall": (40.0, 60.0, 50.0)
    },

    "muskmelon": {
        "N": (80, 120, 100),
        "P": (5, 30, 17),
        "K": (45, 55, 50),
        "temperature": (27.0, 30.0, 28.5),
        "humidity": (90.0, 95.0, 92.0),
        "ph": (6.0, 6.8, 6.4),
        "rainfall": (20.0, 30.0, 25.0)
    },

    "apple": {
        "N": (0, 40, 20),
        "P": (120, 145, 134),
        "K": (195, 205, 200),
        "temperature": (21.0, 24.0, 22.5),
        "humidity": (90.0, 95.0, 92.0),
        "ph": (5.5, 6.5, 6.0),
        "rainfall": (100.0, 125.0, 112.0)
    },

    "orange": {
        "N": (0, 40, 20),
        "P": (5, 30, 16),
        "K": (5, 15, 10),
        "temperature": (10.0, 35.0, 23.0),
        "humidity": (90.0, 95.0, 92.0),
        "ph": (6.0, 8.0, 7.0),
        "rainfall": (100.0, 120.0, 110.0)
    },

    "papaya": {
        "N": (35, 70, 50),
        "P": (45, 70, 59),
        "K": (45, 55, 50),
        "temperature": (23.0, 44.0, 33.0),
        "humidity": (90.0, 95.0, 92.0),
        "ph": (6.5, 7.0, 6.7),
        "rainfall": (40.0, 250.0, 140.0)
    },

    "coconut": {
        "N": (15, 40, 22),
        "P": (5, 30, 17),
        "K": (25, 35, 30),
        "temperature": (25.0, 29.0, 27.0),
        "humidity": (90.0, 98.0, 94.0),
        "ph": (5.5, 6.5, 6.0),
        "rainfall": (130.0, 225.0, 175.0)
    },

    "cotton": {
        "N": (100, 140, 118),
        "P": (35, 60, 46),
        "K": (15, 25, 19),
        "temperature": (22.0, 26.0, 24.0),
        "humidity": (75.0, 85.0, 80.0),
        "ph": (6.0, 8.0, 6.9),
        "rainfall": (60.0, 90.0, 80.0)
    },

    "jute": {
        "N": (60, 90, 78),
        "P": (35, 60, 47),
        "K": (35, 45, 40),
        "temperature": (23.0, 26.0, 25.0),
        "humidity": (70.0, 90.0, 80.0),
        "ph": (6.0, 7.5, 6.7),
        "rainfall": (150.0, 200.0, 175.0)
    },

    "coffee": {
        "N": (80, 120, 101),
        "P": (15, 35, 29),
        "K": (25, 35, 30),
        "temperature": (23.0, 28.0, 25.5),
        "humidity": (50.0, 60.0, 55.0),
        "ph": (6.0, 7.5, 6.8),
        "rainfall": (115.0, 200.0, 160.0)
    },
}


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="AgriNivara Decision Support API",
    description=(
        "AI-Powered Personalized Farm Decision "
        "Support System Backend for SIH 2026."
    ),
    version="2.6.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# FASTAPI STARTUP - BACKGROUND MODEL LOAD
# ============================================================

@app.on_event("startup")
def start_background_plant_model_load():
    print("Starting background plant disease model load")
    print(f"Expected model path: {PLANT_MODEL_PATH}")
    print("Using bundled local disease model; no external model URL required.")
    disease_model_loader.start_background_loading()


# ============================================================
# REQUEST SCHEMAS
# ============================================================

class CropRequest(BaseModel):

    N: float = Field(
        ...,
        ge=0,
        description="Nitrogen value in mg/kg"
    )

    P: float = Field(
        ...,
        ge=0,
        description="Phosphorus value in mg/kg"
    )

    K: float = Field(
        ...,
        ge=0,
        description="Potassium value in mg/kg"
    )

    temperature: float = Field(
        ...,
        description="Temperature in Celsius"
    )

    humidity: float = Field(
        ...,
        ge=0,
        le=100,
        description="Relative humidity %"
    )

    ph: float = Field(
        ...,
        ge=0,
        le=14,
        description="Soil pH"
    )

    rainfall: float = Field(
        ...,
        ge=0,
        description="Rainfall in mm"
    )


class FarmAnalysisRequest(CropRequest):

    selected_crop: Optional[str] = Field(
        None,
        description="Optional target crop override"
    )


class WhatIfRequest(BaseModel):

    current: CropRequest
    changed: CropRequest


# ============================================================
# HELPER DECISION ENGINES
# ============================================================

def get_crop_requirements(
    crop_name: str
) -> Dict[str, Any]:

    key = crop_name.lower().replace(
        " ",
        ""
    )

    return CROP_REQUIREMENTS.get(
        key,
        {
            "N": (20, 100, 60),
            "P": (20, 80, 45),
            "K": (20, 100, 50),
            "temperature": (18.0, 32.0, 25.0),
            "humidity": (40.0, 85.0, 65.0),
            "ph": (5.5, 7.5, 6.5),
            "rainfall": (50.0, 200.0, 120.0)
        }
    )


def calculate_feature_suitability(
    value: float,
    min_val: float,
    max_val: float,
    opt_val: float
) -> Dict[str, Any]:

    if min_val <= value <= max_val:

        range_span = max(
            1.0,
            max_val - min_val
        )

        dist = abs(
            value - opt_val
        )

        score = max(
            70,
            min(
                100,
                int(
                    100 -
                    (
                        dist /
                        range_span
                    ) * 40
                )
            )
        )

        status = "good"

    elif value < min_val:

        deficit = min_val - value

        score = max(
            20,
            int(
                70 -
                deficit * 2
            )
        )

        status = (
            "moderate"
            if score >= 50
            else "warning"
        )

    else:

        excess = value - max_val

        score = max(
            20,
            int(
                70 -
                excess * 2
            )
        )

        status = (
            "moderate"
            if score >= 50
            else "warning"
        )

    return {
        "score": score,
        "status": status
    }


def evaluate_explainability(
    data: CropRequest,
    crop_name: str
) -> List[Dict[str, Any]]:

    reqs = get_crop_requirements(
        crop_name
    )

    explanations = []

    features = [
        (
            "N",
            "Nitrogen level",
            data.N,
            reqs["N"],
            "mg/kg"
        ),
        (
            "P",
            "Phosphorus level",
            data.P,
            reqs["P"],
            "mg/kg"
        ),
        (
            "K",
            "Potassium level",
            data.K,
            reqs["K"],
            "mg/kg"
        ),
        (
            "temperature",
            "Temperature",
            data.temperature,
            reqs["temperature"],
            "°C"
        ),
        (
            "humidity",
            "Humidity",
            data.humidity,
            reqs["humidity"],
            "%"
        ),
        (
            "ph",
            "Soil pH",
            data.ph,
            reqs["ph"],
            ""
        ),
        (
            "rainfall",
            "Rainfall",
            data.rainfall,
            reqs["rainfall"],
            "mm"
        )
    ]

    for (
        fname,
        label,
        val,
        ranges,
        unit
    ) in features:

        min_v, max_v, opt_v = ranges

        res = calculate_feature_suitability(
            val,
            min_v,
            max_v,
            opt_v
        )

        st = res["status"]

        if st == "good":

            msg = (
                f"{label} ({val}{unit}) "
                f"is within optimal range "
                f"({min_v}-{max_v}{unit}) "
                f"for {crop_name.capitalize()}."
            )

        elif val < min_v:

            msg = (
                f"{label} ({val}{unit}) "
                f"is lower than preferred "
                f"minimum ({min_v}{unit}) "
                f"for {crop_name.capitalize()}."
            )

        else:

            msg = (
                f"{label} ({val}{unit}) "
                f"is higher than preferred "
                f"maximum ({max_v}{unit}) "
                f"for {crop_name.capitalize()}."
            )

        explanations.append(
            {
                "feature": label,
                "key": fname,
                "status": st,
                "score": res["score"],
                "actual_value": val,
                "optimal_range": (
                    f"{min_v} - {max_v} {unit}"
                ).strip(),
                "message": msg
            }
        )

    return explanations


def calculate_suitability_scores(
    data: CropRequest,
    crop_name: str
) -> Dict[str, Any]:

    reqs = get_crop_requirements(
        crop_name
    )

    soil_score = (
        calculate_feature_suitability(
            data.ph,
            *reqs["ph"]
        )["score"] * 0.4
        +
        calculate_feature_suitability(
            data.N,
            *reqs["N"]
        )["score"] * 0.2
        +
        calculate_feature_suitability(
            data.P,
            *reqs["P"]
        )["score"] * 0.2
        +
        calculate_feature_suitability(
            data.K,
            *reqs["K"]
        )["score"] * 0.2
    )

    weather_score = (
        calculate_feature_suitability(
            data.temperature,
            *reqs["temperature"]
        )["score"] * 0.6
        +
        calculate_feature_suitability(
            data.humidity,
            *reqs["humidity"]
        )["score"] * 0.4
    )

    water_score = calculate_feature_suitability(
        data.rainfall,
        *reqs["rainfall"]
    )["score"]

    nutrient_score = (
        calculate_feature_suitability(
            data.N,
            *reqs["N"]
        )["score"]
        +
        calculate_feature_suitability(
            data.P,
            *reqs["P"]
        )["score"]
        +
        calculate_feature_suitability(
            data.K,
            *reqs["K"]
        )["score"]
    ) / 3.0

    overall = int(
        soil_score * 0.3
        +
        weather_score * 0.3
        +
        water_score * 0.25
        +
        nutrient_score * 0.15
    )

    if overall >= 75:

        overall_status = "GOOD"

    elif overall >= 55:

        overall_status = "MODERATE"

    else:

        overall_status = "NEEDS ATTENTION"

    return {
        "soil": int(soil_score),
        "weather": int(weather_score),
        "water": int(water_score),
        "nutrients": int(nutrient_score),
        "overall": overall,
        "status": overall_status
    }


def generate_risk_analysis(
    data: CropRequest,
    crop_name: str
) -> List[Dict[str, Any]]:

    reqs = get_crop_requirements(
        crop_name
    )

    risks = []

    min_t, max_t, _ = reqs["temperature"]

    if data.temperature > max_t + 4:

        risks.append(
            {
                "title":
                    "High Temperature Heat Stress Risk",
                "severity":
                    "HIGH",
                "reason":
                    (
                        f"Current temp "
                        f"({data.temperature}°C) "
                        f"exceeds max crop tolerance "
                        f"({max_t}°C)."
                    ),
                "mitigation":
                    (
                        "Plan shade netting or "
                        "micro-irrigation sprinklers "
                        "to lower canopy temperatures."
                    )
            }
        )

    elif data.temperature > max_t:

        risks.append(
            {
                "title":
                    "Moderate Thermal Stress",
                "severity":
                    "MODERATE",
                "reason":
                    (
                        f"Temperature "
                        f"({data.temperature}°C) "
                        f"is above preferred "
                        f"upper limit ({max_t}°C)."
                    ),
                "mitigation":
                    (
                        "Ensure consistent soil "
                        "moisture to prevent "
                        "heat wilting."
                    )
            }
        )

    elif data.temperature < min_t - 4:

        risks.append(
            {
                "title":
                    "Cold Stress Risk",
                "severity":
                    "HIGH",
                "reason":
                    (
                        f"Current temp "
                        f"({data.temperature}°C) "
                        f"is below crop growth "
                        f"minimum ({min_t}°C)."
                    ),
                "mitigation":
                    (
                        "Delay sowing or use mulch "
                        "to conserve soil temperature."
                    )
            }
        )

    else:

        risks.append(
            {
                "title":
                    "Temperature Risk",
                "severity":
                    "LOW",
                "reason":
                    (
                        "Temperature is within "
                        "safe biological range."
                    ),
                "mitigation":
                    (
                        "Maintain standard "
                        "thermal monitoring."
                    )
            }
        )

    min_r, max_r, _ = reqs["rainfall"]

    if data.rainfall < min_r:

        severity = (
            "HIGH"
            if (min_r - data.rainfall) > 40
            else "MODERATE"
        )

        risks.append(
            {
                "title":
                    "Drought / Water Stress Risk",
                "severity":
                    severity,
                "reason":
                    (
                        f"Rainfall "
                        f"({data.rainfall}mm) "
                        f"is lower than preferred "
                        f"minimum ({min_r}mm)."
                    ),
                "mitigation":
                    (
                        "Supplemental drip or canal "
                        "irrigation will be necessary "
                        "during key growth stages."
                    )
            }
        )

    elif data.rainfall > max_r + 50:

        risks.append(
            {
                "title":
                    "Excess Waterlogging Risk",
                "severity":
                    "HIGH",
                "reason":
                    (
                        f"Rainfall "
                        f"({data.rainfall}mm) "
                        f"exceeds preferred "
                        f"drainage capacity ({max_r}mm)."
                    ),
                "mitigation":
                    (
                        "Ensure field drainage "
                        "channels are clear."
                    )
            }
        )

    else:

        risks.append(
            {
                "title":
                    "Rainfall / Water Risk",
                "severity":
                    "LOW",
                "reason":
                    (
                        "Rainfall supply matches "
                        "crop requirement."
                    ),
                "mitigation":
                    (
                        "Regular moisture "
                        "monitoring recommended."
                    )
            }
        )

    min_ph, max_ph, _ = reqs["ph"]

    if data.ph < min_ph:

        risks.append(
            {
                "title":
                    "Soil Acid Toxicity Risk",
                "severity":
                    (
                        "MODERATE"
                        if (min_ph - data.ph) < 1.0
                        else "HIGH"
                    ),
                "reason":
                    (
                        f"Soil pH ({data.ph}) "
                        f"is lower than target "
                        f"range ({min_ph}-{max_ph})."
                    ),
                "mitigation":
                    (
                        "Apply agricultural lime "
                        "(calcium carbonate) to "
                        "neutralize soil acidity."
                    )
            }
        )

    elif data.ph > max_ph:

        risks.append(
            {
                "title":
                    "Alkaline Nutrient Lockout Risk",
                "severity":
                    (
                        "MODERATE"
                        if (data.ph - max_ph) < 1.0
                        else "HIGH"
                    ),
                "reason":
                    (
                        f"Soil pH ({data.ph}) "
                        f"is higher than target "
                        f"range ({min_ph}-{max_ph})."
                    ),
                "mitigation":
                    (
                        "Apply gypsum or organic "
                        "compost to improve soil "
                        "conditions."
                    )
            }
        )

    else:

        risks.append(
            {
                "title":
                    "Soil pH Risk",
                "severity":
                    "LOW",
                "reason":
                    (
                        "Soil pH is favorable "
                        "for nutrient uptake."
                    ),
                "mitigation":
                    (
                        "Maintain organic "
                        "matter content."
                    )
            }
        )

    return risks


def generate_action_plan(
    data: CropRequest,
    crop_name: str,
    risks: List[Dict[str, Any]]
) -> Dict[str, List[str]]:

    crop_cap = crop_name.capitalize()

    before_planting = [
        (
            f"Perform field leveling and seedbed "
            f"preparation tailored for {crop_cap}."
        ),
        (
            f"Soil test verification: Confirm "
            f"current NPK "
            f"({int(data.N)}-{int(data.P)}-{int(data.K)}) "
            f"and pH ({data.ph})."
        ),
        (
            "Apply organic farmyard manure "
            "(5-10 tonnes/acre) 2 weeks prior "
            "to sowing."
        )
    ]

    during_growth = [
        (
            "Monitor soil moisture levels weekly "
            "at 15cm depth."
        ),
        (
            f"Apply basal fertilizer split doses "
            f"based on growth stages for {crop_cap}."
        ),
        (
            "Inspect lower leaves for early pest "
            "or disease symptoms twice weekly."
        )
    ]

    warnings = []

    for risk in risks:

        if risk["severity"] in [
            "HIGH",
            "MODERATE"
        ]:

            warnings.append(
                f"{risk['title']}: "
                f"{risk['mitigation']}"
            )

    if not warnings:

        warnings.append(
            "No critical risk warnings detected "
            "for current farm conditions."
        )

    next_action = [
        (
            f"Select certified high-yield seed "
            f"varieties suited for {crop_cap}."
        ),
        (
            "Calibrate sowing depth (3-5 cm) "
            "based on current moisture."
        ),
        (
            "Check local Open-Meteo 7-day "
            "forecast before sowing."
        )
    ]

    return {
        "before_planting": before_planting,
        "during_growth": during_growth,
        "warning": warnings,
        "next_action": next_action
    }


# ============================================================
# AUTH ROUTES
# ============================================================

@app.post("/auth/signup")
def signup(data: SignupRequest):

    if (
        not data.mobile.isdigit()
        or len(data.mobile) != 10
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Mobile number must contain "
                "exactly 10 digits."
            )
        )

    if data.mobile == "Admin":

        raise HTTPException(
            status_code=400,
            detail="Invalid mobile number."
        )

    conn = _db()

    try:

        existing = conn.execute(
            "SELECT id FROM users WHERE mobile = ?",
            (data.mobile,)
        ).fetchone()

        if existing:

            raise HTTPException(
                status_code=409,
                detail=(
                    "An account with this mobile "
                    "number already exists."
                )
            )

        now = datetime.now(
            timezone.utc
        ).isoformat()

        cur = conn.execute(
            """
            INSERT INTO users
            (name, mobile, location,
             password_hash, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                data.name.strip(),
                data.mobile,
                data.location.strip(),
                _hash_password(data.password),
                now
            )
        )

        conn.execute(
            """
            INSERT INTO activity
            (mobile, action, created_at)
            VALUES (?, ?, ?)
            """,
            (
                data.mobile,
                "account_created",
                now
            )
        )

        conn.commit()

        token = _make_token(
            str(cur.lastrowid),
            "user",
            data.mobile
        )

        return {
            "success": True,
            "token": token,
            "role": "user",
            "user": {
                "id": cur.lastrowid,
                "name": data.name.strip(),
                "mobile": data.mobile,
                "location": data.location.strip()
            }
        }

    finally:

        conn.close()


@app.post(
    "/auth/login",
    response_model=AuthResponse
)
def login(data: LoginRequest):

    identifier = data.identifier.strip()

    if (
        identifier == "Admin"
        and data.password == "admin@9"
    ):

        return {
            "success": True,
            "token": _make_token(
                "ADMIN",
                "admin",
                "Admin"
            ),
            "role": "admin",
            "user": {
                "id": "ADMIN",
                "name": "Administrator",
                "mobile": "Admin",
                "location": "AgriNivara"
            }
        }

    if (
        not identifier.isdigit()
        or len(identifier) != 10
    ):

        raise HTTPException(
            status_code=401,
            detail=(
                "Invalid username/mobile "
                "number or password."
            )
        )

    conn = _db()

    try:

        row = conn.execute(
            """
            SELECT id, name, mobile,
                   location, password_hash
            FROM users
            WHERE mobile = ?
            """,
            (identifier,)
        ).fetchone()

        if (
            not row
            or not _verify_password(
                data.password,
                row["password_hash"]
            )
        ):

            raise HTTPException(
                status_code=401,
                detail=(
                    "Invalid username/mobile "
                    "number or password."
                )
            )

        now = datetime.now(
            timezone.utc
        ).isoformat()

        conn.execute(
            """
            INSERT INTO activity
            (mobile, action, created_at)
            VALUES (?, ?, ?)
            """,
            (
                identifier,
                "login",
                now
            )
        )

        conn.commit()

        return {
            "success": True,
            "token": _make_token(
                str(row["id"]),
                "user",
                row["mobile"]
            ),
            "role": "user",
            "user": {
                "id": row["id"],
                "name": row["name"],
                "mobile": row["mobile"],
                "location": row["location"]
            }
        }

    finally:

        conn.close()


@app.get("/auth/me")
def auth_me(
    authorization: Optional[str] = Header(
        default=None
    )
):

    payload = _require_token(
        authorization
    )

    if payload["role"] == "admin":

        return {
            "success": True,
            "role": "admin",
            "user": {
                "id": "ADMIN",
                "name": "Administrator",
                "mobile": "Admin"
            }
        }

    conn = _db()

    try:

        row = conn.execute(
            """
            SELECT id, name, mobile, location
            FROM users
            WHERE id = ?
            """,
            (payload["uid"],)
        ).fetchone()

        if not row:

            raise HTTPException(
                status_code=401,
                detail=(
                    "User account no longer exists."
                )
            )

        return {
            "success": True,
            "role": "user",
            "user": dict(row)
        }

    finally:

        conn.close()


# ============================================================
# ADMIN / FARMER ROUTES
# ============================================================

@app.get("/admin/farmers")
def admin_farmers(
    authorization: Optional[str] = Header(
        default=None
    )
):

    payload = _require_token(
        authorization
    )

    if payload["role"] != "admin":

        raise HTTPException(
            status_code=403,
            detail="Admin access required."
        )

    conn = _db()

    try:

        rows = conn.execute(
            """
            SELECT id, name, mobile,
                   location, created_at
            FROM users
            ORDER BY id DESC
            """
        ).fetchall()

        return {
            "success": True,
            "farmers": [
                dict(row)
                for row in rows
            ]
        }

    finally:

        conn.close()


@app.get("/farmer/help")
def farmer_help_list(
    authorization: Optional[str] = Header(
        default=None
    )
):

    payload = _require_token(
        authorization
    )

    conn = _db()

    try:

        if payload["role"] == "admin":

            rows = conn.execute(
                """
                SELECT *
                FROM help_requests
                ORDER BY id DESC
                """
            ).fetchall()

        else:

            rows = conn.execute(
                """
                SELECT *
                FROM help_requests
                WHERE user_id = ?
                ORDER BY id DESC
                """,
                (payload["uid"],)
            ).fetchall()

        return {
            "success": True,
            "requests": [
                dict(row)
                for row in rows
            ]
        }

    finally:

        conn.close()


@app.post("/farmer/help")
async def create_help_request(
    authorization: Optional[str] = Header(
        default=None
    ),
    message: str = Form(...),
    image: Optional[UploadFile] = File(
        default=None
    )
):

    payload = _require_token(
        authorization
    )

    if payload["role"] != "user":

        raise HTTPException(
            status_code=403,
            detail="Farmer access required."
        )

    message = message.strip()

    if not message and not image:

        raise HTTPException(
            status_code=400,
            detail=(
                "Please enter a message "
                "or attach an image."
            )
        )

    image_data = None

    if image:

        raw = await image.read()

        if len(raw) > 3 * 1024 * 1024:

            raise HTTPException(
                status_code=413,
                detail=(
                    "Image must be smaller "
                    "than 3 MB."
                )
            )

        mime = (
            image.content_type
            or "image/jpeg"
        )

        image_data = (
            "data:"
            + mime
            + ";base64,"
            + base64.b64encode(raw).decode()
        )

    conn = _db()

    try:

        user = conn.execute(
            """
            SELECT id, name, mobile
            FROM users
            WHERE id = ?
            """,
            (payload["uid"],)
        ).fetchone()

        if not user:

            raise HTTPException(
                status_code=401,
                detail="User account not found."
            )

        now = datetime.now(
            timezone.utc
        ).isoformat()

        cur = conn.execute(
            """
            INSERT INTO help_requests
            (
                user_id,
                name,
                mobile,
                message,
                image_data,
                status,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user["id"],
                user["name"],
                user["mobile"],
                message,
                image_data,
                "Open",
                now
            )
        )

        conn.commit()

        return {
            "success": True,
            "id": cur.lastrowid,
            "message": (
                "Help request sent to "
                "AgriNivara support."
            )
        }

    finally:

        conn.close()


@app.patch("/admin/help/{request_id}")
def update_help_request(
    request_id: int,
    authorization: Optional[str] = Header(
        default=None
    ),
    status: str = "Resolved",
    admin_reply: str = ""
):

    payload = _require_token(
        authorization
    )

    if payload["role"] != "admin":

        raise HTTPException(
            status_code=403,
            detail="Admin access required."
        )

    if status not in {
        "Open",
        "In Progress",
        "Resolved"
    }:

        raise HTTPException(
            status_code=400,
            detail="Invalid status."
        )

    conn = _db()

    try:

        conn.execute(
            """
            UPDATE help_requests
            SET status = ?,
                admin_reply = ?
            WHERE id = ?
            """,
            (
                status,
                admin_reply.strip(),
                request_id
            )
        )

        conn.commit()

        return {
            "success": True
        }

    finally:

        conn.close()


# ============================================================
# ALERTS
# ============================================================

@app.get("/alerts")
def get_alerts(
    authorization: Optional[str] = Header(
        default=None
    )
):

    payload = _require_token(
        authorization
    )

    conn = _db()

    try:

        if payload["role"] == "admin":

            rows = conn.execute(
                """
                SELECT *
                FROM alerts
                ORDER BY id DESC
                """
            ).fetchall()

        else:

            rows = conn.execute(
                """
                SELECT *
                FROM alerts
                WHERE user_id IS NULL
                   OR user_id = ?
                ORDER BY id DESC
                """,
                (payload["uid"],)
            ).fetchall()

        return {
            "success": True,
            "alerts": [
                dict(row)
                for row in rows
            ]
        }

    finally:

        conn.close()


@app.post("/admin/alerts")
async def send_alert(
    authorization: Optional[str] = Header(
        default=None
    ),
    title: str = Form(...),
    message: str = Form(...),
    user_id: Optional[str] = Form(
        default="all"
    ),
    image: Optional[UploadFile] = File(
        default=None
    )
):

    payload = _require_token(
        authorization
    )

    if payload["role"] != "admin":

        raise HTTPException(
            status_code=403,
            detail="Admin access required."
        )

    title = title.strip()
    message = message.strip()

    if not title or not message:

        raise HTTPException(
            status_code=400,
            detail="Title and message are required."
        )

    image_data = None

    if image:

        raw = await image.read()

        if len(raw) > 3 * 1024 * 1024:

            raise HTTPException(
                status_code=413,
                detail=(
                    "Image must be smaller "
                    "than 3 MB."
                )
            )

        mime = (
            image.content_type
            or "image/jpeg"
        )

        image_data = (
            "data:"
            + mime
            + ";base64,"
            + base64.b64encode(raw).decode()
        )

    uid = (
        None
        if not user_id
        or user_id == "all"
        else int(user_id)
    )

    conn = _db()

    try:

        now = datetime.now(
            timezone.utc
        ).isoformat()

        cur = conn.execute(
            """
            INSERT INTO alerts
            (
                user_id,
                title,
                message,
                image_data,
                created_at
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                uid,
                title,
                message,
                image_data,
                now
            )
        )

        conn.commit()

        return {
            "success": True,
            "id": cur.lastrowid
        }

    finally:

        conn.close()


@app.post("/alerts/{alert_id}/read")
def mark_alert_read(
    alert_id: int,
    authorization: Optional[str] = Header(
        default=None
    )
):

    payload = _require_token(
        authorization
    )

    if payload["role"] != "user":

        raise HTTPException(
            status_code=403,
            detail="Farmer access required."
        )

    conn = _db()

    try:

        conn.execute(
            """
            UPDATE alerts
            SET read_by_user = 1
            WHERE id = ?
              AND (
                  user_id IS NULL
                  OR user_id = ?
              )
            """,
            (
                alert_id,
                payload["uid"]
            )
        )

        conn.commit()

        return {
            "success": True
        }

    finally:

        conn.close()


@app.get("/admin/stats")
def admin_stats(
    authorization: Optional[str] = Header(
        default=None
    )
):

    payload = _require_token(
        authorization
    )

    if payload["role"] != "admin":

        raise HTTPException(
            status_code=403,
            detail="Admin access required."
        )

    conn = _db()

    try:

        users = conn.execute(
            "SELECT COUNT(*) AS c FROM users"
        ).fetchone()["c"]

        logins = conn.execute(
            """
            SELECT COUNT(*) AS c
            FROM activity
            WHERE action = 'login'
            """
        ).fetchone()["c"]

        accounts = conn.execute(
            """
            SELECT COUNT(*) AS c
            FROM activity
            WHERE action = 'account_created'
            """
        ).fetchone()["c"]

        return {
            "success": True,
            "total_users": users,
            "total_logins": logins,
            "accounts_created": accounts,
            "system": (
                "AgriNivara AI Farm "
                "Decision Support System"
            ),
            "status": "Operational"
        }

    finally:

        conn.close()


# ============================================================
# SYSTEM / HEALTH
# ============================================================

@app.get("/")
def home():
    index_file = FRONTEND_DIST / "index.html"
    print(f"Checking FRONTEND_DIST index.html: {index_file} (exists={index_file.exists()})")
    if index_file.exists():
        return FileResponse(index_file)

    return {
        "message": (
            "AgriNivara AI Farm "
            "Decision Support API is running"
        ),
        "status": "success",
        "version": "2.6.0",
        "crop_model_loaded": (
            crop_model is not None
        ),
        "plant_disease_model_loaded": (
            disease_model_loader.get_model() is not None
        )
    }



@app.get("/health")
def health():
    disease_info = disease_model_loader.info()
    return {
        "status": "healthy",
        "service_ready": crop_model is not None,
        "crop_model_loaded": crop_model is not None,
        "plant_disease_model_loaded": disease_info["loaded"],
        "plant_disease_model_status": disease_info["status"],
        "tensorflow_available": tf is not None,
        "plant_disease_model": disease_info,
    }


# ============================================================
# CROP PREDICTION
# ============================================================

@app.post("/predict-crop")
def predict_crop(
    data: CropRequest
):

    try:

        input_df = pd.DataFrame(
            [
                {
                    "n": data.N,
                    "p": data.P,
                    "k": data.K,
                    "temperature": data.temperature,
                    "humidity": data.humidity,
                    "ph": data.ph,
                    "rainfall": data.rainfall,
                }
            ]
        )

        prediction = str(
            crop_model.predict(
                input_df
            )[0]
        )

        confidence = None

        if hasattr(
            crop_model,
            "predict_proba"
        ):

            probs = crop_model.predict_proba(
                input_df
            )[0]

            confidence = float(
                probs.max() * 100
            )

        top_predictions = []

        if hasattr(
            crop_model,
            "predict_proba"
        ):

            probs = crop_model.predict_proba(
                input_df
            )[0]

            classes = crop_model.classes_

            top_indices = np.argsort(
                probs
            )[::-1][:3]

            for idx in top_indices:

                top_predictions.append(
                    {
                        "crop":
                            str(classes[idx]),
                        "confidence":
                            round(
                                float(
                                    probs[idx] * 100
                                ),
                                2
                            )
                    }
                )

        return {
            "success": True,
            "recommended_crop": prediction,
            "confidence": (
                round(
                    confidence,
                    2
                )
                if confidence is not None
                else None
            ),
            "top_predictions":
                top_predictions,
            "input_features": {
                "N": data.N,
                "P": data.P,
                "K": data.K,
                "temperature":
                    data.temperature,
                "humidity":
                    data.humidity,
                "ph": data.ph,
                "rainfall":
                    data.rainfall
            }
        }

    except Exception as e:

        print(
            f"Crop prediction error: {e}"
        )

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=(
                f"Crop prediction failed: {str(e)}"
            )
        )


# ============================================================
# FARM ANALYSIS
# ============================================================

@app.post("/farm-analysis")
def farm_analysis(
    data: FarmAnalysisRequest
):

    try:

        input_df = pd.DataFrame(
            [
                {
                    "n": data.N,
                    "p": data.P,
                    "k": data.K,
                    "temperature":
                        data.temperature,
                    "humidity":
                        data.humidity,
                    "ph": data.ph,
                    "rainfall":
                        data.rainfall,
                }
            ]
        )

        rec_crop = str(
            crop_model.predict(
                input_df
            )[0]
        )

        target_crop = (
            data.selected_crop
            if data.selected_crop
            else rec_crop
        )

        confidence = 0.0
        top_predictions = []

        if hasattr(
            crop_model,
            "predict_proba"
        ):

            probs = crop_model.predict_proba(
                input_df
            )[0]

            confidence = round(
                float(
                    probs.max() * 100
                ),
                2
            )

            classes = crop_model.classes_

            top_indices = np.argsort(
                probs
            )[::-1][:3]

            for idx in top_indices:

                top_predictions.append(
                    {
                        "crop":
                            str(classes[idx]),
                        "confidence":
                            round(
                                float(
                                    probs[idx] * 100
                                ),
                                2
                            )
                    }
                )

        explainability = (
            evaluate_explainability(
                data,
                target_crop
            )
        )

        suitability = (
            calculate_suitability_scores(
                data,
                target_crop
            )
        )

        risks = generate_risk_analysis(
            data,
            target_crop
        )

        action_plan = generate_action_plan(
            data,
            target_crop,
            risks
        )

        n_level = (
            "HIGH"
            if data.N > 80
            else (
                "LOW"
                if data.N < 40
                else "MODERATE"
            )
        )

        p_level = (
            "HIGH"
            if data.P > 60
            else (
                "LOW"
                if data.P < 30
                else "MODERATE"
            )
        )

        k_level = (
            "HIGH"
            if data.K > 60
            else (
                "LOW"
                if data.K < 30
                else "MODERATE"
            )
        )

        ph_status = (
            "ACIDIC"
            if data.ph < 6.0
            else (
                "ALKALINE"
                if data.ph > 7.5
                else "SUITABLE"
            )
        )

        alternative_analysis = []

        for item in top_predictions:

            c_name = item["crop"]

            c_suit = (
                calculate_suitability_scores(
                    data,
                    c_name
                )
            )

            c_risks = (
                generate_risk_analysis(
                    data,
                    c_name
                )
            )

            high_risk_count = sum(
                1
                for r in c_risks
                if r["severity"] == "HIGH"
            )

            risk_rating = (
                "HIGH"
                if high_risk_count >= 2
                else (
                    "MODERATE"
                    if high_risk_count == 1
                    else "LOW"
                )
            )

            alternative_analysis.append(
                {
                    "crop": c_name,
                    "confidence":
                        item["confidence"],
                    "soil_fit":
                        f"{c_suit['soil']}%",
                    "weather_fit":
                        f"{c_suit['weather']}%",
                    "water_fit":
                        f"{c_suit['water']}%",
                    "risk_rating":
                        risk_rating
                }
            )

        return {
            "success": True,
            "recommended_crop": rec_crop,
            "target_crop": target_crop,
            "confidence": confidence,
            "top_predictions":
                top_predictions,
            "explainability":
                explainability,
            "suitability_scores":
                suitability,
            "risk_analysis":
                risks,
            "action_plan":
                action_plan,
            "alternative_analysis":
                alternative_analysis,
            "soil_intelligence": {
                "N": n_level,
                "P": p_level,
                "K": k_level,
                "ph": ph_status,
                "disclaimer":
                    (
                        "General decision-support "
                        "indicators, not a replacement "
                        "for laboratory soil testing."
                    )
            },
            "data_integrity": {
                "ml_method":
                    "Random Forest Classifier",
                "xai_method":
                    "Feature Bound Agronomic "
                    "Rule-Engine",
                "live_weather":
                    "Open-Meteo API",
                "simulation":
                    "What-If Real-time "
                    "Inference Engine"
            }
        }

    except Exception as e:

        print(
            f"Farm analysis error: {e}"
        )

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=(
                f"Farm analysis failed: {str(e)}"
            )
        )


# ============================================================
# WHAT-IF SIMULATION
# ============================================================

@app.post("/what-if")
def what_if_simulation(
    req: WhatIfRequest
):

    try:

        curr_res = predict_crop(
            req.current
        )

        chan_res = predict_crop(
            req.changed
        )

        curr_crop = (
            curr_res["recommended_crop"]
        )

        chan_crop = (
            chan_res["recommended_crop"]
        )

        changed = (
            curr_crop != chan_crop
        )

        deltas = []

        if (
            req.current.rainfall
            != req.changed.rainfall
        ):

            deltas.append(
                (
                    f"Rainfall shifted from "
                    f"{req.current.rainfall}mm "
                    f"to "
                    f"{req.changed.rainfall}mm"
                )
            )

        if (
            req.current.temperature
            != req.changed.temperature
        ):

            deltas.append(
                (
                    f"Temperature shifted from "
                    f"{req.current.temperature}°C "
                    f"to "
                    f"{req.changed.temperature}°C"
                )
            )

        if (
            req.current.N
            != req.changed.N
        ):

            deltas.append(
                (
                    f"Nitrogen shifted from "
                    f"{req.current.N} "
                    f"to {req.changed.N}"
                )
            )

        if (
            req.current.ph
            != req.changed.ph
        ):

            deltas.append(
                (
                    f"pH shifted from "
                    f"{req.current.ph} "
                    f"to {req.changed.ph}"
                )
            )

        delta_str = (
            ", ".join(deltas)
            if deltas
            else "Parameters modified"
        )

        if changed:

            explanation = (
                f"{delta_str}, causing "
                f"recommended crop to change "
                f"from {curr_crop.capitalize()} "
                f"({curr_res['confidence']}%) "
                f"to {chan_crop.capitalize()} "
                f"({chan_res['confidence']}%)."
            )

        else:

            explanation = (
                f"{delta_str}. The recommendation "
                f"remains optimal for "
                f"{curr_crop.capitalize()} "
                f"(Confidence: "
                f"{chan_res['confidence']}%)."
            )

        return {
            "success": True,
            "crop_changed": changed,
            "explanation": explanation,
            "current": curr_res,
            "changed": chan_res
        }

    except Exception as e:

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=(
                "What-If simulation failed: "
                f"{str(e)}"
            )
        )


# Basic farmer-facing guidance for the classes produced by the model.
# This is decision support only; severe cases should be confirmed by an agronomist.
DISEASE_GUIDANCE = {
    "healthy": {"treatment": "No disease pattern detected. Continue balanced irrigation, nutrition, and regular scouting.", "prevention": "Keep foliage dry when possible, remove fallen leaves, and monitor weekly."},
    "Apple___Apple_scab": {"treatment": "Remove infected leaves and fruit; improve airflow and follow a locally approved fungicide schedule.", "prevention": "Prune for airflow and remove fallen infected leaves."},
    "Apple___Black_rot": {"treatment": "Remove mummified fruit and infected tissue; use a locally approved fungicide if advised.", "prevention": "Sanitize pruning tools and avoid leaving dead fruit on the tree."},
    "Apple___Cedar_apple_rust": {"treatment": "Remove badly affected tissue and use a locally approved fungicide when appropriate.", "prevention": "Reduce nearby alternate hosts where practical and maintain good airflow."},
    "Tomato___Early_blight": {"treatment": "Remove lower infected leaves, avoid overhead irrigation, and use an approved fungicide when needed.", "prevention": "Rotate crops, mulch soil, and keep foliage dry."},
    "Tomato___Late_blight": {"treatment": "Remove severely infected material quickly and seek local extension guidance for an approved fungicide.", "prevention": "Improve airflow, avoid prolonged leaf wetness, and scout frequently."},
    "Tomato___Bacterial_spot": {"treatment": "Remove heavily infected leaves and avoid handling wet plants; use only locally approved bactericides if recommended.", "prevention": "Use clean seed/transplants and sanitize tools."},
    "Potato___Early_blight": {"treatment": "Remove infected foliage and improve airflow; use a locally approved fungicide if advised.", "prevention": "Rotate crops and avoid prolonged leaf wetness."},
    "Potato___Late_blight": {"treatment": "Remove infected material and obtain local disease-control guidance promptly.", "prevention": "Use healthy planting material and scout during cool, wet conditions."},
    "Corn_(maize)___Common_rust_": {"treatment": "Scout surrounding plants and use a locally recommended fungicide only when disease pressure warrants it.", "prevention": "Use resistant varieties where available and maintain balanced nutrition."},
    "Grape___Black_rot": {"treatment": "Remove infected berries and leaves; improve canopy airflow and follow local fungicide guidance.", "prevention": "Sanitize vineyard debris and improve canopy ventilation."},
    "Squash___Powdery_mildew": {"treatment": "Remove heavily affected leaves and improve airflow; use an approved fungicide if necessary.", "prevention": "Avoid overcrowding and maintain good sunlight and airflow."},
}

# ============================================================
# PLANT DISEASE DETECTION
# ============================================================

@app.post("/predict-disease")
async def predict_disease(
    file: UploadFile = File(...)
):

    # --------------------------------------------------------
    # MODEL CHECK
    # --------------------------------------------------------

    model = disease_model_loader.get_model()
    loader_info = disease_model_loader.info()

    # Give the background downloader/loader time to finish. This removes the
    # common first-request 503 race after a fresh Railway deployment.
    if model is None and loader_info["status"] in {"loading", "not_started"}:
        if loader_info["status"] == "not_started":
            disease_model_loader.start_background_loading()
        deadline = asyncio.get_running_loop().time() + MODEL_LOAD_WAIT_SECONDS
        while model is None and asyncio.get_running_loop().time() < deadline:
            await asyncio.sleep(0.5)
            model = disease_model_loader.get_model()
        loader_info = disease_model_loader.info()

    if model is None:
        if loader_info["status"] == "failed":
            message = loader_info.get("model_error") or "Plant disease model failed to load."
        else:
            message = "Plant disease model is not ready yet. Please try again."
        raise HTTPException(
            status_code=503,
            detail={"message": message, "model_info": loader_info}
        )

    if tf is None:
        raise HTTPException(
            status_code=503,
            detail={
                "message": "TensorFlow is not available on the server.",
                "model_info": loader_info,
            }
        )

    # --------------------------------------------------------
    # FILE TYPE CHECK
    # --------------------------------------------------------

    allowed_types = {
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Please upload a valid image (JPG, PNG, WEBP)."
        )

    try:
        # ----------------------------------------------------
        # READ IMAGE
        # ----------------------------------------------------

        image_bytes = await file.read()

        if not image_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty."
            )

        print("=" * 70)
        print("PLANT DISEASE PREDICTION")
        print("=" * 70)
        print(f"Received disease image: {file.filename}")
        print(f"Image content type: {file.content_type}")
        print(f"Image size: {len(image_bytes)} bytes")

        # ----------------------------------------------------
        # DECODE IMAGE
        # ----------------------------------------------------

        image = tf.io.decode_image(
            image_bytes,
            channels=3,
            expand_animations=False
        )

        # ----------------------------------------------------
        # RESIZE
        # ----------------------------------------------------

        image = tf.image.resize(
            image,
            [224, 224]
        )

        # ----------------------------------------------------
        # CONVERT TO FLOAT32
        # ----------------------------------------------------

        image = tf.cast(
            image,
            tf.float32
        )

        # ----------------------------------------------------
        # ADD BATCH DIMENSION
        # ----------------------------------------------------

        image = tf.expand_dims(
            image,
            axis=0
        )

        print(f"Prediction input shape: {image.shape}")

        # ----------------------------------------------------
        # MODEL PREDICTION
        # ----------------------------------------------------

        predictions = model.predict(
            image,
            verbose=0
        )

        predictions = np.asarray(predictions)

        if predictions.ndim > 1:
            predictions = predictions[0]

        predictions = predictions.astype(np.float64)

        print(f"Prediction output shape: {predictions.shape}")

        if predictions.size == 0:
            raise RuntimeError(
                "Plant disease model returned an empty prediction."
            )

        # ----------------------------------------------------
        # NORMALIZE OUTPUT
        # ----------------------------------------------------

        prediction_sum = float(np.sum(predictions))

        looks_like_probability = (
            np.all(predictions >= 0)
            and np.all(predictions <= 1)
            and np.isclose(prediction_sum, 1.0, atol=0.05)
        )

        if not looks_like_probability:
            print("Model output appears to be logits. Applying softmax.")

            exp_predictions = np.exp(
                predictions - np.max(predictions)
            )

            predictions = (
                exp_predictions / np.sum(exp_predictions)
            )

        # ----------------------------------------------------
        # BEST PREDICTION
        # ----------------------------------------------------

        predicted_idx = int(
            np.argmax(predictions)
        )

        confidence = float(
            predictions[predicted_idx] * 100
        )

        if predicted_idx < len(PLANT_DISEASE_CLASSES):
            predicted_class = PLANT_DISEASE_CLASSES[predicted_idx]
        else:
            predicted_class = f"class_{predicted_idx}"

        # ----------------------------------------------------
        # TOP 3 PREDICTIONS
        # ----------------------------------------------------

        top_indices = np.argsort(
            predictions
        )[::-1][:min(3, len(predictions))]

        top_predictions = []

        for idx in top_indices:
            idx = int(idx)

            if idx < len(PLANT_DISEASE_CLASSES):
                disease_name = PLANT_DISEASE_CLASSES[idx]
            else:
                disease_name = f"class_{idx}"

            top_predictions.append({
                "disease": disease_name,
                "confidence": round(
                    float(predictions[idx] * 100),
                    2
                )
            })

        print(f"Predicted disease: {predicted_class}")
        print(f"Confidence: {confidence:.2f}%")
        print("=" * 70)

        guidance = DISEASE_GUIDANCE.get(predicted_class)
        if guidance is None:
            crop_name = predicted_class.split("___", 1)[0].replace("_", " ")
            if predicted_class.endswith("___healthy"):
                guidance = DISEASE_GUIDANCE["healthy"]
            else:
                guidance = {
                    "treatment": "Isolate affected plants where practical, remove severely affected leaves, and confirm the diagnosis with a local agriculture expert before applying chemicals.",
                    "prevention": "Maintain field sanitation, good airflow, balanced irrigation, and regular scouting."
                }

        return {
            "success": True,
            "filename": file.filename,
            "predicted_disease": predicted_class,
            "confidence": round(confidence, 2),
            "top_predictions": top_predictions,
            "guidance": guidance,
            "model_status": disease_model_loader.info()
        }

    except HTTPException:
        raise

    except Exception as e:
        print("=" * 70)
        print("DISEASE PREDICTION ERROR")
        print("=" * 70)
        print(f"Error type: {type(e).__name__}")
        print(f"Error: {str(e)}")
        traceback.print_exc()
        print("=" * 70)

        raise HTTPException(
            status_code=500,
            detail=(
                f"Disease prediction failed: {str(e)}"
            )
        )


# ============================================================
# TECHNICAL DETAILS
# ============================================================

@app.get("/technical-details")
def technical_details():

    return {
        "model_architecture":
            "Random Forest Classifier",

        "n_estimators":
            getattr(
                crop_model,
                "n_estimators",
                100
            ),

        "num_classes":
            len(
                getattr(
                    crop_model,
                    "classes_",
                    []
                )
            ),

        "features": [
            "N",
            "P",
            "K",
            "temperature",
            "humidity",
            "ph",
            "rainfall"
        ],

        "crop_model_loaded":
            crop_model is not None,

        "plant_disease_model_loaded":
            disease_model_loader.get_model() is not None,
        "plant_disease_model_error":
            disease_model_loader.info().get("model_error"),
        "plant_disease_model_info":
            disease_model_loader.info(),

        "plant_disease_classes":
            len(
                PLANT_DISEASE_CLASSES
            ),

        "tensorflow_available":
            tf is not None,

        "xai_engine":
            "Agronomic Optimal Bounds Verification Engine",

        "apis_integrated": [
            "FastAPI",
            "Open-Meteo Weather API",
            "OpenStreetMap Nominatim"
        ],

        "version": "2.6.0",

        "platform_status":
            "Production Enterprise Ready"
    }



# ============================================================
# PRODUCTION FRONTEND
# ============================================================

@app.get("/{full_path:path}")
def serve_frontend(
    full_path: str
):

    if not FRONTEND_DIST.exists():

        raise HTTPException(
            status_code=404,
            detail="Frontend build not found."
        )

    requested = (
        FRONTEND_DIST / full_path
    )

    if (
        full_path
        and requested.is_file()
    ):

        return FileResponse(
            requested
        )

    return FileResponse(
        FRONTEND_DIST / "index.html"
    )
