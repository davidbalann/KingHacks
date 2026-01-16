import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .settings import (
    CORS_ORIGINS,
    AUTO_INGEST_ENABLED,
    AUTO_INGEST_SOURCE,
    AUTO_INGEST_PATH,
    AUTO_INGEST_IF_EMPTY,
)
from .schema import init_db
from .db import get_conn

from .api.location import router as location_router
from .api.search import router as search_router
from .api.pickups import router as pickups_router
from .api.backboard import router as backboard_router

# Import the ingest function from your script
from .scripts.inject_geojson import ingest as ingest_geojson

logger = logging.getLogger("caremap")
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Kingston CareMap API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def _startup():
    init_db()

    if not AUTO_INGEST_ENABLED:
        logger.info("Auto-ingest disabled (AUTO_INGEST_ENABLED=0).")
        return

    if not AUTO_INGEST_PATH.exists():
        logger.warning(f"Auto-ingest skipped: GeoJSON not found at {AUTO_INGEST_PATH}")
        return

    if AUTO_INGEST_IF_EMPTY:
        conn = get_conn()
        try:
            count = conn.execute("SELECT COUNT(*) FROM places").fetchone()[0]
        finally:
            conn.close()

        if count > 0:
            logger.info(f"Auto-ingest skipped: places already has {count} rows.")
            return

    logger.info(f"Auto-ingesting GeoJSON on startup: {AUTO_INGEST_PATH} (source={AUTO_INGEST_SOURCE})")
    ingest_geojson(AUTO_INGEST_SOURCE, AUTO_INGEST_PATH)
    logger.info("Auto-ingest complete.")

app.include_router(location_router)
app.include_router(search_router)
app.include_router(pickups_router)
app.include_router(backboard_router)

@app.get("/health")
def health():
    return {"ok": True}
