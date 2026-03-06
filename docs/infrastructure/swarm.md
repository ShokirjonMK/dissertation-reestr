# Docker Swarm

## Files
- `infra/docker/swarm/init-swarm.sh`
- `infra/docker/stacks/core-stack.yml`
- `infra/scripts/deploy-swarm.sh`

## Deploy
```bash
sh infra/docker/swarm/init-swarm.sh
docker stack deploy -c infra/docker/stacks/core-stack.yml registry
```

## Swarm Characteristics
- Overlay networks are created as external.
- Stateless services can be replicated.
- Stateful components use swarm volumes.

## Recommended Production Hardening
- Move secrets to Docker secrets/vault.
- Add service-level healthchecks and restart windows.
- Add centralized logging + monitoring stack.
