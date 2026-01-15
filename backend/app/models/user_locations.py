import math
import sqlite3
from datetime import datetime
from typing import Dict, List, Optional, Tuple

DB_PATH = "kingston_caremap.db"
DEFAULT_RADIUS_KM = 5.0


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _ensure_table(cursor: sqlite3.Cursor) -> None:
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS user_locations (
            user_id TEXT PRIMARY KEY,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            updated_at TEXT NOT NULL
        )
        """
    )


def save_user_location(user_id: str, latitude: float, longitude: float) -> None:
    if not user_id or not user_id.strip():
        raise ValueError("user_id is required.")
    _validate_coordinates(latitude, longitude)

    conn = _connect()
    cursor = conn.cursor()
    _ensure_table(cursor)

    timestamp = datetime.utcnow().isoformat()
    try:
        cursor.execute(
            """
            INSERT INTO user_locations (user_id, latitude, longitude, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                latitude=excluded.latitude,
                longitude=excluded.longitude,
                updated_at=excluded.updated_at
            """,
            (user_id.strip(), latitude, longitude, timestamp),
        )
        conn.commit()
    finally:
        conn.close()


def get_user_location(user_id: str) -> Optional[Tuple[float, float]]:
    conn = _connect()
    cursor = conn.cursor()
    _ensure_table(cursor)

    row = cursor.execute(
        "SELECT latitude, longitude FROM user_locations WHERE user_id = ?",
        (user_id,),
    ).fetchone()
    conn.close()

    if not row:
        return None
    return row["latitude"], row["longitude"]


def find_nearby_listings(
    latitude: float,
    longitude: float,
    radius_km: float = DEFAULT_RADIUS_KM,
    limit: int = 50,
) -> List[Dict]:
    _validate_coordinates(latitude, longitude)
    if radius_km <= 0:
        raise ValueError("radius_km must be greater than 0.")
    if limit <= 0:
        raise ValueError("limit must be greater than 0.")

    conn = _connect()
    cursor = conn.cursor()

    listings = cursor.execute(
        """
        SELECT id, name, category, address, latitude, longitude, phone, website, hours, last_verified
        FROM listings
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        """
    ).fetchall()
    conn.close()

    results: List[Dict] = []
    for row in listings:
        distance_km = _haversine(latitude, longitude, row["latitude"], row["longitude"])
        if distance_km <= radius_km:
            listing = dict(row)
            listing["distance_km"] = distance_km
            results.append(listing)

    results.sort(key=lambda r: r["distance_km"])
    return results[:limit]


def _validate_coordinates(latitude: float, longitude: float) -> None:
    if not (-90.0 <= latitude <= 90.0):
        raise ValueError("latitude must be between -90 and 90.")
    if not (-180.0 <= longitude <= 180.0):
        raise ValueError("longitude must be between -180 and 180.")


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Compute the great-circle distance between two points on Earth (in kilometers).
    """
    R = 6371.0  # Earth radius in km
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)

    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c
