# backend/app/models/listings.py

import sqlite3

def get_db():
    conn = sqlite3.connect("kingston_caremap.db")
    return conn

def create_tables():
    conn = get_db()
    cursor = conn.cursor()

    # Create Listings table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS listings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            business_name TEXT,
            pickup_time_start TEXT,
            pickup_time_end TEXT,
            notes TEXT,
            auth_code TEXT
        )
    """)

    # Create Pickup PIN table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pickup_pins (
            code TEXT PRIMARY KEY,
            issued_at TEXT,
            used_at TEXT
        )
    """)

    # Create Indexes for performance on search queries
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category)
    """)
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_listings_address ON listings(address)
    """)
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_listings_name ON listings(name)
    """)

    # Create Watch List table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS watchlist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            listing_id INTEGER,
            FOREIGN KEY (listing_id) REFERENCES listings(id)
        )
    """)

    conn.commit()
    conn.close()

# Initialize database
create_tables()

