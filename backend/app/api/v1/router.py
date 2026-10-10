"""Aggregates every v1 route module. Add new domain routers here as they are built."""

from fastapi import APIRouter

from app.api.v1.routes import health

api_router = APIRouter()
api_router.include_router(health.router)
