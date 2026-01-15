# backend/app/models/seed_data.py

import sqlite3
from datetime import datetime

from backend.app.models.listings import get_db

def seed_data():
    conn = get_db()
    cursor = conn.cursor()

    # Sample listings
    listings = [
        ("Warming Centre", "Shelter", "123 Main St", 44.231, -76.480, "123-456-7890", "www.warmingcentre.com", "9 AM - 5 PM", "2026-01-01"),
        ("Food Program", "Food", "456 Food St", 44.232, -76.481, "987-654-3210", "www.foodprogram.com", "10 AM - 6 PM", "2026-01-01"),
    ]

    cursor.executemany("""
        INSERT INTO listings (name, category, address, latitude, longitude, phone, website, hours, last_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, listings)

    # Sample surplus pickups
    pickups = [
        ("Bakery", "8:00 PM", "8:30 PM", "Bring your own container", "demo123"),
        ("Cafe", "9:00 PM", "9:30 PM", "First-come, first-served", "demo456"),
    ]

    cursor.executemany("""
        INSERT INTO surplus_pickups (business_name, pickup_time_start, pickup_time_end, notes, auth_code)
        VALUES (?, ?, ?, ?, ?)
    """, pickups)

    now = datetime.utcnow().isoformat()
    cursor.executemany(
        """
        INSERT OR REPLACE INTO pickup_pins (code, issued_at, used_at)
        VALUES (?, ?, ?)
        """,
        [(p[4], now, now) for p in pickups],
    )

    conn.commit()
    conn.close()

# Run the seed data function
seed_data()
