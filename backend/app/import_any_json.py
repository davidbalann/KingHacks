"""
Generic JSON/GeoJSON importer for Kingston Caremap.

Scans one or more JSON/GeoJSON files, extracts listings, and upserts them into
`kingston_caremap.db` (or a custom path via `--db`). A listing is imported only
when it has a name, address, latitude, and longitude. Missing categories are
stored as "Uncategorized".

Usage:
  python import_any_json.py                # auto-scan *.json/*.geojson in . and data/
  python import_any_json.py data/*.json    # explicit files or directories
  python import_any_json.py --db other.db services.geojson
"""

import argparse
import hashlib
import json
import math
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

DB_PATH = "../../kingston_caremap.db"
RESTAURANT_TOKENS = {
    "restaurant",
    "pub",
    "grill",
    "pizzeria",
    "pizza",
    "diner",
    "cafe",
    "cafeteria",
    "bistro",
    "tavern",
    "steakhouse",
    "eatery",
    "cantina",
    "bbq",
    "barbecue",
    "bar",
}


def clean_text(value: Any) -> Optional[str]:
    """Convert common value types to a trimmed string; return None when empty."""
    if value is None:
        return None
    if isinstance(value, dict):
        if "text" in value:
            value = value["text"]
        elif "value" in value:
            value = value["value"]
        else:
            # fallback: join first-level values
            value = " ".join(
                str(v).strip() for v in value.values() if v is not None and str(v).strip()
            )
    if isinstance(value, (list, tuple, set)):
        parts = [clean_text(v) for v in value]
        parts = [p for p in parts if p]
        return "; ".join(parts) if parts else None
    value_str = str(value).strip()
    return value_str or None


def normalize_hours(value: Any) -> Optional[str]:
    if value is None:
        return None
    if isinstance(value, dict) and "weekdayDescriptions" in value:
        return clean_text(value.get("weekdayDescriptions"))
    if isinstance(value, dict):
        # generic dict -> "key: value" pairs
        return clean_text([f"{k}: {v}" for k, v in value.items()])
    return clean_text(value)


def normalize_timestamp(value: Any, fallback_iso: str) -> str:
    if value is None:
        return fallback_iso
    if isinstance(value, (int, float)):
        # guess seconds vs milliseconds
        seconds = value / 1000 if value > 1e12 else value
        try:
            return datetime.fromtimestamp(seconds, tz=timezone.utc).isoformat()
        except (OverflowError, OSError, ValueError):
            return fallback_iso
    if isinstance(value, str):
        text = value.strip()
        if not text:
            return fallback_iso
        # best-effort ISO parsing; if it fails, store raw text
        try:
            txt = text.replace("Z", "+00:00")
            return datetime.fromisoformat(txt).astimezone(timezone.utc).isoformat()
        except ValueError:
            return text
    return fallback_iso


def norm_for_key(text: str) -> str:
    """Simple normalizer used for source_key construction."""
    if not text:
        return ""
    keep = []
    for ch in text.lower():
        if ch.isalnum() or ch.isspace():
            keep.append(ch)
    return " ".join("".join(keep).split())


def round_coord(value: float, places: int = 5) -> str:
    return f"{value:.{places}f}"


def normalize_category(category_text: Optional[str], types_raw: Any) -> str:
    cat_text = clean_text(category_text) or ""

    type_candidates: List[str] = []
    if isinstance(types_raw, (list, tuple, set)):
        for t in types_raw:
            t_text = clean_text(t)
            if t_text:
                type_candidates.append(t_text)
    elif isinstance(types_raw, str):
        t_text = clean_text(types_raw)
        if t_text:
            type_candidates.append(t_text)

    tokens: set[str] = set()
    for text in [cat_text] + type_candidates:
        lower = text.lower()
        for ch in "-_/":
            lower = lower.replace(ch, " ")
        for tok in lower.split():
            tokens.add(tok)

    if tokens & RESTAURANT_TOKENS:
        return "Restaurant"
    return cat_text or "Uncategorized"


class CaseLookup:
    """Case-insensitive lookup across one or more dict-like sources."""

    def __init__(self, *sources: Dict[str, Any]):
        self._map: Dict[str, Any] = {}
        for src in sources:
            if not isinstance(src, dict):
                continue
            for key, val in src.items():
                lk = str(key).lower()
                if lk not in self._map:
                    self._map[lk] = val

    def get_text(self, *keys: str) -> Optional[str]:
        for key in keys:
            if key is None:
                continue
            val = self._map.get(str(key).lower())
            text = clean_text(val)
            if text:
                return text
        return None

    def get_raw(self, *keys: str) -> Any:
        for key in keys:
            if key is None:
                continue
            lk = str(key).lower()
            if lk in self._map:
                val = self._map[lk]
                if val not in (None, ""):
                    return val
        return None


def extract_coordinates(geom: Dict[str, Any], lookup: CaseLookup) -> Tuple[Optional[float], Optional[float]]:
    lat = lon = None
    if isinstance(geom, dict):
        coords = geom.get("coordinates")
        if isinstance(coords, (list, tuple)) and len(coords) >= 2:
            lon, lat = coords[0], coords[1]
        if lat is None or lon is None:
            if "x" in geom or "y" in geom:
                lon = lon if lon is not None else geom.get("x")
                lat = lat if lat is not None else geom.get("y")
            if any(k in geom for k in ("latitude", "lat")) and any(k in geom for k in ("longitude", "lon", "lng")):
                lat = lat if lat is not None else geom.get("latitude") or geom.get("lat")
                lon = lon if lon is not None else geom.get("longitude") or geom.get("lon") or geom.get("lng")
    if lat is None or lon is None:
        lat = lat if lat is not None else lookup.get_raw("latitude", "lat")
        lon = lon if lon is not None else lookup.get_raw("longitude", "lon", "lng", "long")
    loc = lookup.get_raw("location")
    if (lat is None or lon is None) and isinstance(loc, dict):
        lat = lat if lat is not None else loc.get("latitude") or loc.get("lat")
        lon = lon if lon is not None else loc.get("longitude") or loc.get("lng") or loc.get("lon")
    try:
        lat_f = float(lat) if lat is not None else None
        lon_f = float(lon) if lon is not None else None
    except (TypeError, ValueError):
        return None, None
    if lat_f is None or lon_f is None:
        return None, None
    if any(math.isnan(v) or math.isinf(v) for v in (lat_f, lon_f)):
        return None, None
    return lat_f, lon_f


def ensure_schema(conn: sqlite3.Connection) -> None:
    cur = conn.cursor()
    cur.executescript(
        """
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
            last_verified TEXT,
            source_key TEXT
        );

        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        );

        CREATE TABLE IF NOT EXISTS listing_categories (
            listing_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL,
            PRIMARY KEY (listing_id, category_id),
            FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        );
        """
    )
    cols = {row[1] for row in cur.execute("PRAGMA table_info(listings)").fetchall()}
    optional_cols = {
        "website": "TEXT",
        "hours": "TEXT",
        "last_verified": "TEXT",
        "source_key": "TEXT",
    }
    for col, col_type in optional_cols.items():
        if col not in cols:
            cur.execute(f"ALTER TABLE listings ADD COLUMN {col} {col_type};")
    cur.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_listings_source_key ON listings(source_key);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_listings_address ON listings(address);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_listings_name ON listings(name);")
    conn.commit()


def get_or_create_category(conn: sqlite3.Connection, name: str) -> int:
    cur = conn.cursor()
    cur.execute("INSERT OR IGNORE INTO categories(name) VALUES (?)", (name,))
    cur.execute("SELECT id FROM categories WHERE name = ?", (name,))
    row = cur.fetchone()
    return row[0]


def link_listing_category(conn: sqlite3.Connection, listing_id: int, category_id: int) -> None:
    conn.execute(
        "INSERT OR IGNORE INTO listing_categories(listing_id, category_id) VALUES (?, ?)",
        (listing_id, category_id),
    )


def make_source_key(name: str, address: str, lat: float, lon: float) -> str:
    base = "|".join([norm_for_key(name), norm_for_key(address), round_coord(lat), round_coord(lon)])
    return hashlib.sha1(base.encode("utf-8")).hexdigest()


def upsert_listing(conn: sqlite3.Connection, record: Dict[str, Any]) -> int:
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO listings (name, category, address, latitude, longitude, phone, website, hours, last_verified, source_key)
        VALUES (:name, :category, :address, :latitude, :longitude, :phone, :website, :hours, :last_verified, :source_key)
        ON CONFLICT(source_key) DO UPDATE SET
            name = excluded.name,
            category = COALESCE(excluded.category, listings.category),
            address = excluded.address,
            latitude = excluded.latitude,
            longitude = excluded.longitude,
            phone = COALESCE(NULLIF(excluded.phone, ''), listings.phone),
            website = COALESCE(NULLIF(excluded.website, ''), listings.website),
            hours = COALESCE(NULLIF(excluded.hours, ''), listings.hours),
            last_verified = excluded.last_verified
        ;
        """,
        record,
    )
    cur.execute("SELECT id FROM listings WHERE source_key = ?", (record["source_key"],))
    return cur.fetchone()[0]


def has_title_category_match(conn: sqlite3.Connection, name: str, category: str) -> bool:
    cur = conn.cursor()
    cur.execute(
        """
        SELECT 1
        FROM listings
        WHERE LOWER(name) = LOWER(?)
          AND LOWER(category) = LOWER(?)
        LIMIT 1;
        """,
        (name, category),
    )
    return cur.fetchone() is not None


def parse_record(raw: Any, ingest_time_iso: str) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
    if not isinstance(raw, dict):
        return None, "not-a-dict"

    props = raw.get("properties") or raw.get("attributes") or raw.get("props") or {}
    geom = raw.get("geometry") or {}
    # Some sources store everything on the top-level object.
    if not props:
        props = raw
    if not geom and isinstance(raw.get("location"), dict):
        geom = raw["location"]

    lookup = CaseLookup(props, raw)
    name = lookup.get_text("program_name", "name", "field1", "provider", "displayname", "title", "business_name")
    raw_category = lookup.get_text("category", "type", "primarytype", "source_type")
    types_raw = lookup.get_raw("types")
    category = normalize_category(raw_category, types_raw)
    address = lookup.get_text("address", "formattedaddress", "street_address", "location_address")
    phone = lookup.get_text("phone_num", "phone", "contact_phone", "contact")
    website = lookup.get_text("website", "url", "url_popup", "link")

    hours_raw = lookup.get_raw(
        "hours",
        "opening_hours",
        "opening_hours_text",
        "opening_hours_description",
        "regularopeninghours",
    )
    hours = normalize_hours(hours_raw)

    last_verified_raw = lookup.get_raw(
        "last_verified",
        "lastverified",
        "compile_when",
        "entry_when",
        "generated_at",
        "generated_at_unix",
    )
    last_verified = normalize_timestamp(last_verified_raw, ingest_time_iso)

    lat, lon = extract_coordinates(geom, lookup)

    if not name or not address or lat is None or lon is None:
        return None, "missing-required-fields"

    record = {
        "name": name,
        "category": category or "Uncategorized",
        "address": address,
        "latitude": lat,
        "longitude": lon,
        "phone": phone or "",
        "website": website or "",
        "hours": hours or "",
        "last_verified": last_verified,
    }
    record["source_key"] = make_source_key(record["name"], record["address"], record["latitude"], record["longitude"])
    return record, None


def iter_records_from_data(data: Any) -> Iterable[Dict[str, Any]]:
    if isinstance(data, list):
        return data
    if not isinstance(data, dict):
        return []
    if isinstance(data.get("features"), list):
        return data["features"]
    if isinstance(data.get("items"), list):
        return data["items"]
    if isinstance(data.get("places"), list):
        return data["places"]
    if isinstance(data.get("data"), list):
        return data["data"]
    return []


def process_file(
    path: Path, conn: sqlite3.Connection, ingest_time_iso: str, seen_keys: set[str]
) -> Tuple[int, int, Dict[str, int]]:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    imported = skipped = 0
    skip_reasons: Dict[str, int] = {}
    seen_title_categories: set[Tuple[str, str]] = set()
    for raw in iter_records_from_data(data):
        record, reason = parse_record(raw, ingest_time_iso)
        if not record:
            skipped += 1
            skip_reasons[reason or "unknown"] = skip_reasons.get(reason or "unknown", 0) + 1
            continue
        title_category_key = (norm_for_key(record["name"]), norm_for_key(record["category"]))
        if title_category_key in seen_title_categories or has_title_category_match(
            conn, record["name"], record["category"]
        ):
            skipped += 1
            skip_reasons["duplicate-title-category"] = skip_reasons.get("duplicate-title-category", 0) + 1
            continue
        if record["source_key"] in seen_keys:
            skipped += 1
            skip_reasons["duplicate"] = skip_reasons.get("duplicate", 0) + 1
            continue

        listing_id = upsert_listing(conn, record)
        seen_keys.add(record["source_key"])
        seen_title_categories.add(title_category_key)
        if record["category"]:
            cat_id = get_or_create_category(conn, record["category"])
            link_listing_category(conn, listing_id, cat_id)
        imported += 1

    return imported, skipped, skip_reasons


def discover_paths(paths: List[str]) -> List[Path]:
    discovered: List[Path] = []
    script_dir = Path(__file__).resolve().parent

    if paths:
        candidates = [Path(p) for p in paths]
    else:
        # Search both current working directory and alongside the script
        candidates = [
            Path("."),
            Path("data"),
            script_dir,
            script_dir / "data",
        ]

    for entry in candidates:
        if entry.is_dir():
            for ext in ("*.json", "*.geojson"):
                discovered.extend(sorted(entry.glob(ext)))
        elif entry.suffix.lower() in (".json", ".geojson") and entry.exists():
            discovered.append(entry)

    # Deduplicate while keeping order
    seen = set()
    unique_paths = []
    for p in discovered:
        if p in seen:
            continue
        seen.add(p)
        unique_paths.append(p)
    return unique_paths


def main() -> None:
    parser = argparse.ArgumentParser(description="Import JSON/GeoJSON listings into SQLite.")
    parser.add_argument("paths", nargs="*", help="Files or directories to import. Defaults to *.json/*.geojson in . and data/.")
    parser.add_argument("--db", default=DB_PATH, help="Path to SQLite database (default: %(default)s).")
    args = parser.parse_args()

    files = discover_paths(args.paths)
    if not files:
        print("No JSON/GeoJSON files found to import.")
        return

    ingest_time_iso = datetime.now(timezone.utc).isoformat()
    conn = sqlite3.connect(args.db)
    conn.execute("PRAGMA foreign_keys = ON;")
    ensure_schema(conn)

    total_imported = total_skipped = 0
    seen_source_keys: set[str] = set()
    total_skip_reasons: Dict[str, int] = {}
    for path in files:
        imported, skipped, reasons = process_file(path, conn, ingest_time_iso, seen_source_keys)
        total_imported += imported
        total_skipped += skipped
        for reason, count in reasons.items():
            total_skip_reasons[reason] = total_skip_reasons.get(reason, 0) + count
        reason_str = ", ".join(f"{r}: {c}" for r, c in reasons.items()) if reasons else "none"
        print(f"{path}: imported {imported}, skipped {skipped} (reasons: {reason_str})")

    conn.commit()
    conn.close()
    print(f"Done. Imported {total_imported}, skipped {total_skipped}.")
    if total_skipped:
        summary = ", ".join(f"{r}: {c}" for r, c in total_skip_reasons.items())
        print(f"Skip reasons summary: {summary}")


if __name__ == "__main__":
    main()
