from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from backend.app.dependencies import require_user_id
from backend.app.services.backboard import save_user_preferences, get_user_preferences, add_to_watchlist, get_watchlist

router = APIRouter()

class UserPreferences(BaseModel):
    language: str
    filter: str

class WatchListRequest(BaseModel):
    listing_id: int

# Endpoint to save user preferences
@router.post("/memory/optin")
async def opt_in_preferences(preferences: UserPreferences, user_id: str = Depends(require_user_id)):
    try:
        # Save the preferences to Backboard
        save_user_preferences(user_id, preferences.dict())
        return {"message": "Preferences saved successfully"}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

# Endpoint to retrieve user preferences
@router.get("/memory/preferences")
async def get_preferences(user_id: str = Depends(require_user_id)):
    try:
        preferences = get_user_preferences(user_id)
        return {"preferences": preferences}
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to retrieve preferences")

# Endpoint to add an item to the Watch List
@router.post("/watchlist/add")
async def add_item_to_watchlist(watchlist_data: WatchListRequest, user_id: str = Depends(require_user_id)):
    try:
        # Add the item to the watchlist
        add_to_watchlist(user_id, watchlist_data.listing_id)
        return {"message": "Item added to Watch List"}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

# Endpoint to retrieve the user's Watch List
@router.get("/watchlist")
async def get_user_watchlist(user_id: str = Depends(require_user_id)):
    try:
        watchlist = get_watchlist(user_id)
        return {"watchlist": watchlist}
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to retrieve Watch List")
