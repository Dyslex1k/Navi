from __future__ import annotations

import os

import httpx
from fastapi import HTTPException, status

from app.models.schemas import AuthenticatedUser

AUTH_API_URL = os.getenv("AUTH_API_URL", "http://auth_api:8000")


async def verify_token_with_auth_api(token: str) -> AuthenticatedUser:
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            response = await client.post(
                f"{AUTH_API_URL}/verify-token",
                headers={"Authorization": f"Bearer {token}"},
            )
    except httpx.HTTPError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Auth service unavailable") from e

    if response.status_code != status.HTTP_200_OK:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    return AuthenticatedUser(**response.json())
