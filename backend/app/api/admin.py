import asyncio
import logging
import time

from fastapi import APIRouter, HTTPException
from backend.app.services.scraper import refresh_listings_from_sources

# Prefix will be applied when including the router in main.py
router = APIRouter(tags=["admin"])
logger = logging.getLogger(__name__)


@router.post("/refresh")
async def refresh_listings():
    logger.info("Admin-triggered listings refresh started")

    start_time = time.perf_counter()  # Start timing

    try:
        loop = asyncio.get_running_loop()
        count = await loop.run_in_executor(None, refresh_listings_from_sources)

        # Calculate duration
        duration = time.perf_counter() - start_time

        logger.info("Admin refresh completed successfully", extra={"inserted": count, "duration": duration})
        return {"inserted": count, "status": "ok", "duration_seconds": duration}

    except Exception as exc:
        logger.exception("Admin refresh failed")
        # Expose a non-internal error message to the user
        raise HTTPException(status_code=500, detail="Listings refresh failed")

