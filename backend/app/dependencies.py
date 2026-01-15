from typing import Optional

from fastapi import Header, HTTPException, Query


def _clean_user_id(user_id: Optional[str]) -> Optional[str]:
    if not user_id:
        return None
    cleaned = user_id.strip()
    return cleaned or None


def get_user_id_from_request(
    x_device_id: Optional[str] = Header(default=None, convert_underscores=False),
    user_id: Optional[str] = Query(default=None),
) -> Optional[str]:
    """
    Pull a user identifier from the request.
    - Prefer the X-Device-Id header (stable per device).
    - Fall back to a user_id query string parameter.
    Returns None if neither is present.
    """
    for candidate in (x_device_id, user_id):
        cleaned = _clean_user_id(candidate)
        if cleaned:
            return cleaned
    return None


def require_user_id(
    x_device_id: Optional[str] = Header(default=None, convert_underscores=False),
    user_id: Optional[str] = Query(default=None),
) -> str:
    resolved = get_user_id_from_request(x_device_id=x_device_id, user_id=user_id)
    if not resolved:
        raise HTTPException(
            status_code=400,
            detail="user_id is required. Send it in the X-Device-Id header or user_id query parameter.",
        )
    return resolved
