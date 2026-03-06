# Auth and Roles

## Roles
- `admin`
- `moderator`
- `doctorant`
- `supervisor`
- `employee`

## Access Principles
- Admin: full configuration and CRUD access.
- Moderator: moderation and review operations.
- Doctorant: own dissertation create/update.
- Supervisor: review/read oriented access.
- Employee: search/view/analysis.

## Authentication Modes
1. Login/password (`/auth/login`) for initial phase.
2. OneID staged callback contract (`/auth/oneid/callback`).

## Integration Checks
- HR check for adliya staff entitlement.
- Passport verification for profile identity fields.

## Token
- JWT secret and TTL configurable via `.env`.
- Token parsed with OAuth2 bearer flow.
