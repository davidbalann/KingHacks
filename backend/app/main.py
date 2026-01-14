# backend/app/main.py

import asyncio
import logging

from fastapi import FastAPI
from backend.app.api.memory import router as memory_router
from .api import search, watchlist, pickup, admin
from .services.scraper import refresh_listings_from_sources

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI()

# Include API routers
app.include_router(search.router)
app.include_router(watchlist.router)
app.include_router(pickup.router)
app.include_router(admin.router, prefix="/admin")
app.include_router(memory_router)

@app.on_event("startup")
async def load_data_on_startup():
    loop = asyncio.get_running_loop()
    try:
        logger.info("Running startup listings refresh")
        await loop.run_in_executor(None, refresh_listings_from_sources)
    except Exception:
        # Log and continue so the API can still boot if data refresh fails
        logger.exception("Failed to refresh listings during startup")

# Example root route
@app.get("/")
def read_root():
    return {"message": "Welcome to Kingston CareMap Backend"}
