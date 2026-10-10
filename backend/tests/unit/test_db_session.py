from types import TracebackType
from typing import Self

import pytest

from app.db import session as db_session
from app.db.base import Base


class FakeSession:
    """Stands in for a SQLAlchemy Session; records whether it was closed."""

    def __init__(self) -> None:
        self.closed = False

    def close(self) -> None:
        self.closed = True

    def __enter__(self) -> Self:
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        self.close()


@pytest.fixture
def fake_session(monkeypatch: pytest.MonkeyPatch) -> FakeSession:
    fake = FakeSession()
    monkeypatch.setattr(db_session, "get_session_factory", lambda: lambda: fake)
    return fake


def test_build_engine_uses_psycopg_and_pre_ping_without_connecting() -> None:
    # Port 1 on localhost: if this tried to connect, it would fail loudly.
    engine = db_session.build_engine("postgresql+psycopg://user:pw@127.0.0.1:1/nope")
    try:
        assert engine.url.drivername == "postgresql+psycopg"
        assert engine.pool._pre_ping is True  # no public accessor for this flag
    finally:
        engine.dispose()


def test_get_db_yields_session_and_closes_it(fake_session: FakeSession) -> None:
    dependency = db_session.get_db()

    assert next(dependency) is fake_session
    assert fake_session.closed is False

    with pytest.raises(StopIteration):
        next(dependency)
    assert fake_session.closed is True


def test_get_db_closes_session_when_request_fails(fake_session: FakeSession) -> None:
    dependency = db_session.get_db()
    next(dependency)

    with pytest.raises(RuntimeError):
        dependency.throw(RuntimeError("handler failed"))
    assert fake_session.closed is True


def test_dispose_engine_is_safe_when_engine_was_never_created() -> None:
    db_session.dispose_engine()
    assert db_session.get_engine.cache_info().currsize == 0


def test_base_uses_naming_convention() -> None:
    assert Base.metadata.naming_convention["pk"] == "pk_%(table_name)s"
