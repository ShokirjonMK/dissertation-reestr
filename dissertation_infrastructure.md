# Dissertation Registry System -- Infrastructure Specification

This document describes the infrastructure architecture and folder
structure for the Dissertation Registry System. It is intended to be
used as a reference for AI coding agents (Codex) and developers.

The infrastructure must support:

- Docker
- Docker Swarm
- Reverse proxy routing
- Service separation
- Scalability

------------------------------------------------------------------------

# Root Project Structure

    dissertation-registry/
    │
    ├── infra/
    │   ├── docker/
    │   │   ├── swarm/
    │   │   ├── compose/
    │   │   └── stacks/
    │   │
    │   ├── nginx/
    │   │   └── nginx-proxy-manager/
    │   │
    │   ├── portainer/
    │   │
    │   └── scripts/
    │
    ├── front/
    │
    ├── back/
    │
    ├── services/
    │   ├── ai-service/
    │   ├── search-service/
    │   ├── integration-service/
    │
    ├── databases/
    │   ├── postgres/
    │   ├── elasticsearch/
    │   └── redis/
    │
    ├── volumes/
    │
    ├── docs/
    │
    └── docker-compose.yml

------------------------------------------------------------------------

# Reverse Proxy

Technology: NGINX Proxy Manager

    infra/nginx/nginx-proxy-manager/
    │
    ├── docker-compose.yml
    ├── data/
    └── letsencrypt/

------------------------------------------------------------------------

# Container Management

Technology: Portainer

    infra/portainer/
    │
    ├── docker-compose.yml
    └── data/

------------------------------------------------------------------------

# Frontend

Technology: Next.js

    front/
    │
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── layouts/
    │   ├── services/
    │   └── store/
    │
    ├── public/
    ├── Dockerfile
    └── next.config.js

------------------------------------------------------------------------

# Backend

Technology: FastAPI

    back/
    │
    ├── app/
    │   ├── api/
    │   ├── models/
    │   ├── schemas/
    │   ├── services/
    │   ├── repositories/
    │   ├── integrations/
    │   └── core/
    │
    ├── migrations/
    ├── tests/
    ├── Dockerfile
    └── requirements.txt

------------------------------------------------------------------------

# Services

    services/
    │
    ├── ai-service/
    │
    ├── search-service/
    │
    └── integration-service/

------------------------------------------------------------------------

# Databases

    databases/
    │
    ├── postgres/
    │
    ├── elasticsearch/
    │
    └── redis/

------------------------------------------------------------------------

# Volumes

    volumes/
    │
    ├── postgres-data/
    ├── elastic-data/
    ├── redis-data/
    ├── portainer-data/
    └── nginx-data/

------------------------------------------------------------------------

# Docker Swarm

Example deployment:

    docker swarm init
    docker stack deploy -c infra/docker/stacks/core-stack.yml registry

------------------------------------------------------------------------

# Networks

    proxy_network
    backend_network
    services_network
    database_network

------------------------------------------------------------------------

# Environment Variables

    DB_URL
    REDIS_URL
    ELASTIC_URL
    AI_SERVICE_URL
    JWT_SECRET

------------------------------------------------------------------------

# Usage for Codex

Codex must:

1. Follow the exact folder structure.
2. Generate Dockerfiles for each service.
3. Create docker-compose and swarm stacks.
4. Configure networks and volumes.
