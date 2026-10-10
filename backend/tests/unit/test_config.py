from pathlib import Path

import pytest
from pydantic import ValidationError

from app.core import config
from app.core.config import ENV_FILE, Settings, get_settings

STRONG_KEY = "k" * 48


def test_settings_load_with_development_defaults() -> None:
    settings = Settings(_env_file=None)

    assert settings.app_name == "CampusConnect API"
    assert settings.environment == "development"
    assert settings.api_v1_prefix == "/api/v1"
    assert settings.app_timezone == "Asia/Kolkata"
    assert "http://localhost:5173" in settings.cors_origins
    assert settings.database_url.get_secret_value().startswith("postgresql+psycopg://")
    assert len(settings.secret_key.get_secret_value()) >= 32


def test_environment_variables_override_defaults(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("ENVIRONMENT", "test")
    monkeypatch.setenv("APP_TIMEZONE", "UTC")
    monkeypatch.setenv("CORS_ORIGINS", "http://a.test, http://b.test/")

    settings = Settings(_env_file=None)

    assert settings.environment == "test"
    assert settings.app_timezone == "UTC"
    assert settings.cors_origins == ["http://a.test", "http://b.test"]


def test_env_file_values_are_loaded(tmp_path: Path) -> None:
    env_file = tmp_path / ".env"
    env_file.write_text("APP_NAME=From Env File\nUNRELATED_KEY=ignored\n", encoding="utf-8")

    settings = Settings(_env_file=env_file)

    assert settings.app_name == "From Env File"


def test_env_file_path_is_repo_root_regardless_of_cwd(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.chdir(tmp_path)

    assert ENV_FILE.is_absolute()
    expected = Path(config.__file__).resolve().parents[3] / ".env"
    assert expected == ENV_FILE
    assert (ENV_FILE.parent / "backend" / "app").is_dir()
    assert Settings.model_config["env_file"] == ENV_FILE


def test_secrets_are_hidden_from_repr() -> None:
    settings = Settings(
        _env_file=None,
        secret_key=STRONG_KEY,
        database_url="postgresql+psycopg://user:hunter2-db-pw@localhost/db",
    )

    assert STRONG_KEY not in repr(settings)
    assert "hunter2-db-pw" not in repr(settings)
    assert "hunter2-db-pw" not in str(settings.model_dump())


@pytest.mark.parametrize("environment", ["staging", "production"])
def test_deployed_environments_require_explicit_strong_secret(environment: str) -> None:
    with pytest.raises(ValidationError, match="SECRET_KEY"):
        Settings(_env_file=None, environment=environment)
    with pytest.raises(ValidationError, match="SECRET_KEY"):
        Settings(_env_file=None, environment=environment, secret_key="change-me")

    settings = Settings(_env_file=None, environment=environment, secret_key=STRONG_KEY)
    assert settings.environment == environment


def test_production_rejects_wildcard_cors() -> None:
    with pytest.raises(ValidationError, match="Wildcard"):
        Settings(_env_file=None, environment="production", secret_key=STRONG_KEY, cors_origins="*")


def test_driverless_postgres_url_is_rejected() -> None:
    with pytest.raises(ValidationError, match="psycopg"):
        Settings(_env_file=None, database_url="postgresql://user@localhost/db")


def test_unknown_timezone_is_rejected() -> None:
    with pytest.raises(ValidationError, match="time zone"):
        Settings(_env_file=None, app_timezone="Mars/Olympus_Mons")


def test_get_settings_is_cached() -> None:
    get_settings.cache_clear()
    try:
        assert get_settings() is get_settings()
    finally:
        get_settings.cache_clear()
