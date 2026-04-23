from __future__ import annotations

import logging
from typing import Any, Optional

from pymongo import MongoClient
from pymongo.collection import Collection

from app.models.schemas import LogEntry


class LogRepository:
    def __init__(self, mongo_uri: str) -> None:
        self._logger = logging.getLogger("logging_api")
        self._mongo_uri = mongo_uri
        self._mongo_client: Optional[MongoClient[dict[str, Any]]] = None
        self._logs_collection: Optional[Collection[dict[str, Any]]] = None

        self._logs: list[LogEntry] = []

    def init(self) -> None:
        if not self._mongo_uri:
            self._logger.warning("MONGO_URI not set; using in-memory logging store")
            return

        try:
            self._mongo_client = MongoClient(self._mongo_uri, serverSelectionTimeoutMS=2000)
            self._mongo_client.admin.command("ping")
            db = self._mongo_client.get_default_database()
            self._logs_collection = db["logs"]
            self._logs_collection.create_index("timestamp")
            self._logs_collection.create_index("service")
            self._logs_collection.create_index("level")
            self._logger.info("Logging API connected to MongoDB")
        except Exception as e:
            self._logger.error("MongoDB unavailable for logs: %s", e)
            self._mongo_client = None
            self._logs_collection = None

    def _mongo_ready(self) -> bool:
        return self._logs_collection is not None

    def save(self, entry: LogEntry) -> None:
        if self._mongo_ready():
            assert self._logs_collection is not None
            self._logs_collection.insert_one(entry.model_dump())
            return

        self._logs.append(entry)

    def query(self, service: Optional[str], level: Optional[str], limit: int) -> list[LogEntry]:
        if self._mongo_ready():
            assert self._logs_collection is not None
            query: dict[str, Any] = {}
            if service:
                query["service"] = service
            if level:
                query["level"] = level

            docs = self._logs_collection.find(query, {"_id": 0}).sort("timestamp", -1).limit(limit)
            return [LogEntry(**doc) for doc in docs]

        entries = self._logs
        if service:
            entries = [entry for entry in entries if entry.service == service]
        if level:
            entries = [entry for entry in entries if entry.level == level]
        return entries[-limit:]

    def clear(self) -> None:
        if self._mongo_ready():
            assert self._logs_collection is not None
            self._logs_collection.delete_many({})
            return

        self._logs.clear()

    def clear_memory_state(self) -> None:
        self._logs.clear()

    @property
    def in_memory_logs(self) -> list[LogEntry]:
        return self._logs
