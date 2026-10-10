import httpx
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.db import session as db_session

HEALTH_URL = "/api/v1/health"


def test_health_returns_ok(client: TestClient) -> None:
    response = client.get(HEALTH_URL)

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "campusconnect-api"}


def test_app_starts_and_serves_health_without_database(client: TestClient) -> None:
    client.get(HEALTH_URL)

    # No engine was created during startup or the health request.
    assert db_session.get_engine.cache_info().currsize == 0


async def test_health_over_async_client(app: FastAPI) -> None:
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as http:
        response = await http.get(HEALTH_URL)

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "campusconnect-api"}


def test_cors_preflight_allows_vite_dev_origin(client: TestClient) -> None:
    response = client.options(
        HEALTH_URL,
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
    assert response.headers["access-control-allow-credentials"] == "true"


def test_cors_rejects_unknown_origin(client: TestClient) -> None:
    response = client.options(
        HEALTH_URL,
        headers={
            "Origin": "https://evil.example",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert "access-control-allow-origin" not in response.headers


def test_openapi_is_served_under_api_prefix(client: TestClient) -> None:
    response = client.get("/api/v1/openapi.json")

    assert response.status_code == 200
    assert "/api/v1/health" in response.json()["paths"]
