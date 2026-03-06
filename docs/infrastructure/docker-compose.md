# Docker Compose Guide

## Main File
`docker-compose.yml` orchestrates:
- `frontend` (Next.js)
- `backend` (FastAPI)
- `search-service`
- `ai-service`
- `integration-service`
- `postgres`
- `elasticsearch`
- `redis`

## Startup
```bash
cp .env.example .env
docker compose up -d --build
```

## Ports
- Frontend: `3000`
- Backend: `8000`
- Search: `8001`
- AI: `8002`
- Integration: `8003`
- Postgres: `5432`
- ElasticSearch: `9200`
- Redis: `6379`

## Notes
- Backend startup includes seed bootstrap.
- ElasticSearch security is enabled (`elastic` + password).
- Redis uses local config (`databases/redis/redis.conf`).
