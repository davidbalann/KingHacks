import json
from datetime import datetime
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
IN_FILE = DATA_DIR / "kingston_food_businesses.json"
OUT_FILE = DATA_DIR / "kingston_food_businesses_with_closing.json"


def enrich(place):
    hours = place.get("regularOpeningHours", {})
    next_close = hours.get("nextCloseTime")

    if next_close:
        try:
            next_close_dt = datetime.fromisoformat(next_close.replace("Z", "+00:00"))
            place["computed"] = {
                "nextCloseTime": next_close,
                "nextCloseLocal": next_close_dt.astimezone().isoformat(),
                "openNow": hours.get("openNow"),
            }
        except Exception:
            place["computed"] = {"openNow": hours.get("openNow")}
    else:
        place["computed"] = {"openNow": hours.get("openNow")}

    return place


def main():
    with open(IN_FILE, encoding="utf-8") as f:
        data = json.load(f)

    places = data.get("places", [])
    enriched = [enrich(p) for p in places]

    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        json.dump(
            {"generated_at": data.get("generated_at"), "places": enriched},
            f,
            indent=2,
            ensure_ascii=False,
        )

    print(f"Saved {OUT_FILE} ({len(enriched)} places)")


if __name__ == "__main__":
    main()
