import json
from fastapi import APIRouter, Query
from typing import Optional

from ..db import get_conn
from ..models import Place

router = APIRouter()

@router.get("/search", response_model=list[Place])
def search(
    category: Optional[str] = Query(None, description="Category id (e.g., meals, shelter, dropin)"),
    name: Optional[str] = Query(None, description="Partial name match"),
    limit: int = Query(50, ge=1, le=200),
):
    q = """
      SELECT id, name, category, address, latitude, longitude, phone, website, hours_json, last_verified
      FROM places
      WHERE 1=1
    """
    params: list = []

    if category:
        q += " AND category = ?"
        params.append(category)

    if name:
        # Case-insensitive match in SQLite using COLLATE NOCASE
        q += " AND name LIKE ? COLLATE NOCASE"
        params.append(f"%{name}%")

    q += " ORDER BY name ASC LIMIT ?"
    params.append(limit)

    conn = get_conn()
    rows = conn.execute(q, params).fetchall()
    conn.close()

    out: list[Place] = []
    for r in rows:
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
