from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from starlette.responses import Response

from app.models.schemas import AuthenticatedUser, BuildingSummary, IndoorBuildingCreate, IndoorBuildingData
from app.services.auth_client import verify_token_with_auth_api
from app.services.building_service import create_building, list_building_summaries, update_building
from app.services.logging_service import emit_log
from app.services.repository import MapRepository

router = APIRouter()
bearer_scheme = HTTPBearer(auto_error=False)
_repo: Optional[MapRepository] = None


def set_repository(repo: MapRepository) -> None:
    global _repo
    _repo = repo


def _require_repository() -> MapRepository:
    if _repo is None:
        raise RuntimeError("Map repository not configured")
    return _repo


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> AuthenticatedUser:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return await verify_token_with_auth_api(credentials.credentials)


def _is_owner_or_admin(user: AuthenticatedUser, building: IndoorBuildingData) -> bool:
    return user.is_admin or building.author == user.username


@router.get("/")
def index() -> dict[str, str]:
    return {"Service_Name": "MapAPI", "Author": "Thomas Sargent"}


@router.get("/buildings", response_model=list[BuildingSummary])
async def list_buildings(user: AuthenticatedUser = Depends(get_current_user)) -> list[BuildingSummary]:
    summaries = list_building_summaries(_require_repository())
    if user.is_admin:
        return summaries
    return [summary for summary in summaries if summary.author == user.username]


@router.get("/buildings/all", response_model=list[BuildingSummary])
async def list_all_buildings() -> list[BuildingSummary]:
    return list_building_summaries(_require_repository())


@router.get("/buildings/{building_id}", response_model=IndoorBuildingData)
async def get_building(
    building_id: str
) -> IndoorBuildingData:
    building = _require_repository().get_building(building_id)
    if building is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Building not found")
    return building


@router.post("/buildings", response_model=IndoorBuildingData, status_code=status.HTTP_201_CREATED)
async def create(payload: IndoorBuildingCreate, user: AuthenticatedUser = Depends(get_current_user)) -> IndoorBuildingData:
    building = create_building(_require_repository(), payload, user.username)
    await emit_log(
        {
            "service": "map_api",
            "level": "info",
            "message": "building.created",
            "user": user.username,
            "path": f"/buildings/{building.id}",
        }
    )
    return building


@router.put("/buildings/{building_id}", response_model=IndoorBuildingData)
async def update(
    building_id: str,
    payload: IndoorBuildingCreate,
    user: AuthenticatedUser = Depends(get_current_user),
) -> IndoorBuildingData:
    existing = _require_repository().get_building(building_id)
    if existing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Building not found")
    if not _is_owner_or_admin(user, existing):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    building = update_building(_require_repository(), building_id, payload, existing.author)
    if building is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Building not found")

    await emit_log(
        {
            "service": "map_api",
            "level": "info",
            "message": "building.updated",
            "user": user.username,
            "path": f"/buildings/{building_id}",
        }
    )
    return building


@router.delete("/buildings/{building_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(building_id: str, user: AuthenticatedUser = Depends(get_current_user)) -> Response:
    existing = _require_repository().get_building(building_id)
    if existing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Building not found")
    if not _is_owner_or_admin(user, existing):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    if not _require_repository().delete_building(building_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Building not found")

    await emit_log(
        {
            "service": "map_api",
            "level": "info",
            "message": "building.deleted",
            "user": user.username,
            "path": f"/buildings/{building_id}",
        }
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
