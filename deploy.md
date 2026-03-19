# Dissertation Registry — Deploy Hisoboti

**Sana:** 2026-03-19
**Server:** `86.48.3.80` (Ubuntu 24.04.4 LTS)
**Repo:** https://github.com/ShokirjonMK/dissertation-reestr.git

---

## Server Holati (Deploy Oldidan)

| Xususiyat | Qiymat |
|-----------|--------|
| OS | Ubuntu 24.04.4 LTS (Noble Numbat) |
| Kernel | 6.8.0-100-generic |
| CPU | 6 core AMD EPYC |
| RAM | 11 GB (10 GB bo'sh) |
| Disk | 193 GB (188 GB bo'sh, 3% ishlatilgan) |
| Docker | 29.3.0 |
| Docker Compose | v5.1.0 |
| Git | 2.43.0 |
| Python | 3.12.3 |

### Deploy Oldidan Ishlayotgan Servislar

| Konteyner | Port | Holat |
|-----------|------|-------|
| `nginx_proxy_manager` | 80, 81, 443 | Up 7 days |
| `portainer` | 9000 | Up 7 days |
| `greenfin-uz` | 8080 | Up 7 days |

---

## Deploy Qadamlari

### Qadam 1: Repo Klonlash
```bash
git clone https://github.com/ShokirjonMK/dissertation-reestr.git /opt/dissertation-reestr
```
**Natija:** `/opt/dissertation-reestr` papkasi yaratildi, barcha fayllar yuklab olindi.

---

### Qadam 2: `.env` Fayl Yaratish

Production uchun yangi kuchli secret kalitlar bilan `.env` yaratildi:

```bash
cat > /opt/dissertation-reestr/.env << 'EOF'
PROJECT_NAME=dissertation-registry

BACKEND_PORT=8000
FRONTEND_PORT=3000
SEARCH_SERVICE_PORT=8001
AI_SERVICE_PORT=8002
INTEGRATION_SERVICE_PORT=8003

POSTGRES_DB=dissertation_registry
POSTGRES_USER=registry_user
POSTGRES_PASSWORD=_VYNHhX9IFTtcr5M8og3ugHFGtUi3bSKl2H-a5FBwl8
POSTGRES_PORT=5432

ELASTIC_PASSWORD=r5YcQEPqDeOIN7a0ILrElqNkc4icuNHk
ELASTIC_PORT=9200

REDIS_PORT=6379

JWT_SECRET=f3422e22372f4625117ab3211f8e33e20d61f611c2a9dfe179e1d24f2a8e5e9c5cd5c3acb1c43ebb7d187f5b3e95743dee648830d0929665cb56b4c2d4d1bd05
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=120

DB_URL=postgresql+psycopg2://registry_user:_VYNHhX9IFTtcr5M8og3ugHFGtUi3bSKl2H-a5FBwl8@postgres:5432/dissertation_registry
REDIS_URL=redis://redis:6379/0
ELASTIC_URL=http://elastic:r5YcQEPqDeOIN7a0ILrElqNkc4icuNHk@elasticsearch:9200
AI_SERVICE_URL=http://ai-service:8002
SEARCH_SERVICE_URL=http://search-service:8001
INTEGRATION_SERVICE_URL=http://integration-service:8003
FILE_STORAGE_PATH=/app/storage

ONEID_CLIENT_ID=placeholder-client
ONEID_CLIENT_SECRET=placeholder-secret
ONEID_REDIRECT_URI=http://86.48.3.80:8000/api/v1/auth/oneid/callback

NEXT_PUBLIC_API_URL=http://86.48.3.80:8000/api/v1
EOF
```

---

### Qadam 3: Firewall Portlarni Ochish

```bash
ufw allow 3000/tcp   # Frontend
ufw allow 8000/tcp   # Backend API
ufw allow 8001/tcp   # Search Service
ufw allow 8002/tcp   # AI Service
ufw allow 8003/tcp   # Integration Service
```

**Natija:** UFW qoidalar qo'shildi (IPv4 va IPv6 uchun).

---

### Qadam 4: Volume Papkalar Yaratish

```bash
mkdir -p /opt/dissertation-reestr/volumes/postgres-data/data
mkdir -p /opt/dissertation-reestr/volumes/elastic-data
mkdir -p /opt/dissertation-reestr/volumes/redis-data
mkdir -p /opt/dissertation-reestr/volumes/backend-storage
```

---

### Qadam 5: TypeScript Xatolarini Tuzatish

**Muammo 1:** Birinchi build urinishida `npm ci` muvaffaqiyatsiz bo'ldi.
**Sabab:** `package-lock.json` muvofiqlik muammosi.
**Yechim:** `package-lock.json` o'chirildi — Docker `npm install` ishlatdi.

**Muammo 2:** `npm run build` (Next.js) TypeScript xatosi:
```
Type error: Type 'Promise<Country>' is not assignable to type 'Promise<void>'.
```
**Joyi:** `src/pages/dashboard/catalogs/countries.tsx:120` va boshqa 4 ta katalog sahifasi + `CatalogCrud.tsx`
**Yechim:** `CatalogCrud.tsx` da prop tiplar `Promise<void>` → `Promise<unknown>` ga o'zgartirildi.

```bash
# Lokal tuzatish va GitHub ga push:
git add front/src/components/dashboard/CatalogCrud.tsx front/src/pages/dashboard/catalogs/
git commit -m "fix: accept Promise<unknown> in CatalogCrud to allow mutateAsync return types"
git push origin main

# VM da yangilanishni olish:
cd /opt/dissertation-reestr && git pull origin main
```

---

### Qadam 6: CORS Konfiguratsiyasi

`config.py` da CORS faqat `localhost` uchun sozlangan edi, production IP qo'shildi:

```bash
echo 'CORS_ORIGINS=["http://86.48.3.80:3000","http://localhost:3000","http://127.0.0.1:3000","http://localhost:3001"]' >> /opt/dissertation-reestr/.env

# .env yangilanishi uchun container qayta yaratildi (restart yetmaydi):
cd /opt/dissertation-reestr && docker compose up -d backend
```

---

### Qadam 7: Docker Compose Build va Start

```bash
cd /opt/dissertation-reestr
docker compose build --no-cache frontend   # Frontend qaytadan build
docker compose up -d                        # Barcha servislar start
```

**Build vaqti:** ~5 daqiqa (barcha Python servislar + Next.js frontend)

---

### Qadam 7: Servislar Holati Tekshiruvi

```bash
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
```

---

## Deploy Natijasi

### Ishlayotgan Konteynerlar

| Konteyner | Status | Port |
|-----------|--------|------|
| `dissertation-frontend` | healthy | 3000 |
| `dissertation-backend` | healthy | 8000 |
| `dissertation-search-service` | healthy | 8001 |
| `dissertation-ai-service` | healthy | 8002 |
| `dissertation-integration-service` | healthy | 8003 |
| `dissertation-postgres` | healthy | 5432 |
| `dissertation-redis` | healthy | 6379 |
| `dissertation-elastic` | running | 9200 |

### Servis URL lari

| Servis | URL |
|--------|-----|
| **Frontend** | http://86.48.3.80:3000 |
| **Backend API Docs** | http://86.48.3.80:8000/docs |
| **Backend Health** | http://86.48.3.80:8000/api/v1/health |
| **Search Service Docs** | http://86.48.3.80:8001/docs |
| **AI Service Docs** | http://86.48.3.80:8002/docs |
| **Integration Docs** | http://86.48.3.80:8003/docs |
| **Portainer** | http://86.48.3.80:9000 |

### Test Akkauntlar

| Login | Parol | Rol |
|-------|-------|-----|
| `admin` | `admin12345` | Admin |
| `moderator` | `moderator123` | Moderator |
| `doctorant` | `doctorant123` | Doctorant |
| `supervisor` | `supervisor123` | Supervisor |
| `employee` | `employee123` | Employee |

> **MUHIM:** Production da parollarni o'zgartiring!

---

## Resurs Iste'moli (Deploy dan Keyin)

| Konteyner | CPU | RAM |
|-----------|-----|-----|
| `dissertation-elastic` | ~271% (start) | 738 MB |
| `dissertation-backend` | 0.31% | 109 MB |
| `dissertation-postgres` | 2.06% | 68 MB |
| `dissertation-search-service` | 0.26% | 59 MB |
| `dissertation-frontend` | 0.00% | 48 MB |
| `dissertation-redis` | 0.59% | 15 MB |

> Elasticsearch start paytida ko'p CPU ishlatadi, bir necha daqiqadan keyin kamayadi.

---

## Umumiy Xulosa

Deploy **muvaffaqiyatli** yakunlandi.

**Muhim kuzatuvlar:**
1. **npm ci xatosi** — `package-lock.json` Windows muhitida generatsiya qilingan va Alpine Linux da `npm ci` bilan muammosi bor edi. Yechim: `package-lock.json` o'chirib `npm install` ishlatildi.
2. **TypeScript xatosi** — `CatalogCrud` komponenti `Promise<void>` kutgan, lekin `mutateAsync` `Promise<Entity>` qaytargan. `Promise<unknown>` ga o'zgartirib tuzatildi.
3. **Elasticsearch** — Start paytida ko'p resurs iste'mol qiladi, bu normal holat.
4. **Nginx Proxy Manager** — Server da allaqachon o'rnatilgan, kelajakda domain bilan HTTPS sozlash mumkin.

**Keyingi qadamlar (ixtiyoriy):**
- Domain sozlash va Nginx Proxy Manager orqali HTTPS qo'shish
- Seed parollarini o'zgartirish
- Elasticsearch to'liq start bo'lganini kutish (bir necha daqiqa)
- Monitoring sozlash (Portainer orqali kuzatish mumkin: http://86.48.3.80:9000)
