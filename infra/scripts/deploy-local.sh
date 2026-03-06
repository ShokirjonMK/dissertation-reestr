#!/usr/bin/env sh
set -eu

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example. Update secrets before production use."
fi

docker compose up -d --build

echo "Local stack is running."
