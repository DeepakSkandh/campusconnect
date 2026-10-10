from collections.abc import Iterator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.db import session as db_session
from app.main import create_app

# Settings keys a developer's shell might export; cleared so tests are deterministic.
_SETTINGS_ENV_VARS = (
    "APP_NAME",
    "ENVIRONMENT",
    "API_V1_PREFIX",
    "APP_TIMEZONE",
    "DATABASE_URL",
    "SECRET_KEY",
    "CORS_ORIGINS",
)

# The lru_cache-wrapped getters, captured at import. Tests may monkeypatch these
# module attributes, and _isolate's teardown runs before monkeypatch restores them,
# so clearing via `db_session.<name>` there could hit the patched stand-in.
_CACHED_DB_GETTERS = (db_session.get_session_factory, db_session.get_engine)


@pytest.fixture(autouse=True)
def _isolate(monkeypatch: pytest.MonkeyPatch) -> Iterator[None]:
    for name in _SETTINGS_ENV_VARS:
        monkeypatch.delenv(name, raising=False)
    for getter in _CACHED_DB_GETTERS:
        getter.cache_clear()
    yield
    for getter in _CACHED_DB_GETTERS:
        getter.cache_clear()


@pytest.fixture
def settings() -> Settings:
    # _env_file=None: never read the developer's real .env in tests.
    return Settings(_env_file=None, environment="test")


@pytest.fixture
def app(settings: Settings) -> FastAPI:
    return create_app(settings)


@pytest.fixture
def client(app: FastAPI) -> Iterator[TestClient]:
    # The context manager runs the lifespan (startup and shutdown).
    with TestClient(app) as test_client:
        yield test_client
