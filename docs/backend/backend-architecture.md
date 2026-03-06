# Backend Architecture

## Stack
- FastAPI
- SQLAlchemy ORM
- Pydantic v2
- JWT auth

## Layering
- `api/`: route handlers
- `schemas/`: request/response contracts
- `models/`: SQLAlchemy entities
- `repositories/`: DB query layer
- `services/`: business logic, indexing hooks, seed
- `integrations/`: external connectors (OneID, HR, Passport)
- `core/`: config, security, DB session

## Startup
`app.main`:
1. Creates tables (`Base.metadata.create_all`).
2. Registers routers.
3. Runs `bootstrap_defaults()` for seed data.

## Security
- OAuth2 bearer token.
- JWT subject = user id.
- RBAC with `require_roles(...)` dependency.
