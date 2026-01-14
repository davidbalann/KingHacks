import json
from pathlib import Path

import requests

DATASETS = {
    "community_food_resources": "https://services1.arcgis.com/KGdHCCUjGBpOPPac/ArcGIS/rest/services/community_food_guide_locations/FeatureServer/0/query",
    "homelessness_services": "https://utility.arcgis.com/usrsvcs/servers/50c2ce30e0e04518a8dfe8b0fe85d998/rest/services/HousingSocialServices/Homelessness_Service_Public/FeatureServer/2/query",
}

PARAMS = {
    "where": "1=1",
    "outFields": "*",
    "f": "geojson",
    "outSR": "4326",
}

DATA_DIR = Path(__file__).resolve().parents[2] / "data"


def fetch_to_file(name: str, query_url: str, out_dir: Path = DATA_DIR) -> Path:
    response = requests.get(query_url, params=PARAMS, timeout=60)
    response.raise_for_status()
    data = response.json()

    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{name}.geojson"
    out_path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Saved: {out_path}  (features: {len(data.get('features', []))})")
    return out_path


def main():
    for name, url in DATASETS.items():
        fetch_to_file(name, url)


if __name__ == "__main__":
    main()
