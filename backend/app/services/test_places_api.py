import requests

from backend.app.services.keys import load_google_api_key

PLACE_ID = "ChIJN1t_tDeuEmsRUsoyG83frY4"


def main():
    api_key = load_google_api_key(raise_on_missing=True)
    url = f"https://places.googleapis.com/v1/places/{PLACE_ID}"
    headers = {
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": "displayName,regularOpeningHours",
    }

    response = requests.get(url, headers=headers, timeout=20)
    response.raise_for_status()

    print(response.json())


if __name__ == "__main__":
    main()
