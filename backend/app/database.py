# backend/app/database.py

import sqlite3

def create_tables():
    conn = sqlite3.connect("kingston_caremap.db")
    cursor = conn.cursor()

    # Create Listings table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS listings (
            id INTEGER PRIMARY KEY,
            name TEXT,
            category TEXT,
            address TEXT,
            latitude REAL,
            longitude REAL,
            phone TEXT,
            website TEXT,
            hours TEXT,
            last_verified TEXT
        )
    """)

    # Create Surplus Pickup table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS surplus_pickups (
            id INTEGER PRIMARY KEY,
            business_name TEXT,
            pickup_time_start TEXT,
            pickup_time_end TEXT,
            notes TEXT,
            auth_code TEXT
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pickup_pins (
            code TEXT PRIMARY KEY,
            issued_at TEXT,
            used_at TEXT
        )
    """)
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_surplus_pickups_auth_code
        ON surplus_pickups(auth_code)
    """)

    conn.commit()
    conn.close()

# Run the script to initialize the database
create_tables()
