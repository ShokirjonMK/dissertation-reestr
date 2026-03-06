# PostgreSQL

## Role
Primary transactional database.

## Init
`databases/postgres/init.sql` enables:
- `pg_trgm`
- `unaccent`

## Main Tables
- users/roles/profiles
- catalogs (directions, universities, regions, districts)
- dissertations

## Connection
Configured via `DB_URL` (`postgresql+psycopg2://...`).
