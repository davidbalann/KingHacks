# backend/app/models/watchlist.py

# In-memory store for WatchList (could be replaced with a database in future)
watchlist_db = []

def add_to_watchlist(service_id: int):
    watchlist_db.append(service_id)

def get_watchlist():
    return watchlist_db
