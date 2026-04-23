from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Query

from app.models.schemas import LogCreate, LogEntry
from app.services.log_service import create_log_entry
from app.services.repository import LogRepository

logger = logging.getLogger("logging_api")

router = APIRouter()
_repo: Optional[LogRepository] = None


def set_repository(repo: LogRepository) -> None:
    global _repo
    _repo = repo


def _require_repository() -> LogRepository:
    if _repo is None:
        raise RuntimeError("Log repository not configured")
    return _repo


@router.get("/")
def index() -> dict[str, str]:
    return {"Service_Name": "LoggingAPI", "Author": "Thomas Sargent"}


@router.post("/logs", response_model=LogEntry, status_code=201)
async def create_log(payload: LogCreate) -> LogEntry:
    entry = create_log_entry(_require_repository(), payload)
    logger.info("%s", entry.model_dump())
    return entry


@router.get("/logs", response_model=list[LogEntry])
async def list_logs(
    service: str | None = Query(default=None),
    level: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=1000),
) -> list[LogEntry]:
    return _require_repository().query(service, level, limit)


@router.delete("/logs")
async def clear_logs() -> dict[str, str]:
    _require_repository().clear()
    return {"detail": "Logs cleared"}
