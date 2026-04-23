from __future__ import annotations

import os
import secrets
from typing import Optional

from pymongo.errors import DuplicateKeyError

from app.models.schemas import LoginRequest, RegisterRequest, TokenResponse, UserPublic, UserRecord
from app.services.security import hash_password, verify_password
from app.services.store import AuthStore

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")


def initalise_admin_user(store: AuthStore) -> None:
    if store.get_user(ADMIN_USERNAME) is not None:
        return

    admin = UserRecord(
        username=ADMIN_USERNAME,
        password_hash=hash_password(ADMIN_PASSWORD),
        is_admin=True,
    )

    try:
        store.create_user(admin)
    except DuplicateKeyError:
        return


def register_user(store: AuthStore, payload: RegisterRequest, actor: Optional[UserRecord]) -> UserPublic:
    if store.get_user(payload.username) is not None:
        raise ValueError("username_exists")

    user = UserRecord(
        username=payload.username,
        password_hash=hash_password(payload.password),
        is_admin=False,
    )

    try:
        store.create_user(user)
    except DuplicateKeyError as e:
        raise ValueError("username_exists") from e

    return UserPublic(username=user.username, is_admin=user.is_admin)


def login_user(store: AuthStore, payload: LoginRequest) -> TokenResponse:
    user = store.get_user(payload.username)
    if user is None or not verify_password(payload.password, user.password_hash):
        raise ValueError("invalid_credentials")

    token = secrets.token_urlsafe(32)
    store.store_token(token, user.username)
    return TokenResponse(access_token=token)


def logout_token(store: AuthStore, token: str) -> bool:
    return store.pop_token(token)


def resolve_user_by_token(store: AuthStore, token: str) -> Optional[UserRecord]:
    return store.get_user_from_token(token)
