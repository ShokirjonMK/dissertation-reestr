# Infrastructure

## Directory Layout
- `infra/docker/swarm/`: swarm init scripts.
- `infra/docker/compose/`: local compose wrappers.
- `infra/docker/stacks/`: swarm stack manifests.
- `infra/nginx/nginx-proxy-manager/`: reverse proxy management.
- `infra/portainer/`: container management UI.
- `infra/scripts/`: deploy scripts.

## Core Principles
- Service separation (front/back/search/ai/integration).
- Independent scaling via container replicas.
- Network isolation (`proxy`, `backend`, `services`, `database`).
- Persistent storage via mounted volumes.

## Delivered Artifacts
- Root compose (`docker-compose.yml`).
- Swarm stack (`infra/docker/stacks/core-stack.yml`).
- NPM and Portainer compose files.
- Init/deploy scripts for local and swarm flows.
