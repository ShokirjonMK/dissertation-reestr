# Operatsiyalar Qo'llanmasi

## Lokal ishga tushirish

```bash
# 1. Repozitoriyni klonlash
git clone <repo-url> dissertation-registry
cd dissertation-registry

# 2. Muhit o'zgaruvchilarini sozlash
cp .env.example .env
# .env faylini tahrirlang (parollar, JWT_SECRET)

# 3. Ishga tushirish
docker compose up -d --build

# 4. Holat tekshirish
docker compose ps
```

**Servislar manzillari:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs
- Search: http://localhost:8001/docs
- AI: http://localhost:8002/docs
- Integration: http://localhost:8003/docs

---

## Yuklanish vaqti

To'liq yuklanish ~2–3 daqiqa. Ketma-ketlik:
```
postgres (10s) → redis (5s) → elasticsearch (20–30s) →
search-service (5s) → integration-service (5s) →
backend (15–20s) → frontend (20s)
```

---

## Standart hisoblar

| Username | Parol | Rol |
|----------|-------|-----|
| admin | admin12345 | Admin |
| moderator | moderator123 | Moderator |
| doctorant | doctorant123 | Doctorant |
| supervisor | supervisor123 | Supervisor |
| employee | employee123 | Employee |

---

## Servislarni boshqarish

```bash
# To'xtatish
docker compose stop

# Qayta ishga tushirish
docker compose restart

# Bitta servisni qayta ishga tushirish
docker compose restart backend

# Loglar
docker compose logs -f backend

# Konteynerga kirish
docker compose exec backend bash
docker compose exec postgres psql -U registry_user dissertation_registry
```

---

## Ma'lumotlar bazasi

```bash
# Barcha jadvallarni ko'rish
docker compose exec postgres psql -U registry_user dissertation_registry -c "\dt"

# Foydalanuvchilar
docker compose exec postgres psql -U registry_user dissertation_registry -c "SELECT username, email FROM users;"

# Dissertatsiyalar soni
docker compose exec postgres psql -U registry_user dissertation_registry -c "SELECT status, COUNT(*) FROM dissertations GROUP BY status;"

# Backup
docker compose exec postgres pg_dump -U registry_user dissertation_registry > backup_$(date +%Y%m%d).sql

# Restore
docker compose exec -T postgres psql -U registry_user dissertation_registry < backup.sql
```

---

## Elasticsearch

```bash
# Indeks ko'rish
curl -u elastic:elasticpassword http://localhost:9200/_cat/indices

# Dissertatsiyalar indeksi
curl -u elastic:elasticpassword http://localhost:9200/dissertations/_count

# Manual qidiruv
curl -u elastic:elasticpassword -X POST http://localhost:9200/dissertations/_search \
  -H "Content-Type: application/json" \
  -d '{"query": {"match_all": {}}}'
```

---

## Reindekslash

Backend ishga tushganda avtomatik. Manual:
```bash
docker compose restart backend
```

---

## Docker Swarm (production)

```bash
# Swarm boshlash
docker swarm init

# Stack deploy
docker stack deploy -c infra/docker/stacks/core-stack.yml registry

# Holat
docker stack ps registry

# Service logi
docker service logs -f registry_backend

# Yangilash (rolling update)
docker service update --image dissertation-backend:latest registry_backend
```

Yoki skript bilan:
```bash
bash infra/scripts/deploy-swarm.sh
```

---

## Tizim holat tekshiruvi

```bash
# Barcha servislar sog'lom
curl http://localhost:8000/api/v1/health
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8003/health

# Login tekshirish
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin12345"}'
```

---

## Portlar band bo'lsa

`.env` faylida portlarni o'zgartiring:
```
FRONTEND_PORT=3001
BACKEND_PORT=8010
```

Keyin:
```bash
docker compose up -d
```
