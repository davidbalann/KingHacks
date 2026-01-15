import os
from pathlib import Path
from typing import Optional


BACKEND_ROOT = Path(__file__).resolve().parents[2]


def _extract_key_from_env_file(path: Path) -> Optional[str]:
    content = path.read_text(encoding="utf-8").strip()
    if not content:
        return None
    if "GOOGLE_API_KEY" in content:
        for line in content.splitlines():
            if "GOOGLE_API_KEY" in line and "=" in line:
                return line.split("=", 1)[1].strip().strip("'").strip('"')
    return content


def load_google_api_key(raise_on_missing: bool = False) -> Optional[str]:
    env_key = os.getenv("GOOGLE_API_KEY")
    if env_key:
        return env_key.strip()

    candidates = [
        BACKEND_ROOT / "google_api_key.txt",
        BACKEND_ROOT / ".google_api_key",
        BACKEND_ROOT / ".env",
        BACKEND_ROOT.parent / ".env",
    ]

    for path in candidates:
        if not path.exists():
            continue
        key = _extract_key_from_env_file(path)
        if key:
            return key

    if raise_on_missing:
        raise RuntimeError(
            "GOOGLE_API_KEY not found. Set the env var or place it in backend/google_api_key.txt"
        )
    return None
