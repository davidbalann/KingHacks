# backend/app/api/watchlist.py

from fastapi import APIRouter, Body, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from backend.app.models.watchlist import add_to_watchlist, get_watchlist


class ServiceRequest(BaseModel):
    service_id: int


router = APIRouter()


@router.post("/watchlist/add")
async def add_service_to_watchlist(
    service_request: Optional[ServiceRequest] = Body(default=None),
    service_id: Optional[int] = Query(default=None),
):
    resolved_service_id = service_request.service_id if service_request else service_id
    if resolved_service_id is None:
        raise HTTPException(
            status_code=422,
            detail="Missing service_id in body or query.",
        )

    add_to_watchlist(resolved_service_id)
    return {"message": "Service added to watchlist"}


@router.get("/watchlist")
async def get_user_watchlist():
    watchlist = get_watchlist()
    return {"watchlist": watchlist}
