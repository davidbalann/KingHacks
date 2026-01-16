from .db import get_conn

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS places (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  source             TEXT NOT NULL,
  external_objectid  INTEGER,
  name               TEXT NOT NULL,
  provider           TEXT,
  raw_type           TEXT,
  category           TEXT NOT NULL,
  description        TEXT,
  address            TEXT,
  latitude           REAL,
  longitude          REAL,
  phone              TEXT,
  website            TEXT,
  raw_hours          TEXT,
  hours_json         TEXT,   -- JSON string for PlaceHours (nullable)
  last_verified      TEXT,   -- ISO 8601 string (nullable)
  show_on_public_app INTEGER, -- stored but NOT strictly filtered
  winter_response    INTEGER,
  updated_at         TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(source, external_objectid)
);

CREATE INDEX IF NOT EXISTS idx_places_category ON places(category);
CREATE INDEX IF NOT EXISTS idx_places_name ON places(name);
CREATE INDEX IF NOT EXISTS idx_places_latlon ON places(latitude, longitude);

CREATE TABLE IF NOT EXISTS pickups (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  place_id      INTEGER,
  business_name TEXT NOT NULL,
  address       TEXT,
  latitude      REAL,
  longitude     REAL,
  window_start  TEXT NOT NULL, -- ISO datetime
  window_end    TEXT NOT NULL, -- ISO datetime
  notes         TEXT,
  claim_rule    TEXT,
  posted_at     TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at    TEXT,
  active        INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY(place_id) REFERENCES places(id)
);

CREATE INDEX IF NOT EXISTS idx_pickups_end ON pickups(window_end);
CREATE INDEX IF NOT EXISTS idx_pickups_latlon ON pickups(latitude, longitude);
"""

def init_db() -> None:
    conn = get_conn()
    conn.executescript(SCHEMA_SQL)
    conn.commit()
    conn.close()
