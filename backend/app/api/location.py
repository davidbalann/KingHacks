from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field, validator

from backend.app.models.user_locations import (
    DEFAULT_RADIUS_KM,
    find_nearby_listings,
    get_user_location,
    save_user_location,
)

router = APIRouter()


class LocationPayload(BaseModel):
    user_id: str = Field(..., min_length=1, description="Identifier for the requesting user")
    latitude: float = Field(..., description="Latitude in decimal degrees")
    longitude: float = Field(..., description="Longitude in decimal degrees")

    @validator("user_id")
    def strip_user_id(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("user_id cannot be blank.")
        return cleaned


@router.post("/location")
async def store_location(payload: LocationPayload):
    try:
        save_user_location(payload.user_id, payload.latitude, payload.longitude)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to save location")

    return {"message": "Location saved"}


@router.get("/location/nearby")
async def get_nearby_services(
    user_id: Optional[str] = Query(
        default=None,
        description="User identifier to use the saved location if latitude/longitude are not provided.",
    ),
    latitude: Optional[float] = Query(default=None, description="Latitude in decimal degrees"),
    longitude: Optional[float] = Query(default=None, description="Longitude in decimal degrees"),
    distance_km: float = Query(default=DEFAULT_RADIUS_KM, gt=0, description="Search radius in kilometers"),
    limit: int = Query(default=50, ge=1, le=200, description="Maximum number of results to return"),
):
    origin_lat = latitude
    origin_lon = longitude

    if origin_lat is None or origin_lon is None:
        if not user_id:
            raise HTTPException(
                status_code=400,
                detail="Provide latitude/longitude or a user_id with a stored location.",
            )
        stored_location = get_user_location(user_id)
        if not stored_location:
            raise HTTPException(status_code=404, detail="No stored location found for the given user_id.")
        origin_lat, origin_lon = stored_location

    try:
        nearby = find_nearby_listings(origin_lat, origin_lon, radius_km=distance_km, limit=limit)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch nearby listings")

    return {
        "origin": {"latitude": origin_lat, "longitude": origin_lon, "distance_km": distance_km},
        "count": len(nearby),
        "results": nearby,
    }
