# CampusConnect: backend

FastAPI modular monolith. Phase 1 contains the foundation only: settings, app factory, database session plumbing, the health endpoint and tests. No domain models, migrations or auth yet.

## Setup

```bash
conda activate campusconnect
cd backend
python -m pip install -e ".[dev]"
cp ../.env.example ../.env   # once; the app reads the repo-root .env
```

## Run

```bash
uvicorn app.main:app --reload --port 8000   # from backend/
# or from the repo root:
uvicorn app.main:app --app-dir backend --reload --port 8000
```

- Health: <http://localhost:8000/api/v1/health>
- API docs: <http://localhost:8000/api/v1/docs>
- OpenAPI schema: <http://localhost:8000/api/v1/openapi.json>

## Check

```bash
ruff check .
ruff format --check .
pytest
```

Tests don't need PostgreSQL: they never read your `.env`, and database access is overridden where needed.

## Configuration

Settings are read from environment variables, then the repo-root `.env` (`app/core/config.py`).

| Variable | Default | Notes |
| --- | --- | --- |
| `ENVIRONMENT` | `development` | `development`, `test`, `staging`, `production` |
| `DATABASE_URL` | local `campusconnect` DB, no password | Must use `postgresql+psycopg://` |
| `SECRET_KEY` | random per process in development | Required, 32+ chars, in staging/production |
| `APP_TIMEZONE` | `Asia/Kolkata` | IANA name; storage is always UTC |
| `CORS_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated |
| `API_V1_PREFIX` | `/api/v1` | |
| `APP_NAME` | `CampusConnect API` | |

## Layout

```
app/
├── main.py            create_app() factory + ASGI app
├── api/
│   ├── deps.py        Shared dependencies (DbSession)
│   └── v1/
│       ├── router.py  Includes every v1 route module
│       └── routes/    One module per domain (health so far)
├── core/config.py     Typed settings
├── db/
│   ├── base.py        Declarative Base (naming convention, timestamptz default)
│   └── session.py     Lazy engine, session factory, get_db dependency
├── schemas/           Pydantic request/response models
├── models/            SQLAlchemy models (Phase 2)
├── repositories/      Queries and persistence (Phase 2)
└── services/          Business rules and transactions (Phase 2)
```
