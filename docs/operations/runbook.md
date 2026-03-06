# Runbook

## Local Boot
```bash
cp .env.example .env
docker compose up -d --build
```

## Service Checks
- Front: `http://localhost:3000`
- Back: `http://localhost:8000/docs`
- Search: `http://localhost:8001/docs`
- AI: `http://localhost:8002/docs`
- Integration: `http://localhost:8003/docs`

If `3000` is busy, set `FRONTEND_PORT` (example: `3001`) in `.env`.

## Default Accounts
- admin / admin12345
- moderator / moderator123
- doctorant / doctorant123
- supervisor / supervisor123
- employee / employee123

## Swarm Boot
```bash
sh infra/scripts/deploy-swarm.sh
```
