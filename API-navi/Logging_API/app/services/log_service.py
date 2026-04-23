from __future__ import annotations

from app.models.schemas import LogCreate, LogEntry
from app.services.repository import LogRepository


def create_log_entry(repo: LogRepository, payload: LogCreate) -> LogEntry:
    entry = LogEntry(**payload.model_dump())
    repo.save(entry)
    return entry
