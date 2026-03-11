# Docker Compose Qo'llanmasi

## Asosiy fayl

`docker-compose.yml` (root) — barcha 8 servisni boshqaradi.

---

## Ishga tushirish

```bash
# 1. Muhit o'zgaruvchilarini sozlash
cp .env.example .env
# .env faylini tahrirlang

# 2. Servislarni build va ishga tushirish
docker compose up -d --build

# 3. Holat tekshirish
docker compose ps

# 4. Loglar ko'rish
docker compose logs -f
```

---

## Servislar va portlar

| Servis | Port | URL |
|--------|------|-----|
| frontend | 3000 | http://localhost:3000 |
| backend | 8000 | http://localhost:8000/docs |
| search-service | 8001 | http://localhost:8001/docs |
| ai-service | 8002 | http://localhost:8002/docs |
| integration-service | 8003 | http://localhost:8003/docs |
| postgres | 5432 | postgresql://localhost:5432 |
| elasticsearch | 9200 | http://localhost:9200 |
| redis | 6379 | redis://localhost:6379 |

---

## Yuklanish tartibi (depends_on)

```
postgres (healthy)
  ↓
redis (healthy)
  ↓
elasticsearch (started)
  ↓
search-service (healthy) ←── integration-service (healthy)
  ↓
backend (healthy)
  ↓
frontend
```

---

## Asosiy buyruqlar

```bash
# Ishga tushirish
docker compose up -d

# To'xtatish
docker compose stop

# O'chirish (volumelarsiz)
docker compose down

# O'chirish (volumelar bilan) — EHTIYOT BO'LING!
docker compose down -v

# Qayta build qilish
docker compose build --no-cache

# Bitta servisi qayta ishga tushirish
docker compose restart backend

# Loglar
docker compose logs -f backend
docker compose logs -f --tail=100 frontend

# Konteynerga kirish
docker compose exec backend bash
docker compose exec postgres psql -U registry_user dissertation_registry
```

---

## Muhit o'zgaruvchilari

`.env` faylida barcha konfiguratsiya saqlanadi. Asosiy o'zgaruvchilar:

```bash
# Ilovalar
PROJECT_NAME=dissertation-registry

# Portlar
BACKEND_PORT=8000
FRONTEND_PORT=3000
SEARCH_SERVICE_PORT=8001
AI_SERVICE_PORT=8002
INTEGRATION_SERVICE_PORT=8003

# PostgreSQL
POSTGRES_DB=dissertation_registry
POSTGRES_USER=registry_user
POSTGRES_PASSWORD=your_secure_password  # O'zgartiring!

# Elasticsearch
ELASTIC_PASSWORD=your_elastic_password  # O'zgartiring!

# JWT
JWT_SECRET=your_very_secure_secret      # O'zgartiring!
JWT_EXPIRE_MINUTES=120

# Ulanish
DB_URL=postgresql+psycopg2://registry_user:password@postgres:5432/dissertation_registry
REDIS_URL=redis://redis:6379/0
ELASTIC_URL=http://elastic:password@elasticsearch:9200
```

---

## Elasticsearch memory talabi

Ubuntu serverda:
```bash
sudo sysctl -w vm.max_map_count=262144
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
```

Docker Desktop (Windows/Mac) da bu talab yo'q.

---

## Birinchi ishga tushirishdan keyin

1. http://localhost:3000 oching
2. `admin` / `admin12345` bilan kiring
3. http://localhost:8000/docs — Swagger UI
4. Standart parollarni o'zgartiring (ishlab chiqarish uchun)
