# Integration Service

## Purpose
External system adapters (staged mode).

## Endpoints
- `POST /passport/verify`
- `POST /hr/check`
- `GET /health`

## Current Logic
- Passport: regex format checks (`seria`, `number`, `pin`).
- HR: allowed domain checks (`@adliya.uz`, `@minjust.uz`).

## Production TODO
- Replace stub logic with real API clients.
- Add auth signatures and retry policy.
- Add audit logging for integration calls.
