from pydantic import BaseModel
from typing import Optional, List

# NOTE: Day indexing is Google style: 0=Sunday, 6=Saturday
class PlaceHoursPeriodTime(BaseModel):
    day: int
    hour: int
    minute: int

class PlaceHoursPeriod(BaseModel):
    open: PlaceHoursPeriodTime
    close: Optional[PlaceHoursPeriodTime] = None

class PlaceHours(BaseModel):
    openNow: bool
    periods: List[PlaceHoursPeriod]
    weekdayDescriptions: List[str]
    nextOpenTime: Optional[str] = None
    nextCloseTime: Optional[str] = None

class Place(BaseModel):
    id: int
    name: str
    category: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    hours: Optional[PlaceHours] = None
    last_verified: Optional[str] = None
