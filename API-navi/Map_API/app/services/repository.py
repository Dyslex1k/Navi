from __future__ import annotations

import json
import logging
from typing import Any, Optional

from pymongo import MongoClient
from pymongo.collection import Collection
from redis import Redis

from app.models.schemas import IndoorBuildingData


class MapRepository:
    def __init__(self, mongo_uri: str, redis_url: str) -> None:
        self._logger = logging.getLogger("map_api")
        self._mongo_uri = mongo_uri
        self._redis_url = redis_url

        self._mongo_client: Optional[MongoClient[dict[str, Any]]] = None
        self._buildings_collection: Optional[Collection[dict[str, Any]]] = None
        self._redis_client: Optional[Redis] = None

        self._buildings: dict[str, IndoorBuildingData] = {}

    def init(self) -> None:
        self._init_mongo()
        self._init_redis()

    def _init_mongo(self) -> None:
        if not self._mongo_uri:
            self._logger.warning("MONGO_URI not set; using in-memory map store")
            return

        try:
            self._mongo_client = MongoClient(self._mongo_uri, serverSelectionTimeoutMS=2000)
            self._mongo_client.admin.command("ping")
            db = self._mongo_client.get_default_database()
            self._buildings_collection = db["buildings"]
            self._buildings_collection.create_index("id", unique=True)
            self._logger.info("Map API connected to MongoDB")
        except Exception as e:
            self._logger.error("MongoDB unavailable for map store: %s", e)
            self._mongo_client = None
            self._buildings_collection = None

    def _init_redis(self) -> None:
        try:
            self._redis_client = Redis.from_url(self._redis_url, decode_responses=True)
            self._redis_client.ping()
            self._logger.info("Map API connected to Redis")
        except Exception as e:
            self._logger.error("Redis unavailable for map cache: %s", e)
            self._redis_client = None

    def _cache_key(self, building_id: str) -> str:
        return f"building:{building_id}"

    def _cache_get_building(self, building_id: str) -> Optional[IndoorBuildingData]:
        if self._redis_client is None:
            return None

        cached = self._redis_client.get(self._cache_key(building_id))
        if cached is None:
            return None

        try:
            return IndoorBuildingData(**json.loads(cached))
        except (json.JSONDecodeError, ValueError):
            return None

    def _cache_set_building(self, building: IndoorBuildingData) -> None:
        if self._redis_client is None:
            return

        self._redis_client.set(self._cache_key(building.id), json.dumps(building.model_dump()))

    def _cache_delete_building(self, building_id: str) -> None:
        if self._redis_client is None:
            return

        self._redis_client.delete(self._cache_key(building_id))

    def _mongo_ready(self) -> bool:
        return self._buildings_collection is not None

    def _doc_to_building(self, doc: dict[str, Any]) -> IndoorBuildingData:
        clean_doc = {k: v for k, v in doc.items() if k != "_id"}
        return IndoorBuildingData(**clean_doc)

    def list_buildings(self) -> list[IndoorBuildingData]:
        if self._mongo_ready():
            assert self._buildings_collection is not None
            docs = self._buildings_collection.find({}, {"_id": 0})
            return [self._doc_to_building(doc) for doc in docs]

        return list(self._buildings.values())

    def get_building(self, building_id: str) -> Optional[IndoorBuildingData]:
        cached = self._cache_get_building(building_id)
        if cached is not None:
            return cached

        if self._mongo_ready():
            assert self._buildings_collection is not None
            doc = self._buildings_collection.find_one({"id": building_id}, {"_id": 0})
            if doc is None:
                return None
            building = self._doc_to_building(doc)
            self._cache_set_building(building)
            return building

        return self._buildings.get(building_id)

    def create_building(self, building: IndoorBuildingData) -> None:
        if self._mongo_ready():
            assert self._buildings_collection is not None
            self._buildings_collection.insert_one(building.model_dump())
        else:
            self._buildings[building.id] = building

        self._cache_set_building(building)

    def update_building(self, building: IndoorBuildingData) -> bool:
        if self._mongo_ready():
            assert self._buildings_collection is not None
            result = self._buildings_collection.replace_one({"id": building.id}, building.model_dump())
            if result.matched_count == 0:
                return False
            self._cache_set_building(building)
            return True

        if building.id not in self._buildings:
            return False

        self._buildings[building.id] = building
        self._cache_set_building(building)
        return True

    def delete_building(self, building_id: str) -> bool:
        if self._mongo_ready():
            assert self._buildings_collection is not None
            result = self._buildings_collection.delete_one({"id": building_id})
            if result.deleted_count == 0:
                return False
            self._cache_delete_building(building_id)
            return True

        if building_id not in self._buildings:
            return False

        del self._buildings[building_id]
        self._cache_delete_building(building_id)
        return True

    def clear_memory_state(self) -> None:
        self._buildings.clear()

    @property
    def in_memory_buildings(self) -> dict[str, IndoorBuildingData]:
        return self._buildings
