import json
from fastapi import APIRouter, Query
from typing import Optional

from ..db import get_conn
from ..geo import haversine_km, bbox
from ..models import Place

router = APIRouter()

@router.get("/location/nearby", response_model=list[Place])
def nearby_locations(
    latitude: float = Query(...),
    longitude: float = Query(...),
    radius_km: float = Query(3.0, ge=0.1, description="Search radius in kilometers (default 3km)"),
    limit: int = Query(50, ge=1, le=200),
    category: Optional[str] = Query(None, description="Optional category filter"),
):
    lat_min, lat_max, lon_min, lon_max = bbox(latitude, longitude, radius_km)

    q = """
      SELECT id, name, category, address, latitude, longitude, phone, website, hours_json, last_verified
      FROM places
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        AND latitude BETWEEN ? AND ?
        AND longitude BETWEEN ? AND ?
    """
    params = [lat_min, lat_max, lon_min, lon_max]

    if category:
        q += " AND category = ?"
        params.append(category)

    conn = get_conn()
    rows = conn.execute(q, params).fetchall()
    conn.close()

    scored: list[tuple[float, dict]] = []
    for r in rows:
        d = haversine_km(latitude, longitude, r["latitude"], r["longitude"])
        if d <= radius_km:
            scored.append((d, r))

    scored.sort(key=lambda x: x[0])
    scored = scored[:limit]

    out: list[Place] = []
    for _, r in scored:
        hours = json.loads(r["hours_json"]) if r["hours_json"] else None
        out.append(
            Place(
                id=r["id"],
                name=r["name"],
                category=r["category"],
                address=r["address"],
                latitude=r["latitude"],
                longitude=r["longitude"],
                phone=r["phone"],
                website=r["website"],
                hours=hours,
                last_verified=r["last_verified"],
            )
        )
    return out
