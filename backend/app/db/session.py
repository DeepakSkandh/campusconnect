"""Database engine and session management.

Nothing here connects to PostgreSQL at import time: the engine is built on first
use, and SQLAlchemy itself only opens a connection when a query runs.
"""

from collections.abc import Iterator
from functools import lru_cache

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings


def build_engine(database_url: str) -> Engine:
    """Create an engine without connecting. Separate from the cached getter so tests can use it."""
    # pool_pre_ping checks a pooled connection before handing it out, so a
    # restarted database or a dropped idle connection doesn't fail the request.
    return create_engine(database_url, pool_pre_ping=True)


@lru_cache(maxsize=1)
def get_engine() -> Engine:
    return build_engine(get_settings().database_url.get_secret_value())


@lru_cache(maxsize=1)
def get_session_factory() -> sessionmaker[Session]:
    # expire_on_commit=False keeps loaded attributes usable after commit, e.g. when
    # a service commits and the route then serialises the object.
    return sessionmaker(bind=get_engine(), autoflush=False, expire_on_commit=False)


def get_db() -> Iterator[Session]:
    """FastAPI dependency: one session per request, always closed afterwards.

    The session does not commit on its own; services own their transactions.
    Closing a session with an open transaction rolls it back.
    """
    with get_session_factory()() as session:
        yield session


def dispose_engine() -> None:
    """Close pooled connections on shutdown, without creating an engine that was never used."""
    if get_engine.cache_info().currsize:
        get_engine().dispose()
    get_session_factory.cache_clear()
    get_engine.cache_clear()
