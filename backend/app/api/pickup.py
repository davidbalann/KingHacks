# backend/app/api/pickup.py

from datetime import time
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, validator

from ..models.pickups import post_pickup_window

router = APIRouter()


class PickupRequest(BaseModel):
    business_name: str = Field(..., min_length=1, description="Name of the business posting surplus")
    pickup_time_start: time = Field(..., description="Pickup start time (HH:MM)")
    pickup_time_end: time = Field(..., description="Pickup end time (HH:MM)")
    notes: Optional[str] = Field(default=None, max_length=500)
    auth_code: str = Field(..., min_length=4, max_length=64, description="One-time PIN for authentication")

    @validator("business_name", "auth_code")
    def strip_required_fields(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Value cannot be blank")
        return cleaned

    @validator("notes")
    def normalize_notes(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None

    @validator("pickup_time_end")
    def validate_time_order(cls, end: time, values):
        start = values.get("pickup_time_start")
        if start and end <= start:
            raise ValueError("pickup_time_end must be later than pickup_time_start")
        return end

    def to_db_payload(self) -> dict:
        return {
            "business_name": self.business_name.strip(),
            "pickup_time_start": self.pickup_time_start.strftime("%H:%M"),
            "pickup_time_end": self.pickup_time_end.strftime("%H:%M"),
            "notes": self.notes.strip() if isinstance(self.notes, str) else None,
            "auth_code": self.auth_code.strip(),
        }


@router.post("/post-pickup")
async def post_pickup(pickup_data: PickupRequest):
    try:
        pickup_id = post_pickup_window(pickup_data.to_db_payload())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to post pickup window")

    return {"message": "Pickup window posted successfully", "pickup_id": pickup_id}
