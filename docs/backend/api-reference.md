# API Reference

Base path: `/api/v1`

## Health
- `GET /health`

## Auth
- `POST /auth/login`
- `POST /auth/oneid/callback`
- `GET /auth/me`

## Users
- `POST /users/` (admin)
- `GET /users/me`
- `GET /users/me/profile`
- `PUT /users/me/profile`

## Catalogs
- `GET|POST /catalogs/scientific-directions`
- `PUT|DELETE /catalogs/scientific-directions/{id}`
- `GET|POST /catalogs/universities`
- `PUT|DELETE /catalogs/universities/{id}`
- `GET|POST /catalogs/regions`
- `PUT|DELETE /catalogs/regions/{id}`
- `GET|POST /catalogs/districts`
- `PUT|DELETE /catalogs/districts/{id}`

## Dissertations
- `POST /dissertations/`
- `GET /dissertations/`
- `GET /dissertations/{id}`
- `PUT /dissertations/{id}`
- `PATCH /dissertations/{id}/moderate`
- `DELETE /dissertations/{id}`

### Supported Dissertation Filters
- base: `scientific_direction_id`, `university_id`, `author_id`, `supervisor_id`, `year`, `status`, `query`
- search fields: `title`, `problem`, `proposal`, `annotation`, `conclusion`, `keywords`, `author`, `supervisor`
- advanced: `category`, `expert_rating_min`, `region_id`, `visibility`

## Search + AI
- `POST /search`
- `POST /ai/ask`
