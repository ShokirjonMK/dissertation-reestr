# Dissertation Registry System

Monorepo generated from infrastructure and TZ specifications.

## Quick Start

1. Copy `.env.example` to `.env` and adjust values.
2. Run:

```bash
docker compose up -d --build
```

## Services

- Frontend: `http://localhost:3000`
- Backend API docs: `http://localhost:8000/docs`
- Search service: `http://localhost:8001/docs`
- AI service: `http://localhost:8002/docs`
- Integration service: `http://localhost:8003/docs`

## Default admin seed

- Username: `admin`
- Password: `admin12345`

Change this in production.
