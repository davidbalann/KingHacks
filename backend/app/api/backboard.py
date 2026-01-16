import json
import logging
from typing import Optional, Any, Callable

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..db import get_conn
from ..geo import bbox, haversine_km
from ..settings import (
    BACKBOARD_API_KEY,
    BACKBOARD_API_URL,
    BACKBOARD_MODEL,
)

try:
    from backboard import BackboardClient  # type: ignore
except Exception:
    BackboardClient = None  # SDK not installed or failed to import

router = APIRouter()
logger = logging.getLogger("caremap.backboard")


class BackboardRequest(BaseModel):
    query: str = Field(..., min_length=1, description="End-user question")
    latitude: float
    longitude: float
    radius_km: float = Field(3.0, ge=0.1, le=50.0)
    limit: int = Field(15, ge=1, le=100)
    category: Optional[str] = Field(None, description="Optional category filter")


def _nearby_places(latitude: float, longitude: float, radius_km: float, limit: int, category: Optional[str]):
    lat_min, lat_max, lon_min, lon_max = bbox(latitude, longitude, radius_km)

    q = """
      SELECT id, name, category, address, latitude, longitude, phone, website, last_verified
      FROM places
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        AND latitude BETWEEN ? AND ?
        AND longitude BETWEEN ? AND ?
    """
    params = [lat_min, lat_max, lon_min, lon_max]

    if category:
        q += " AND category = ?"
        params.append(category)

    conn = get_conn()
    rows = conn.execute(q, params).fetchall()
    conn.close()

    scored = []
    for r in rows:
        d = haversine_km(latitude, longitude, r["latitude"], r["longitude"])
        if d <= radius_km:
            scored.append(
                {
                    "id": r["id"],
                    "name": r["name"],
                    "category": r["category"],
                    "address": r["address"],
                    "latitude": r["latitude"],
                    "longitude": r["longitude"],
                    "distance_km": round(d, 3),
                    "phone": r["phone"],
                    "website": r["website"],
                    "last_verified": r["last_verified"],
                }
            )

    scored.sort(key=lambda x: x["distance_km"])
    return scored[:limit]


@router.post("/backboard")
async def backboard_chat(req: BackboardRequest):
    if not BACKBOARD_API_KEY:
        raise HTTPException(status_code=500, detail="Backboard API key not configured")

    context_places = _nearby_places(req.latitude, req.longitude, req.radius_km, req.limit, req.category)

    context_payload = {
        "user_location": {"latitude": req.latitude, "longitude": req.longitude, "radius_km": req.radius_km},
        "nearby_services": context_places,
    }
    system_prompt = _build_system_prompt(context_payload)
    if BackboardClient is None:
        raise HTTPException(status_code=500, detail="Backboard SDK not installed. Run: pip install backboard-sdk")

    try:
        data = await _call_backboard_sdk(system_prompt, req.query)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Backboard SDK request error: {e}") from e

    answer = ""
    choices = data.get("choices") if isinstance(data, dict) else None
    if isinstance(choices, list) and choices:
        first = choices[0] or {}
        msg = first.get("message") or {}
        if isinstance(msg, dict):
            answer = msg.get("content") or ""
    if not answer and isinstance(data, dict):
        answer = data.get("content") or ""

    return {
        "answer": answer,
        "context_used": context_places,
        "backboard": data,
    }


def _build_system_prompt(context_payload: dict) -> str:
    context_str = _escape_template(json.dumps(context_payload, ensure_ascii=False))
    return (
        "You are a helpful assistant for the Kingston CareMap. "
        "Use ONLY the provided nearby services context to answer questions about resources. "
        "If the answer is not in the context, say you don't know. Keep answers concise.\n\n"
        f"Context JSON (services near the user): {context_str}"
    )


async def _call_backboard_sdk(system_prompt: str, user_query: str):
    if BackboardClient is None:
        raise RuntimeError("Backboard SDK not installed")

    client = BackboardClient(api_key=BACKBOARD_API_KEY, base_url=BACKBOARD_API_URL)
    assistant = await client.create_assistant(name="CareMap Assistant", description=system_prompt)
    thread = await client.create_thread(assistant.assistant_id)
    content = _escape_template(f"{system_prompt}\n\nUser question: {user_query}")
    resp = await client.add_message(
        thread_id=thread.thread_id,
        content=content,
        llm_provider="openai",
        model_name=BACKBOARD_MODEL,
        stream=False,
    )
    # Normalize response to align with completion-like structure
    normalized = _normalize_response(resp)
    out = {
        "assistant_id": getattr(assistant, "assistant_id", None),
        "thread_id": getattr(thread, "thread_id", None),
        "content": getattr(resp, "content", None),
        "raw": normalized,
    }
    # Also expose in a choices-like shape for compatibility
    out["choices"] = [
        {
            "message": {
                "role": "assistant",
                "content": out["content"],
            }
        }
    ]
    return out


def _normalize_response(resp: Any) -> dict:
    if resp is None:
        return {}
    if isinstance(resp, dict):
        return resp
    # Pydantic v2 model_dump
    md: Optional[Callable] = getattr(resp, "model_dump", None)
    if callable(md):
        return md()
    td: Optional[Callable] = getattr(resp, "to_dict", None)
    if callable(td):
        return td()
    try:
        return json.loads(resp)
    except Exception:
        return {"data": str(resp)}


def _escape_template(text: str) -> str:
    """
    Escape curly braces so Backboard's LangChain prompt templating does not treat
    context JSON keys as variables.
    """
    return text.replace("{", "{{").replace("}", "}}")
