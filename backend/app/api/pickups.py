from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional

from ..db import get_conn
from ..geo import haversine_km, bbox
from ..settings import PICKUP_PIN

router = APIRouter()

def _parse_iso(dt_str: str) -> datetime:
    """
    Parse ISO timestamps.
    Accepts 'Z' suffix.
    """
    s = dt_str.strip()
    if s.endswith("Z"):
        s = s[:-1] + "+00:00"
    return datetime.fromisoformat(s)

class PickupCreate(BaseModel):
    pin: str
    place_id: Optional[int] = None
    business_name: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    window_start: str   # ISO datetime
    window_end: str     # ISO datetime
    notes: Optional[str] = None
    claim_rule: Optional[str] = None
    expires_at: Optional[str] = None

@router.post("/pickups")
def create_pickup(p: PickupCreate):
    if p.pin != PICKUP_PIN:
        raise HTTPException(status_code=401, detail="Invalid PIN")

    try:
        ws = _parse_iso(p.window_start)
        we = _parse_iso(p.window_end)
    except Exception:
        raise HTTPException(status_code=400, detail="window_start/window_end must be valid ISO datetimes")

    if ws >= we:
        raise HTTPException(status_code=400, detail="window_start must be before window_end")

    conn = get_conn()
    conn.execute(
        """
        INSERT INTO pickups(place_id, business_name, address, latitude, longitude,
                            window_start, window_end, notes, claim_rule, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            p.place_id,
            p.business_name,
            p.address,
            p.latitude,
            p.longitude,
            ws.astimezone(timezone.utc).isoformat().replace("+00:00", "Z"),
            we.astimezone(timezone.utc).isoformat().replace("+00:00", "Z"),
            p.notes,
            p.claim_rule,
            p.expires_at,
        ),
    )
    conn.commit()
    conn.close()
    return {"ok": True}

@router.get("/pickups/nearby")
def pickups_nearby(
    latitude: float = Query(...),
    longitude: float = Query(...),
    radius_km: float = Query(3.0, ge=0.1, description="Search radius in kilometers (default 3km)"),
    limit: int = Query(50, ge=1, le=200),
):
    lat_min, lat_max, lon_min, lon_max = bbox(latitude, longitude, radius_km)

    conn = get_conn()
    rows = conn.execute(
        """
        SELECT *
        FROM pickups
        WHERE active = 1
          AND latitude IS NOT NULL AND longitude IS NOT NULL
          AND latitude BETWEEN ? AND ?
          AND longitude BETWEEN ? AND ?
        ORDER BY window_end ASC
        LIMIT 500
        """,
        (lat_min, lat_max, lon_min, lon_max),
    ).fetchall()
    conn.close()

    out = []
    for r in rows:
        d = haversine_km(latitude, longitude, r["latitude"], r["longitude"])
        if d <= radius_km:
            out.append(dict(r))
            if len(out) >= limit:
                break

    return out
