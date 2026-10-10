"""SQLAlchemy declarative base shared by every ORM model."""

from datetime import datetime

from sqlalchemy import DateTime, MetaData
from sqlalchemy.orm import DeclarativeBase

# Deterministic constraint names, so Alembic autogenerate produces stable,
# readable migrations and constraints can be dropped/renamed by name later.
NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=NAMING_CONVENTION)

    # Every `Mapped[datetime]` column becomes TIMESTAMP WITH TIME ZONE by default,
    # so naive timestamps can't slip into booking data.
    type_annotation_map = {datetime: DateTime(timezone=True)}  # noqa: RUF012
