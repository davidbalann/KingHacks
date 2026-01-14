import json
import time
from pathlib import Path
from typing import Optional

import requests

from backend.app.services.keys import load_google_api_key

TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"

KINGSTON_CENTER = {"latitude": 44.2312, "longitude": -76.4860}

DATA_DIR = Path(__file__).resolve().parents[2] / "data"


def _search_headers(api_key: str):
    return {
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.primaryType,places.types",
    }


def _detail_headers(api_key: str):
    return {
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": "id,displayName,formattedAddress,location,types,primaryType,regularOpeningHours",
    }


def search_text(query: str, page_size: int = 20, api_key: Optional[str] = None):
    api_key = api_key or load_google_api_key(raise_on_missing=True)
    body = {
        "textQuery": query,
        "locationBias": {
            "circle": {
                "center": KINGSTON_CENTER,
                "radius": 12000,
            }
        },
        "pageSize": page_size,
    }
    response = requests.post(
        TEXT_SEARCH_URL,
        headers=_search_headers(api_key),
        json=body,
        timeout=30,
    )
    response.raise_for_status()
    return response.json().get("places", [])


def place_details(place_id: str, api_key: Optional[str] = None):
    api_key = api_key or load_google_api_key(raise_on_missing=True)
    url = f"https://places.googleapis.com/v1/places/{place_id}"
    response = requests.get(url, headers=_detail_headers(api_key), timeout=30)
    response.raise_for_status()
    return response.json()


def main():
    api_key = load_google_api_key(raise_on_missing=True)
    queries = [
        "fast food in Kingston Ontario",
        "bakery in Kingston Ontario",
        "restaurant in Kingston Ontario",
    ]

    seen = set()
    results = []

    for query in queries:
        places = search_text(query, page_size=20, api_key=api_key)
        print(f"Search '{query}' -> {len(places)} results")
        for place in places:
            place_id = place.get("id")
            if not place_id or place_id in seen:
                continue
            seen.add(place_id)

            details = place_details(place_id, api_key=api_key)
            results.append(details)

            time.sleep(0.1)

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    out_path = DATA_DIR / "kingston_food_businesses.json"
    out_path.write_text(
        json.dumps({"generated_at": time.time(), "places": results}, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    print(f"Saved {out_path} (unique places: {len(results)})")


if __name__ == "__main__":
    main()
