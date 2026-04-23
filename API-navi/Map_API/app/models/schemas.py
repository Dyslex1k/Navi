from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class Coordinates(BaseModel):
    latitude: float
    longitude: float


class BuildingSummary(BaseModel):
    id: str
    name: str
    coords: Coordinates
    floors: int
    rooms: int
    author: str | None = None


class IndoorBuildingData(BaseModel):
    id: str
    name: str
    coords: Coordinates
    floors: int = Field(ge=1)
    baseMap: dict[str, Any]
    NavGraph: dict[str, Any]
    BeaconPositions: dict[str, Any]
    author: str | None = None


class IndoorBuildingCreate(BaseModel):
    name: str = Field(min_length=1, max_length=128)
    coords: Coordinates
    floors: int = Field(ge=1)
    baseMap: dict[str, Any]
    NavGraph: dict[str, Any]
    BeaconPositions: dict[str, Any]


class PathEdgeProperties(BaseModel):
    from_id: str
    to_id: str
    cost: str | int | float | None = None


class AuthenticatedUser(BaseModel):
    username: str
    is_admin: bool = False
