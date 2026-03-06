# Networks and Volumes

## Networks
- `proxy_network`: front + reverse proxy ingress.
- `backend_network`: front-back internal transport.
- `services_network`: back and internal microservices.
- `database_network`: DB/cache/search data plane.

## Volumes
- `volumes/postgres-data/`
- `volumes/elastic-data/`
- `volumes/redis-data/`
- `volumes/portainer-data/`
- `volumes/nginx-data/`

## Persistence Policy
- Local development uses bind mounts.
- Production should use managed persistent volumes.
- Sensitive data directories are git-ignored.
