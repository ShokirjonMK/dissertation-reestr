# Infratuzilma

## Umumiy ko'rinish

Tizim Docker asosida konteynerlashtirilib, Docker Compose (lokal) yoki Docker Swarm (ishlab chiqarish) orqali ishga tushiriladi.

---

## Papka tuzilishi

```
dissertation-registry/
├── docker-compose.yml          # Asosiy lokal compose
├── .env                        # Muhit o'zgaruvchilari
├── .env.example                # Namuna
│
├── infra/
│   ├── docker/
│   │   ├── swarm/
│   │   │   └── init-swarm.sh   # Docker Swarm ishga tushirish
│   │   ├── compose/
│   │   │   └── local.yml       # Lokal compose (qo'shimcha)
│   │   └── stacks/
│   │       └── core-stack.yml  # Swarm stack manifest
│   │
│   ├── nginx/
│   │   └── nginx-proxy-manager/
│   │       ├── docker-compose.yml
│   │       ├── data/           # NPM konfiguratsiyasi
│   │       └── letsencrypt/    # SSL sertifikatlar
│   │
│   ├── portainer/
│   │   ├── docker-compose.yml  # Portainer konteyner UI
│   │   └── data/
│   │
│   └── scripts/
│       ├── deploy-local.sh     # Lokal deploy skripti
│       └── deploy-swarm.sh     # Swarm deploy skripti
│
├── volumes/                    # Docker persistent volumelar
│   ├── postgres-data/data/
│   ├── elastic-data/
│   ├── redis-data/
│   ├── nginx-data/
│   ├── portainer-data/
│   └── backend-storage/
│       └── dissertations/
```

---

## Docker Compose (lokal ishlatish)

Servislar va portlar:

| Konteyner | Port (xost:konteyner) | Tarmo'q |
|-----------|-----------------------|---------|
| dissertation-frontend | 3000:3000 | proxy_network, backend_network |
| dissertation-backend | 8000:8000 | backend_network, services_network, database_network |
| dissertation-search-service | 8001:8001 | services_network, database_network |
| dissertation-ai-service | 8002:8002 | services_network |
| dissertation-integration-service | 8003:8003 | services_network |
| dissertation-postgres | 5432:5432 | database_network |
| dissertation-elastic | 9200:9200 | database_network |
| dissertation-redis | 6379:6379 | database_network |

---

## Tarmoqlar (Networks)

| Tarmoq | Maqsad | Kirish huquqi |
|--------|--------|---------------|
| `proxy_network` | Frontend tashqi kirishga | Frontend |
| `backend_network` | Frontend-backend muloqoti | Frontend, Backend |
| `services_network` | Mikroservislar muloqoti | Backend, Search, AI, Integration |
| `database_network` | Ma'lumotlar bazasiga kirish | Backend, Search |

---

## Healthcheck

Barcha servislar healthcheck bilan jihozlangan:

- **Backend:** `GET /api/v1/health`
- **Search:** `GET /health`
- **AI:** `GET /health`
- **Integration:** `GET /health`
- **Postgres:** `pg_isready`
- **Redis:** `redis-cli ping`

Yuklanish tartibi:
```
postgres (healthy) →
redis (healthy) →
elasticsearch (started) →
search-service (healthy) →
integration-service (healthy) →
backend (healthy) →
frontend
```

---

## NGINX Proxy Manager

Tashqi domenlar va SSL uchun NGINX Proxy Manager ishlatiladi.

**Papka:** `infra/nginx/nginx-proxy-manager/`

```bash
cd infra/nginx/nginx-proxy-manager
docker compose up -d
```

**Kirish:** `http://server_ip:81`

**Standart login:**
- Email: `admin@example.com`
- Parol: `changeme`

SSL sertifikatlar Let's Encrypt orqali avtomatik olinadi.

---

## Portainer

Docker konteynerlarni boshqarish uchun web UI.

**Papka:** `infra/portainer/`

```bash
cd infra/portainer
docker compose up -d
```

**Kirish:** `http://server_ip:9000`

---

## Muhit o'zgaruvchilari

`.env` fayl namunasi (`.env.example` dan ko'chirish):

```bash
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
POSTGRES_PASSWORD=registry_password
POSTGRES_PORT=5432

# Elasticsearch
ELASTIC_PASSWORD=elasticpassword
ELASTIC_PORT=9200

# Redis
REDIS_PORT=6379

# JWT
JWT_SECRET=change_me_please
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=120

# Ulanish URL manzillari
DB_URL=postgresql+psycopg2://registry_user:registry_password@postgres:5432/dissertation_registry
REDIS_URL=redis://redis:6379/0
ELASTIC_URL=http://elastic:elasticpassword@elasticsearch:9200
AI_SERVICE_URL=http://ai-service:8002
SEARCH_SERVICE_URL=http://search-service:8001
INTEGRATION_SERVICE_URL=http://integration-service:8003
FILE_STORAGE_PATH=/app/storage

# OneID (stub)
ONEID_CLIENT_ID=placeholder-client
ONEID_CLIENT_SECRET=placeholder-secret
ONEID_REDIRECT_URI=http://localhost:8000/api/v1/auth/oneid/callback
```

---

## Docker Swarm

Ishlab chiqarish muhitida Docker Swarm ishlatiladi.

**Swarm stack:** `infra/docker/stacks/core-stack.yml`

```bash
# Swarm boshlash (bir martalik)
docker swarm init

# Stack deploy
docker stack deploy -c infra/docker/stacks/core-stack.yml registry

# Status
docker stack ps registry

# Log ko'rish
docker service logs registry_backend
```

Yoki tayyor skript:
```bash
bash infra/scripts/deploy-swarm.sh
```
