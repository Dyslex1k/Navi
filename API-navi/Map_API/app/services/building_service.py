from __future__ import annotations

import uuid

from typing import Any

from app.models.schemas import BuildingSummary, IndoorBuildingCreate, IndoorBuildingData
from app.services.repository import MapRepository


def count_rooms(geojson: dict[str, Any]) -> int:
    features = geojson.get("features")
    if not isinstance(features, list):
        return 0

    count = 0
    for feature in features:
        if not isinstance(feature, dict):
            continue
        properties = feature.get("properties")
        if not isinstance(properties, dict):
            continue
        feature_type = properties.get("feature_type")
        if isinstance(feature_type, str) and feature_type.strip().lower() == "unit":
            count += 1
    return count


def list_building_summaries(repo: MapRepository) -> list[BuildingSummary]:
    buildings = repo.list_buildings()
    return [
        BuildingSummary(
            id=building.id,
            name=building.name,
            coords=building.coords,
            floors=building.floors,
            rooms=count_rooms(building.baseMap),
            author=building.author,
        )
        for building in buildings
    ]


def create_building(repo: MapRepository, payload: IndoorBuildingCreate, author: str) -> IndoorBuildingData:
    building = IndoorBuildingData(id=str(uuid.uuid4()), author=author, **payload.model_dump())
    repo.create_building(building)
    return building


def update_building(
    repo: MapRepository,
    building_id: str,
    payload: IndoorBuildingCreate,
    author: str | None,
) -> IndoorBuildingData | None:
    building = IndoorBuildingData(id=building_id, author=author, **payload.model_dump())
    if not repo.update_building(building):
        return None
    return building
