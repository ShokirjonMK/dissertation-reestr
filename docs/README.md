# Dokumentatsiya Indeksi

Dissertatsiyalar Reestri Tizimi — to'liq texnik dokumentatsiya.

---

## Umumiy ma'lumot

| Hujjat | Tavsif |
|--------|--------|
| [Tizim umumiy ko'rinishi](overview/system-overview.md) | Arxitektura, servislar, rollar |
| [Talablar bajarilish holati](overview/requirements-coverage.md) | TZ, UI va infra bo'yicha holat |

---

## Backend

| Hujjat | Tavsif |
|--------|--------|
| [Backend arxitekturasi](backend/backend-architecture.md) | Qatlamli arxitektura, tuzilish |
| [API Reference](backend/api-reference.md) | Barcha endpointlar, so'rovlar, javoblar |
| [Ma'lumotlar modeli](backend/data-model.md) | Jadvallar, maydonlar, munosabatlar |
| [Autentifikatsiya va rollar](backend/auth-roles.md) | JWT, RBAC, standart hisoblar |

---

## Frontend

| Hujjat | Tavsif |
|--------|--------|
| [UI Arxitekturasi](frontend/ui-architecture.md) | Stack, tuzilish, holat boshqaruvi |
| [Dizayn tizimi](frontend/design-system.md) | Glass UI, ranglar, tipografiya, animatsiya |
| [Komponentlar](frontend/components.md) | Barcha komponentlar tavsifi |
| [Sahifalar va oqimlar](frontend/pages-flows.md) | Sahifalar xaritasi, foydalanuvchi oqimlari |

---

## Servislar

| Hujjat | Tavsif |
|--------|--------|
| [Search Service](services/search-service.md) | Elasticsearch qidiruv adapteri |
| [AI Service](services/ai-service.md) | RAG savol-javob xizmati |
| [Integration Service](services/integration-service.md) | HR va pasport integratsiyasi |

---

## Ma'lumotlar bazalari

| Hujjat | Tavsif |
|--------|--------|
| [PostgreSQL](databases/postgres.md) | Asosiy ma'lumotlar bazasi |
| [Elasticsearch](databases/elasticsearch.md) | Qidiruv indeksi |
| [Redis](databases/redis.md) | Kesh va sessiya |

---

## Infratuzilma

| Hujjat | Tavsif |
|--------|--------|
| [Infratuzilma umumiy](infrastructure/infrastructure.md) | Docker, tarmoqlar, volumelar |
| [Docker Compose](infrastructure/docker-compose.md) | Lokal ishlatish qo'llanmasi |
| [Docker Swarm](infrastructure/swarm.md) | Klaster deploy |
| [Tarmoqlar va volumelar](infrastructure/networks-volumes.md) | Network va storage tafsilotlari |

---

## Operatsiyalar

| Hujjat | Tavsif |
|--------|--------|
| [Runbook](operations/runbook.md) | Ishga tushirish, boshqarish, backup |
| [Ubuntu Server Deploy](operations/ubuntu-deployment.md) | Ubuntu serverda o'rnatish to'liq qo'llanma |
| [Muammolarni bartaraf etish](operations/troubleshooting.md) | Xatolar va yechimlar |

---

## Tez ishga tushirish

```bash
cp .env.example .env
docker compose up -d --build
```

**Servislar:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs
- Search: http://localhost:8001/docs
- AI: http://localhost:8002/docs
- Integration: http://localhost:8003/docs

**Standart login:** `admin` / `admin12345`
