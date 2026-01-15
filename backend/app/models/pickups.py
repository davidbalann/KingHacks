# backend/app/models/pickups.py

import sqlite3
from datetime import datetime
from typing import Dict


DB_PATH = "kingston_caremap.db"


def _ensure_pickup_tables(cursor: sqlite3.Cursor) -> None:
    """
    Make sure supporting tables exist for surplus pickups and PIN tracking.
    """
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS surplus_pickups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            business_name TEXT,
            pickup_time_start TEXT,
            pickup_time_end TEXT,
            notes TEXT,
            auth_code TEXT
        )
        """
    )
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS pickup_pins (
            code TEXT PRIMARY KEY,
            issued_at TEXT,
            used_at TEXT
        )
        """
    )
    cursor.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_surplus_pickups_auth_code
        ON surplus_pickups(auth_code)
        """
    )


def post_pickup_window(pickup_data: Dict) -> int:
    """
    Insert a surplus pickup record after validating PIN usage.
    Returns the inserted pickup ID.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    _ensure_pickup_tables(cursor)

    now_iso = datetime.utcnow().isoformat()
    auth_code = pickup_data["auth_code"]

    try:
        cursor.execute("BEGIN IMMEDIATE")

        # Check PIN usage from the pickup_pins table
        pin_row = cursor.execute(
            "SELECT used_at FROM pickup_pins WHERE code = ?",
            (auth_code,),
        ).fetchone()
        if pin_row and pin_row["used_at"]:
            raise ValueError("PIN has already been used.")

        # Insert a new surplus pickup record
        cursor.execute(
            """
            INSERT INTO surplus_pickups (business_name, pickup_time_start, pickup_time_end, notes, auth_code)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                pickup_data["business_name"],
                pickup_data["pickup_time_start"],
                pickup_data["pickup_time_end"],
                pickup_data.get("notes"),
                auth_code,
            ),
        )
        pickup_id = cursor.lastrowid

        # Update the PIN as used in the pickup_pins table
        cursor.execute(
            "UPDATE pickup_pins SET used_at = ? WHERE code = ? AND used_at IS NULL",
            (now_iso, auth_code),
        )

        conn.commit()
        return pickup_id
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

