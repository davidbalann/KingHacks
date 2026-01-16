import os
from pathlib import Path
from dotenv import load_dotenv

# backend/ directory (settings.py is backend/app/settings.py)
BASE_DIR = Path(__file__).resolve().parents[1]

# Always load backend/.env (not dependent on where you run uvicorn from)
load_dotenv(dotenv_path=BASE_DIR / ".env")

# --- DB ---
_db = os.getenv("DB_PATH", "kingston_caremap.db")
DB_PATH = Path(_db)
if not DB_PATH.is_absolute():
    DB_PATH = BASE_DIR / DB_PATH

# --- Pickups ---
PICKUP_PIN = os.getenv("PICKUP_PIN", "1234")

# --- CORS ---
_raw_cors = os.getenv("CORS_ORIGINS", "*").strip()
if _raw_cors == "*":
    CORS_ORIGINS = ["*"]
else:
    CORS_ORIGINS = [o.strip() for o in _raw_cors.split(",") if o.strip()]

# --- Auto ingest (GeoJSON) ---
AUTO_INGEST_ENABLED = os.getenv("AUTO_INGEST_ENABLED", "1").strip() in ("1", "true", "yes", "y")
AUTO_INGEST_SOURCE = os.getenv("AUTO_INGEST_SOURCE", "kingston_services").strip()

_geo = os.getenv("AUTO_INGEST_PATH", "kingston_services.geojson").strip()
AUTO_INGEST_PATH = Path(_geo)
if not AUTO_INGEST_PATH.is_absolute():
    AUTO_INGEST_PATH = BASE_DIR / AUTO_INGEST_PATH

# If true: only ingest when places table is empty (best for --reload)
AUTO_INGEST_IF_EMPTY = os.getenv("AUTO_INGEST_IF_EMPTY", "1").strip() in ("1", "true", "yes", "y")

# --- Backboard ---
BACKBOARD_API_KEY = os.getenv("BACKBOARD_API_KEY", "").strip()
BACKBOARD_API_URL = os.getenv("BACKBOARD_API_URL", "https://app.backboard.io/api").strip()
BACKBOARD_MODEL = os.getenv("BACKBOARD_MODEL", "gpt-4o").strip()
BACKBOARD_MEMORY_ENABLED = os.getenv("BACKBOARD_MEMORY_ENABLED", "1").strip() in ("1", "true", "yes", "y")
BACKBOARD_MEMORY_MAX_TOKENS = int(os.getenv("BACKBOARD_MEMORY_MAX_TOKENS", "1000"))
