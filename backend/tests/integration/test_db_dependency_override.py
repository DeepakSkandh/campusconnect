"""Shows how tests replace the PostgreSQL session with something local.

A throwaway route uses the real `DbSession` dependency; the test overrides
`get_db` with an in-memory SQLite session, so no PostgreSQL server is needed.
(Booking and concurrency tests will use a real PostgreSQL test database later.)
"""

from collections.abc import Iterator

from fastapi import APIRouter, FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.deps import DbSession
from app.db import session as db_session
from app.db.session import get_db


def test_db_session_dependency_can_be_overridden(app: FastAPI) -> None:
    probe = APIRouter()

    @probe.get("/_probe/db")
    def read_from_db(db: DbSession) -> dict[str, int]:
        return {"value": db.execute(text("SELECT 1")).scalar_one()}

    app.include_router(probe)

    sqlite_engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    sqlite_sessions = sessionmaker(bind=sqlite_engine)

    def override_get_db() -> Iterator[Session]:
        with sqlite_sessions() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    try:
        with TestClient(app) as client:
            response = client.get("/_probe/db")
    finally:
        app.dependency_overrides.clear()
        sqlite_engine.dispose()

    assert response.status_code == 200
    assert response.json() == {"value": 1}
    # The PostgreSQL engine was never built.
    assert db_session.get_engine.cache_info().currsize == 0
