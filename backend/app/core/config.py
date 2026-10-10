"""Typed application settings, read from environment variables and the repository's root .env."""

import secrets
from functools import lru_cache
from pathlib import Path
from typing import Annotated, Literal, Self
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from pydantic import Field, SecretStr, field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

# backend/app/core/config.py -> parents[3] is the repository root. Resolving from this
# file (not the working directory) means `uvicorn` finds the same .env whether it is
# started from the repository root or from backend/.
REPO_ROOT = Path(__file__).resolve().parents[3]
ENV_FILE = REPO_ROOT / ".env"

# Placeholder values that must never be used outside local development.
_WEAK_KEYS = frozenset({"change-me", "changeme", "secret", "dev"})
_MIN_KEY_LENGTH = 32

Environment = Literal["development", "test", "staging", "production"]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        case_sensitive=False,
        # The root .env is shared with other tools; ignore keys this app doesn't use.
        extra="ignore",
    )

    app_name: str = "CampusConnect API"
    environment: Environment = "development"
    api_v1_prefix: str = "/api/v1"
    app_timezone: str = "Asia/Kolkata"

    # SecretStr keeps the password in the URL and the signing key out of repr() and logs.
    # The default has no password; set DATABASE_URL in .env for real credentials.
    database_url: SecretStr = SecretStr(
        "postgresql+psycopg://campusconnect@localhost:5432/campusconnect"
    )

    # Without SECRET_KEY, development gets a random per-process key. Staging and
    # production refuse to start without an explicit strong key (see validator below).
    secret_key: SecretStr = Field(default_factory=lambda: SecretStr(secrets.token_urlsafe(32)))

    # Comma-separated in the environment, e.g.
    # CORS_ORIGINS=http://localhost:5173,https://campusconnect.example.edu
    cors_origins: Annotated[list[str], NoDecode] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        if isinstance(value, str):
            value = value.split(",")
        if isinstance(value, list):
            # Browsers send origins without a trailing slash; normalise so they match.
            return [str(origin).strip().rstrip("/") for origin in value if str(origin).strip()]
        return value

    @field_validator("app_timezone")
    @classmethod
    def _validate_timezone(cls, value: str) -> str:
        try:
            ZoneInfo(value)
        except (ZoneInfoNotFoundError, ValueError) as exc:
            raise ValueError(f"Unknown IANA time zone: {value!r}") from exc
        return value

    @field_validator("api_v1_prefix")
    @classmethod
    def _validate_prefix(cls, value: str) -> str:
        if not value.startswith("/") or value.endswith("/"):
            raise ValueError("API prefix must start with '/' and not end with '/', e.g. /api/v1")
        return value

    @field_validator("database_url")
    @classmethod
    def _validate_database_url(cls, value: SecretStr) -> SecretStr:
        url = value.get_secret_value()
        # A driverless postgres URL makes SQLAlchemy look for psycopg2, which we don't use.
        if url.startswith(("postgres://", "postgresql://")):
            raise ValueError("DATABASE_URL must use the psycopg 3 driver: postgresql+psycopg://...")
        return value

    @model_validator(mode="after")
    def _check_deployed_environment(self) -> Self:
        if self.environment not in ("staging", "production"):
            return self
        key = self.secret_key.get_secret_value()
        if (
            "secret_key" not in self.model_fields_set
            or key.lower() in _WEAK_KEYS
            or len(key) < _MIN_KEY_LENGTH
        ):
            raise ValueError(
                f"SECRET_KEY must be set to a random value of at least {_MIN_KEY_LENGTH} "
                f"characters when ENVIRONMENT={self.environment}"
            )
        if "*" in self.cors_origins:
            raise ValueError("Wildcard CORS origins are not allowed outside development")
        return self

    @property
    def is_development(self) -> bool:
        return self.environment == "development"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Process-wide settings, loaded once. Tests can call `get_settings.cache_clear()`."""
    return Settings()
