# Troubleshooting

## Backend fails on startup
- Check `DB_URL` and postgres container health.
- Ensure `POSTGRES_USER/PASSWORD/DB` values match `.env`.

## Search empty results
- Verify search-service and elasticsearch are running.
- Ensure dissertation creation triggers index sync.

## Frontend API errors
- Check token in local storage.
- Verify backend reachable at `http://localhost:8000/api/v1`.

## Docker issues
- Run `docker compose logs -f <service>`.
- Clear stale volumes only if needed (dev-only).

## Known staged integrations
- OneID and HR/passport are contract stubs; production adapters required.
