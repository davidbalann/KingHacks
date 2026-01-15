# backend/app/models/watchlist.py

from typing import Dict, List

# In-memory store for WatchList keyed by user_id (could be replaced with a database in future)
watchlist_db: Dict[str, List[int]] = {}

def add_to_watchlist(user_id: str, service_id: int):
    if not user_id or not user_id.strip():
        raise ValueError("user_id is required.")
    cleaned_user_id = user_id.strip()

    user_watchlist = watchlist_db.setdefault(cleaned_user_id, [])
    if service_id not in user_watchlist:
        user_watchlist.append(service_id)

def get_watchlist(user_id: str):
    if not user_id or not user_id.strip():
        raise ValueError("user_id is required.")
    return watchlist_db.get(user_id.strip(), [])
