from __future__ import annotations

import logging
import os
from typing import Any

import httpx

LOGGING_API_URL = os.getenv("LOGGING_API_URL", "http://logging_api:8001")
logger = logging.getLogger("auth_api")


async def emit_log(payload: dict[str, Any]) -> None:
    logger.info("%s", payload)
    try:
        async with httpx.AsyncClient(timeout=1.5) as client:
            await client.post(f"{LOGGING_API_URL}/logs", json=payload)
    except Exception:
        return
