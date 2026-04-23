from __future__ import annotations

import logging
import os
import time
from contextlib import asynccontextmanager
from typing import Awaitable, Callable

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import Response

from app.routers.auth import router, set_store
from app.services.auth_service import initalise_admin_user as initalise_admin_user_impl
from app.services.logging_service import emit_log
from app.services.store import AuthStore

logging.basicConfig(level=logging.INFO)

ROOT_PATH = os.getenv("ROOT_PATH", "")
MONGO_URI = os.getenv("MONGO_URI", "")

STORE = AuthStore(MONGO_URI)


@asynccontextmanager
async def lifespan(_: FastAPI):
    STORE.init()
    initalise_admin_user_impl(STORE)
    yield


app = FastAPI(title="AuthAPI", lifespan=lifespan, root_path=ROOT_PATH)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
set_store(STORE)
app.include_router(router)


def initalise_admin_user_for_tests() -> None:
    initalise_admin_user_impl(STORE)


initalise_admin_user = initalise_admin_user_for_tests


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
            "service": "auth_api",
            "level": "info",
            "message": "request.completed",
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": duration_ms,
        }
    )
    return response
