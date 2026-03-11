# Docker Swarm

## Fayllar

- `infra/docker/swarm/init-swarm.sh` — Swarm boshlash
- `infra/docker/stacks/core-stack.yml` — Stack manifest
- `infra/scripts/deploy-swarm.sh` — Deploy skript

---

## Ishga tushirish

```bash
# 1. Swarm boshlash (bir martalik)
docker swarm init

# 2. Stack deploy
docker stack deploy -c infra/docker/stacks/core-stack.yml registry

# 3. Holat tekshirish
docker stack ps registry
docker stack services registry
```

Yoki tayyor skript:
```bash
bash infra/scripts/deploy-swarm.sh
```

---

## Stack xususiyatlari

- **Overlay tarmoqlar** tashqi sifatida yaratiladi
- **Stateless servislar** (backend, frontend, search, ai, integration) ko'paytirish mumkin
- **Stateful komponentlar** (postgres, elasticsearch, redis) alohida volume bilan

---

## Replica sozlash

```yaml
# core-stack.yml
services:
  backend:
    deploy:
      replicas: 2
      restart_policy:
        condition: on-failure
      update_config:
        parallelism: 1
        delay: 10s
```

---

## Service yangilash

```bash
# Rolling update
docker service update --image dissertation-backend:v2 registry_backend

# Rollback
docker service rollback registry_backend
```

---

## Loglar

```bash
# Service logi
docker service logs -f registry_backend
docker service logs -f registry_frontend

# Stack holati
docker stack ps registry --no-trunc
```

---

## Ishlab chiqarish uchun tavsiyalar

1. **Sirlar uchun Docker Secrets ishlatish:**
   ```bash
   echo "secure_password" | docker secret create postgres_password -
   ```

2. **Markazlashgan log yig'ish:**
   - ELK Stack
   - Loki + Grafana

3. **Monitoring:**
   - Prometheus + Grafana
   - Node Exporter

4. **Registry uchun CI/CD:**
   - Image build → GitHub Actions
   - Push → Docker Registry
   - Deploy → `docker service update`
