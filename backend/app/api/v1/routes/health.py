from fastapi import APIRouter

from app.schemas.health import HealthResponse

SERVICE_NAME = "campusconnect-api"

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    """Liveness check. Deliberately does not touch the database."""
    return HealthResponse(status="ok", service=SERVICE_NAME)
