import requests
import logging
from typing import Dict, Any
from fastapi import HTTPException

# Assuming you have the Backboard API key set up as an environment variable
BACKBOARD_API_KEY = "espr_c0EMgF2SGostVII33TAE6LjeP_uOoQ61-cNabICNoL0"
BACKBOARD_URL = "https://api.backboard.io/v1"

logger = logging.getLogger(__name__)

# Utility function to send data to Backboard
def send_to_backboard(endpoint: str, data: Dict[str, Any]):
    try:
        response = requests.post(
            f"{BACKBOARD_URL}/{endpoint}",
            headers={"Authorization": f"Bearer {BACKBOARD_API_KEY}"},
            json=data,
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as exc:
        logger.error(f"Error communicating with Backboard: {exc}")
        raise HTTPException(status_code=500, detail="Error communicating with Backboard")

# Function to save user preferences (language, filters, etc.)
def save_user_preferences(preferences: Dict[str, Any]):
    return send_to_backboard("preferences/save", preferences)

# Function to get user preferences from Backboard
def get_user_preferences(user_id: str) -> Dict[str, Any]:
    response = requests.get(
        f"{BACKBOARD_URL}/preferences/{user_id}",
        headers={"Authorization": f"Bearer {BACKBOARD_API_KEY}"},
    )
    response.raise_for_status()
    return response.json()

# Function to add an item to the user's watchlist
def add_to_watchlist(user_id: str, listing_id: int):
    return send_to_backboard(f"watchlist/{user_id}/add", {"listing_id": listing_id})

# Function to get the user's watchlist
def get_watchlist(user_id: str) -> Dict[str, Any]:
    response = requests.get(
        f"{BACKBOARD_URL}/watchlist/{user_id}",
        headers={"Authorization": f"Bearer {BACKBOARD_API_KEY}"},
    )
    response.raise_for_status()
    return response.json()
