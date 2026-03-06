#!/usr/bin/env sh
set -eu

docker swarm init || true

docker network create --driver overlay --attachable proxy_network || true
docker network create --driver overlay --attachable backend_network || true
docker network create --driver overlay --attachable services_network || true
docker network create --driver overlay --attachable database_network || true

echo "Swarm initialized and overlay networks ensured."
