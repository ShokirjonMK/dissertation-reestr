#!/usr/bin/env sh
set -eu

if [ ! -f .env ]; then
  echo "Missing .env file. Copy .env.example to .env first."
  exit 1
fi

sh infra/docker/swarm/init-swarm.sh
docker stack deploy -c infra/docker/stacks/core-stack.yml registry

echo "Stack 'registry' deployed."
