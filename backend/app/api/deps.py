"""Shared FastAPI dependencies for route handlers."""

from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_db

# Use as a parameter type: `def handler(db: DbSession) -> ...`.
# Override in tests with `app.dependency_overrides[get_db] = ...`.
DbSession = Annotated[Session, Depends(get_db)]
