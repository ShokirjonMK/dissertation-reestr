# Dissertation Registry System

Monorepo generated from:
- `dissertation_infrastructure.md`
- `dissertation_registry_TZ.md`
- `dissertation_ui_spec.md`

## Quick Start

1. Copy `.env.example` to `.env` and adjust values.
2. Run:

```bash
docker compose up -d --build
```

If Docker daemon is not running, start Docker Desktop first.

## Services

- Frontend: `http://localhost:3000`
- Backend API docs: `http://localhost:8000/docs`
- Search service: `http://localhost:8001/docs`
- AI service: `http://localhost:8002/docs`
- Integration service: `http://localhost:8003/docs`

## Seed Accounts

- `admin` / `admin12345`
- `moderator` / `moderator123`
- `doctorant` / `doctorant123`
- `supervisor` / `supervisor123`
- `employee` / `employee123`

Change credentials in production.

## Documentation

Full module documentation is available under [`docs/`](docs/README.md).
