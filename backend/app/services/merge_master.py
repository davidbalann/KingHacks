import json
import time
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parents[2] / "data"

COMMUNITY_FOOD = DATA_DIR / "community_food_resources.geojson"
HOMELESSNESS = DATA_DIR / "homelessness_services.geojson"
PLACES_ENRICHED = DATA_DIR / "kingston_food_businesses_with_closing.json"
PLACES_RAW = DATA_DIR / "kingston_food_businesses.json"
OUT = DATA_DIR / "master_food_sources.json"


def load_json(path: Path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def geojson_features_to_records(geojson: dict, source_type: str):
    out = []
    for feature in geojson.get("features", []):
        props = feature.get("properties", {}) or {}
        geometry = feature.get("geometry", {}) or {}

        rec = {
            "source_type": source_type,
            "source": "City of Kingston Open Data",
            "properties": props,
            "geometry": geometry,
        }
        out.append(rec)
    return out


def places_to_records(places_json: dict):
    out = []
    for place in places_json.get("places", []):
        display = (place.get("displayName") or {}).get("text")
        loc = place.get("location") or {}
        rec = {
            "source_type": "food_business",
            "source": "Google Places API (New)",
            "name": display,
            "address": place.get("formattedAddress"),
            "location": {
                "latitude": loc.get("latitude"),
                "longitude": loc.get("longitude"),
            },
            "primaryType": place.get("primaryType"),
            "types": place.get("types", []),
            "hours": place.get("regularOpeningHours", {}),
            "computed": place.get("computed", {}),
            "raw": place,
        }
        out.append(rec)
    return out


def main():
    community = load_json(COMMUNITY_FOOD)
    homelessness = load_json(HOMELESSNESS)

    if PLACES_ENRICHED.exists():
        places = load_json(PLACES_ENRICHED)
    else:
        places = load_json(PLACES_RAW)

    master = []
    master += geojson_features_to_records(community, "community_food_resource")
    master += geojson_features_to_records(homelessness, "homelessness_service")
    master += places_to_records(places)

    OUT.parent.mkdir(parents=True, exist_ok=True)

    output = {
        "generated_at_unix": int(time.time()),
        "counts": {
            "community_food_resources": len(community.get("features", [])),
            "homelessness_services": len(homelessness.get("features", [])),
            "food_businesses": len(places.get("places", [])),
            "total": len(master),
        },
        "items": master,
    }

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"Saved {OUT} (total items: {len(master)})")
    print("Counts:", output["counts"])


if __name__ == "__main__":
    main()
