from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.get("/backboard")
def backboard_stub():
    raise HTTPException(status_code=501, detail="Backboard not implemented yet (stub)")
