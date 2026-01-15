import json
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional

import requests

from backend.app.models.listings import create_tables, get_db
from backend.app.services.keys import load_google_api_key

logger = logging.getLogger(__name__)

# City of Kingston Open Data endpoints
DATASETS: Dict[str, str] = {
    "Community Food Resource": "https://services1.arcgis.com/KGdHCCUjGBpOPPac/ArcGIS/rest/services/community_food_guide_locations/FeatureServer/0/query",
    "Homelessness Service": "https://utility.arcgis.com/usrsvcs/servers/50c2ce30e0e04518a8dfe8b0fe85d998/rest/services/HousingSocialServices/Homelessness_Service_Public/FeatureServer/2/query",
}

ARCGIS_PARAMS = {
    "where": "1=1",
    "outFields": "*",
    "f": "geojson",
    "outSR": "4326",
}

# Google Places (New) configuration
GOOGLE_TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"
GOOGLE_DETAIL_URL = "https://places.googleapis.com/v1/places/{place_id}"
GOOGLE_FIELD_MASK = ",".join(
    [
        "id",
        "displayName",
        "formattedAddress",
        "location",
        "types",
        "primaryType",
        "regularOpeningHours",
        "currentOpeningHours",
        "internationalPhoneNumber",
        "nationalPhoneNumber",
        "websiteUri",
    ]
)

GOOGLE_QUERIES = [
    "fast food in Kingston Ontario",
    "bakery in Kingston Ontario",
    "restaurant in Kingston Ontario",
]

REQUEST_TIMEOUT = 30

def _pick_first(props: Dict, keys: List[str]) -> Optional[str]:
    for key in keys:
        val = props.get(key)
        if val not in (None, ""):
            return str(val)
    return None


def _coords_from_geometry(geometry: Dict) -> Dict[str, Optional[float]]:
    lat = lon = None

    coords = geometry.get("coordinates")
    if isinstance(coords, (list, tuple)):
        # GeoJSON Point [lon, lat]
        if len(coords) >= 2 and all(isinstance(c, (int, float)) for c in coords[:2]):
            lon, lat = coords[0], coords[1]
        # Sometimes coordinates are nested (e.g., MultiPoint)
        elif len(coords) and isinstance(coords[0], (list, tuple)) and len(coords[0]) >= 2:
            first = coords[0]
            if all(isinstance(c, (int, float)) for c in first[:2]):
                lon, lat = first[0], first[1]
    else:
        # ArcGIS JSON sometimes uses x/y
        x = geometry.get("x")
        y = geometry.get("y")
        if isinstance(x, (int, float)) and isinstance(y, (int, float)):
            lon, lat = x, y

    return {"latitude": lat, "longitude": lon}


def _to_text(value: Optional[object]) -> Optional[str]:
    if value is None:
        return None
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False)
    return str(value)


def fetch_city_dataset(label: str, url: str) -> List[Dict]:
    try:
        response = requests.get(url, params=ARCGIS_PARAMS, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        data = response.json()
        features = data.get("features", [])
        logger.info("Fetched %s features from %s", len(features), label)
        return features
    except Exception as exc:
        logger.warning("Fetch failed for %s: %s", label, exc)
        return []


def normalize_geojson_feature(feature: Dict, category: str) -> Dict:
    props = feature.get("properties") or feature.get("attributes") or {}
    geometry = feature.get("geometry") or {}

    coords = _coords_from_geometry(geometry)

    name = _pick_first(
        props,
        [
            "name",
            "Name",
            "NAME",
            "organization",
            "Organization",
            "ORG_NAME",
            "LocationName",
            "SiteName",
        ],
    )
    address = _pick_first(
        props,
        [
            "address",
            "Address",
            "ADDRESS",
            "FullAddress",
            "FULLADDR",
            "CivicAddress",
            "SITE_ADDRESS",
            "Street",
        ],
    )
    phone = _pick_first(props, ["phone", "Phone", "PHONE", "Contact", "CONTACT_PHONE"])
    website = _pick_first(props, ["website", "Website", "WEBSITE", "URL", "Link"])
    hours = _pick_first(props, ["hours", "Hours", "HOURS", "open_hours", "OPEN_HOURS"])

    return {
        "name": name or category,
        "category": category,
        "address": address,
        "latitude": coords["latitude"],
        "longitude": coords["longitude"],
        "phone": phone,
        "website": website,
        "hours": _to_text(hours),
        "last_verified": datetime.now(timezone.utc).isoformat(),
    }


def fetch_google_places(api_key: str) -> List[Dict]:
    headers_search = {
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.primaryType,places.types",
    }
    headers_detail = {
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": GOOGLE_FIELD_MASK,
    }

    results: List[Dict] = []
    seen = set()

    for query in GOOGLE_QUERIES:
        body = {
            "textQuery": query,
            "locationBias": {
                "circle": {
                    "center": {"latitude": 44.2312, "longitude": -76.4860},
                    "radius": 12000,
                }
            },
            "pageSize": 20,
        }
        try:
            resp = requests.post(
                GOOGLE_TEXT_SEARCH_URL,
                headers=headers_search,
                json=body,
                timeout=REQUEST_TIMEOUT,
            )
            resp.raise_for_status()
            places = resp.json().get("places", [])
            logger.info("Google search '%s' -> %s results", query, len(places))
        except Exception as exc:
            logger.warning("Google search '%s' failed: %s", query, exc)
            continue

        for place in places:
            place_id = place.get("id")
            if not place_id or place_id in seen:
                continue
            seen.add(place_id)

            try:
                detail_resp = requests.get(
                    GOOGLE_DETAIL_URL.format(place_id=place_id),
                    headers=headers_detail,
                    timeout=REQUEST_TIMEOUT,
                )
                detail_resp.raise_for_status()
                results.append(detail_resp.json())
            except Exception as exc:
                logger.warning("Google detail for %s failed: %s", place_id, exc)
                continue

    logger.info("Google Places: collected %s unique places", len(results))
    return results


def normalize_google_place(place: Dict) -> Dict:
    loc = place.get("location") or {}
    display = (place.get("displayName") or {}).get("text")

    hours_payload = place.get("regularOpeningHours") or place.get("currentOpeningHours")

    return {
        "name": display or place.get("id") or "Food business",
        "category": place.get("primaryType") or "Food Business",
        "address": place.get("formattedAddress"),
        "latitude": loc.get("latitude"),
        "longitude": loc.get("longitude"),
        "phone": place.get("internationalPhoneNumber") or place.get("nationalPhoneNumber"),
        "website": place.get("websiteUri"),
        "hours": _to_text(hours_payload),
        "last_verified": datetime.now(timezone.utc).isoformat(),
    }


def gather_all_sources() -> List[Dict]:
    records: List[Dict] = []

    # City datasets
    for label, url in DATASETS.items():
        features = fetch_city_dataset(label, url)
        records.extend([normalize_geojson_feature(f, label) for f in features])

    # Google Places
    api_key = load_google_api_key()
    if api_key:
        places = fetch_google_places(api_key)
        records.extend([normalize_google_place(p) for p in places])
    else:
        logger.info("GOOGLE_API_KEY not found (env or backend folder); skipping Google Places.")

    logger.info("Total records gathered: %s", len(records))
    return records


def refresh_listings_from_sources() -> int:
    # Make sure tables are present before we touch data
    logger.info("Starting listings refresh from configured sources")
    create_tables()

    records = gather_all_sources()
    if not records:
        logger.warning("No records gathered; leaving existing listings untouched.")
        return 0

    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute("BEGIN IMMEDIATE")
        cursor.execute("DELETE FROM listings")
        cursor.executemany(
            """
            INSERT INTO listings (name, category, address, latitude, longitude, phone, website, hours, last_verified)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                (
                    rec.get("name"),
                    rec.get("category"),
                    rec.get("address"),
                    rec.get("latitude"),
                    rec.get("longitude"),
                    rec.get("phone"),
                    rec.get("website"),
                    rec.get("hours"),
                    rec.get("last_verified"),
                )
                for rec in records
            ],
        )
        conn.commit()
        logger.info("Listings refresh complete (inserted %s records).", len(records))
        return len(records)
    except Exception:
        conn.rollback()
        logger.exception("Listings refresh failed; rolled back changes to preserve existing data.")
        raise
    finally:
        conn.close()
