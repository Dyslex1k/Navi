from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


class LogCreate(BaseModel):
    service: str = Field(default="unknown", min_length=1, max_length=64)
    level: str = Field(default="info", min_length=1, max_length=16)
    message: str = Field(default="")
    method: Optional[str] = None
    path: Optional[str] = None
    status_code: Optional[int] = None
    duration_ms: Optional[float] = None
    user: Optional[str] = None


class LogEntry(LogCreate):
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
