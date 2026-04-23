from __future__ import annotations

import logging
import os
import time
from contextlib import asynccontextmanager
from typing import Awaitable, Callable

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import Response

from app.models.schemas import LogEntry
from app.routers.logging import router, set_repository
from app.services.repository import LogRepository

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("logging_api")

ROOT_PATH = os.getenv("ROOT_PATH", "")
MONGO_URI = os.getenv("MONGO_URI", "")

REPOSITORY = LogRepository(MONGO_URI)


@asynccontextmanager
async def lifespan(_: FastAPI):
    REPOSITORY.init()
    yield


app = FastAPI(title="LoggingAPI", root_path=ROOT_PATH, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
set_repository(REPOSITORY)
app.include_router(router)

# Backward-compatible export used by tests.
_LOGS = REPOSITORY.in_memory_logs

@app.middleware("http")
async def request_logging_middleware(
    request: Request,
    call_next: Callable[[Request], Awaitable[Response]],
) -> Response:
    started = time.perf_counter()
    response = await call_next(request)
    duration_ms = round((time.perf_counter() - started) * 1000, 2)

    entry = LogEntry(
        service="logging_api",
        level="info",
        message="request.completed",
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
        duration_ms=duration_ms,
    )
    REPOSITORY.save(entry)
    logger.info("%s", entry.model_dump())
    return response
