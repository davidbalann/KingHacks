# backend/app/api/watchlist.py

from typing import Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel

from backend.app.dependencies import require_user_id
from backend.app.models.watchlist import add_to_watchlist, get_watchlist


class ServiceRequest(BaseModel):
    service_id: int


router = APIRouter()


@router.post("/watchlist/add")
async def add_service_to_watchlist(
    service_request: Optional[ServiceRequest] = Body(default=None),
    service_id: Optional[int] = Query(default=None),
    user_id: str = Depends(require_user_id),
):
    resolved_service_id = service_request.service_id if service_request else service_id
    if resolved_service_id is None:
        raise HTTPException(
            status_code=422,
            detail="Missing service_id in body or query.",
        )

    try:
        add_to_watchlist(user_id, resolved_service_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return {"message": "Service added to watchlist"}


@router.get("/watchlist")
async def get_user_watchlist(user_id: str = Depends(require_user_id)):
    try:
        watchlist = get_watchlist(user_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return {"watchlist": watchlist}
