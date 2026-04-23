from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Optional

from pymongo import MongoClient
from pymongo.collection import Collection

from app.models.schemas import UserRecord


class AuthStore:
    def __init__(self, mongo_uri: str) -> None:
        self._logger = logging.getLogger("auth_api")
        self._mongo_uri = mongo_uri
        self._mongo_client: Optional[MongoClient[dict[str, Any]]] = None
        self._users_collection: Optional[Collection[dict[str, Any]]] = None
        self._tokens_collection: Optional[Collection[dict[str, Any]]] = None

        self._users: dict[str, UserRecord] = {}
        self._tokens: dict[str, str] = {}

    def init(self) -> None:
        if not self._mongo_uri:
            self._logger.warning("MONGO_URI not set; using in-memory auth store")
            return

        try:
            self._mongo_client = MongoClient(self._mongo_uri, serverSelectionTimeoutMS=2000)
            self._mongo_client.admin.command("ping")
            db = self._mongo_client.get_default_database()
            self._users_collection = db["users"]
            self._tokens_collection = db["tokens"]
            self._users_collection.create_index("username", unique=True)
            self._tokens_collection.create_index("token", unique=True)
            self._tokens_collection.create_index("username")
            self._logger.info("Auth API connected to MongoDB")
        except Exception as e:
            self._logger.error("MongoDB unavailable for auth store: %s", e)
            self._mongo_client = None
            self._users_collection = None
            self._tokens_collection = None

    def uses_mongo(self) -> bool:
        return self._users_collection is not None and self._tokens_collection is not None

    def get_user(self, username: str) -> Optional[UserRecord]:
        if self.uses_mongo():
            assert self._users_collection is not None
            doc = self._users_collection.find_one({"username": username}, {"_id": 0})
            if doc is None:
                return None
            return UserRecord(**doc)

        return self._users.get(username)

    def create_user(self, user: UserRecord) -> None:
        if self.uses_mongo():
            assert self._users_collection is not None
            self._users_collection.insert_one(user.model_dump())
            return

        self._users[user.username] = user

    def store_token(self, token: str, username: str) -> None:
        if self.uses_mongo():
            assert self._tokens_collection is not None
            self._tokens_collection.insert_one(
                {
                    "token": token,
                    "username": username,
                    "created_at": datetime.now(timezone.utc),
                }
            )
            return

        self._tokens[token] = username

    def pop_token(self, token: str) -> bool:
        if self.uses_mongo():
            assert self._tokens_collection is not None
            result = self._tokens_collection.delete_one({"token": token})
            return result.deleted_count == 1

        return self._tokens.pop(token, None) is not None

    def get_user_from_token(self, token: str) -> Optional[UserRecord]:
        if self.uses_mongo():
            assert self._tokens_collection is not None
            token_doc = self._tokens_collection.find_one({"token": token}, {"_id": 0, "username": 1})
            if token_doc is None:
                return None

            username = token_doc.get("username")
            if not isinstance(username, str):
                return None
            return self.get_user(username)

        username = self._tokens.get(token)
        if username is None:
            return None
        return self._users.get(username)
