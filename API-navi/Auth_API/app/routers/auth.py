from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.models.schemas import LoginRequest, RegisterRequest, TokenResponse, UserPublic, UserRecord
from app.services.auth_service import login_user, logout_token, register_user, resolve_user_by_token
from app.services.store import AuthStore

router = APIRouter()
bearer_scheme = HTTPBearer(auto_error=False)
_store: Optional[AuthStore] = None


def set_store(store: AuthStore) -> None:
    global _store
    _store = store


def _require_store() -> AuthStore:
    if _store is None:
        raise RuntimeError("Auth store not configured")
    return _store


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> UserRecord:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    user = resolve_user_by_token(_require_store(), credentials.credentials)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    return user


async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Optional[UserRecord]:
    if credentials is None:
        return None
    return resolve_user_by_token(_require_store(), credentials.credentials)


@router.get("/")
def index() -> dict[str, str]:
    return {"Service_Name": "AuthAPI", "Author": "Thomas Sargent"}


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def register(
    payload: RegisterRequest,
    actor: Optional[UserRecord] = Depends(get_optional_current_user),
) -> UserPublic:
    try:
        return register_user(_require_store(), payload, actor)
    except ValueError as e:
        if str(e) == "username_exists":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already exists") from e
        raise
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required") from e


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest) -> TokenResponse:
    try:
        return login_user(_require_store(), payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials") from e


@router.post("/logout")
async def logout(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> dict[str, str]:
    if credentials is None or not logout_token(_require_store(), credentials.credentials):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return {"detail": "Logged out"}


@router.get("/me", response_model=UserPublic)
async def me(user: UserRecord = Depends(get_current_user)) -> UserPublic:
    return UserPublic(username=user.username, is_admin=user.is_admin)


@router.post("/verify-token", response_model=UserPublic)
async def verify_token(user: UserRecord = Depends(get_current_user)) -> UserPublic:
    return UserPublic(username=user.username, is_admin=user.is_admin)
