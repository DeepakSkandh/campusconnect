"""FastAPI application factory and the ASGI app used by Uvicorn (`app.main:app`)."""

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import Settings, get_settings
from app.db.session import dispose_engine

logger = logging.getLogger(__name__)

# Explicit lists rather than "*": only what the frontend actually sends.
CORS_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
CORS_HEADERS = ["Accept", "Content-Type", "Idempotency-Key"]


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings: Settings = app.state.settings
    # Never log settings wholesale; only non-secret fields.
    logger.info("Starting %s (environment=%s)", settings.app_name, settings.environment)
    yield
    dispose_engine()
    logger.info("Stopped %s", settings.app_name)


def create_app(settings: Settings | None = None) -> FastAPI:
    """Build the application. Pass `settings` in tests to avoid reading the real .env."""
    settings = settings or get_settings()
    prefix = settings.api_v1_prefix

    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        openapi_url=f"{prefix}/openapi.json",
        docs_url=f"{prefix}/docs",
        redoc_url=None,
        lifespan=lifespan,
    )
    app.state.settings = settings

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        # The frontend sends credentials (session cookie in later phases).
        allow_credentials=True,
        allow_methods=CORS_METHODS,
        allow_headers=CORS_HEADERS,
    )

    app.include_router(api_router, prefix=prefix)
    return app


app = create_app()
