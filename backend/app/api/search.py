# backend/app/api/search.py

import math
import sqlite3
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from backend.app.models.listings import get_db

router = APIRouter()


@router.get("/search")
async def search_services(
    category: Optional[str] = Query(default=None),
    location: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1, description="Page number (1-indexed)"),
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
        description="Number of results per page (max 100)",
    ),
):
    conn = get_db()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    category_filter = category or ""
    location_filter = location or ""

    query_filter = "FROM listings WHERE category LIKE ? AND address LIKE ?"
    params = (f"%{category_filter}%", f"%{location_filter}%")

    try:
        total_count = cursor.execute(f"SELECT COUNT(*) {query_filter}", params).fetchone()[0]
        offset = (page - 1) * limit
        cursor.execute(
            f"SELECT * {query_filter} ORDER BY name LIMIT ? OFFSET ?",
            (*params, limit, offset),
        )
        listings = cursor.fetchall()
    except Exception as exc:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Failed to execute search: {exc}")

    conn.close()

    return {
        "results": [dict(row) for row in listings],
        "page": page,
        "limit": limit,
        "total": total_count,
        "pages": math.ceil(total_count / limit) if total_count else 0,
    }
