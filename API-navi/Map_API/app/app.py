from __future__ import annotations

import logging
import os
import time
from contextlib import asynccontextmanager
from typing import Awaitable, Callable

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import Response

from app.routers.map import router, set_repository
from app.services.logging_service import emit_log
from app.services.repository import MapRepository

logging.basicConfig(level=logging.INFO)

ROOT_PATH = os.getenv("ROOT_PATH", "")
MONGO_URI = os.getenv("MONGO_URI", "")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

REPOSITORY = MapRepository(MONGO_URI, REDIS_URL)


@asynccontextmanager
async def lifespan(_: FastAPI):
    REPOSITORY.init()
    yield


app = FastAPI(title="MapAPI", root_path=ROOT_PATH, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
set_repository(REPOSITORY)
app.include_router(router)

# Used by tests is needed.
_BUILDINGS = REPOSITORY.in_memory_buildings


@app.middleware("http")
async def request_logging_middleware(
    request: Request,
    call_next: Callable[[Request], Awaitable[Response]],
) -> Response:
    started = time.perf_counter()
    response = await call_next(request)
    duration_ms = round((time.perf_counter() - started) * 1000, 2)
    await emit_log(
        {
            "service": "map_api",
            "level": "info",
            "message": "request.completed",
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": duration_ms,
        }
    )
    return response
