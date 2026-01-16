import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from ..schema import init_db
from ..db import get_conn
from ..category import map_type_to_category


def ms_to_iso(ms: Optional[int]) -> Optional[str]:
    if ms is None:
        return None
    try:
        dt = datetime.fromtimestamp(ms / 1000.0, tz=timezone.utc)
        return dt.isoformat().replace("+00:00", "Z")
    except Exception:
        return None


def yesno_to_int(val: Any) -> Optional[int]:
    if val is None:
        return None
    s = str(val).strip().lower()
    if s in ("yes", "y", "true", "1"):
        return 1
    if s in ("no", "n", "false", "0"):
        return 0
    return None


def ingest(source: str, path: Path) -> None:
    init_db()

    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    features = data.get("features", [])
    print(f"Ingesting {len(features)} features from {path} (source={source})")

    conn = get_conn()
    inserted = 0
    updated = 0
    skipped = 0

    for ft in features:
        props = ft.get("properties", {}) or {}
        geom = ft.get("geometry", {}) or {}
        coords = geom.get("coordinates", None)

        lon = lat = None
        if isinstance(coords, list) and len(coords) >= 2:
            lon = coords[0]
            lat = coords[1]

        # Prefer properties.OBJECTID, fallback to feature-level id if needed
        external_objectid = props.get("OBJECTID", None)
        if external_objectid is None:
            external_objectid = ft.get("id", None)

        raw_type = props.get("TYPE", None)
        category = map_type_to_category(raw_type)

        name = props.get("PROGRAM_NAME") or props.get("PROVIDER") or f"Unknown {external_objectid}"
        provider = props.get("PROVIDER")
        address = props.get("ADDRESS")
        phone = props.get("PHONE_NUM")
        description = props.get("DESCRIPTION")
        raw_hours = props.get("HOURS")

        last_verified = ms_to_iso(props.get("COMPILE_WHEN")) or ms_to_iso(props.get("ENTRY_WHEN"))
        show_on_public_app = yesno_to_int(props.get("SHOW_ON_PUBLIC_APP"))
        winter_response = yesno_to_int(props.get("WINTER_RESPONSE"))

        try:
            # Check existence BEFORE upsert so counts are real
            existed_before = conn.execute(
                "SELECT 1 FROM places WHERE source=? AND external_objectid=?",
                (source, external_objectid),
            ).fetchone() is not None

            conn.execute(
                """
                INSERT INTO places(
                  source, external_objectid, name, provider, raw_type, category,
                  description, address, latitude, longitude, phone, website,
                  raw_hours, hours_json, last_verified, show_on_public_app, winter_response
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(source, external_objectid) DO UPDATE SET
                  name=excluded.name,
                  provider=excluded.provider,
                  raw_type=excluded.raw_type,
                  category=excluded.category,
                  description=excluded.description,
                  address=excluded.address,
                  latitude=excluded.latitude,
                  longitude=excluded.longitude,
                  phone=excluded.phone,
                  website=excluded.website,
                  raw_hours=excluded.raw_hours,
                  last_verified=excluded.last_verified,
                  show_on_public_app=excluded.show_on_public_app,
                  winter_response=excluded.winter_response,
                  updated_at=datetime('now')
                """,
                (
                    source,
                    external_objectid,
                    name,
                    provider,
                    raw_type,
                    category,
                    description,
                    address,
                    lat,
                    lon,
                    phone,
                    None,          # website not in this dataset
                    raw_hours,
                    None,          # hours_json stays NULL for now
                    last_verified,
                    show_on_public_app,
                    winter_response,
                ),
            )

            if existed_before:
                updated += 1
            else:
                inserted += 1

        except Exception as e:
            skipped += 1
            print(f"[WARN] Skipped OBJECTID={external_objectid} name={name!r}: {e}")

    conn.commit()

    total = conn.execute("SELECT COUNT(*) FROM places").fetchone()[0]
    conn.close()

    print(f"Done. places_total={total} inserted={inserted} updated={updated} skipped={skipped}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True, help="Source name (e.g., kingston_services)")
    parser.add_argument("--path", required=True, help="Path to GeoJSON file")
    args = parser.parse_args()

    ingest(args.source, Path(args.path))


if __name__ == "__main__":
    main()
