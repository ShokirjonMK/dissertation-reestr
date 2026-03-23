# Dissertatsiya reestri — texnik hujjatlar (`docs/`)

Monorepo: **Next.js** (`front/`), **FastAPI** (`back/`), **Search** (`services/search-service/`), **AI** (`services/ai-service/`), **Integration** (`services/integration-service/`). Ma'lumotlar: **PostgreSQL**, **Elasticsearch**, **Redis**.

---

## Tez boshlash

```bash
cp .env.example .env
docker compose up -d --build
```

| Servis | URL (lokal) |
|--------|-------------|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/docs |
| Search | http://localhost:8001/docs |
| AI | http://localhost:8002/docs |
| Integration | http://localhost:8003/docs |

Standart login (faqat dev): `admin` / `admin12345`

---

## Tizim haqida umumiy

| Hujjat | Tavsif |
|--------|--------|
| [Tizim umumiy ko‘rinishi](overview/system-overview.md) | Arxitektura, stack, rollar, funksiyalar |
| [Talablar bajarilish holati](overview/requirements-coverage.md) | TZ / UI / infra qamrovi |
| [Arxitektura (qisqa)](architecture.md) | Servislar va tarmoqlar |

---

## Modullar (har biri alohida papka)

Barcha biznes modullar ro‘yxati va havolalar: **[modules/README.md](modules/README.md)**

| Papka | Modul |
|-------|--------|
| [modules/catalogs/](modules/catalogs/README.md) | Kataloglar (mamlakat, yo‘nalish, universitet, region, tuman) |
| [modules/author-management/](modules/author-management/README.md) | Muallif / profil boshqaruvi |
| [modules/dissertation-wizard/](modules/dissertation-wizard/README.md) | Dissertatsiya yaratish oqimi |
| [modules/i18n/](modules/i18n/README.md) | Ko‘p tilli interfeys |
| [modules/implementation-proposals/](modules/implementation-proposals/README.md) | Amaliyotga joriy etish takliflari + moderatsiya |
| [modules/dissertation-problems-proposals/](modules/dissertation-problems-proposals/README.md) | Strukturalangan muammo/takliflar, AI ajratish, ES qidiruv |

---

## Backend

| Hujjat | Tavsif |
|--------|--------|
| [Backend arxitekturasi](backend/backend-architecture.md) | Qatlamlar, tuzilish |
| [API Reference](backend/api-reference.md) | REST endpointlar |
| [Ma'lumotlar modeli](backend/data-model.md) | Jadvallar va ER |
| [Autentifikatsiya va rollar](backend/auth-roles.md) | JWT, RBAC |

---

## Frontend

| Hujjat | Tavsif |
|--------|--------|
| [UI arxitekturasi](frontend/ui-architecture.md) | Stack, holat |
| [Dizayn tizimi](frontend/design-system.md) | Glass UI, tipografiya |
| [Komponentlar](frontend/components.md) | Komponentlar katalogi |
| [Sahifalar va oqimlar](frontend/pages-flows.md) | Marshrutlar va user flow |

---

## Mikroservislar

| Hujjat | Tavsif |
|--------|--------|
| [Search Service](services/search-service.md) | Elasticsearch, `/search`, `/search/problems-proposals` |
| [AI Service](services/ai-service.md) | `/ask`, `/extract` |
| [Integration Service](services/integration-service.md) | HR / pasport stub |

---

## Ma'lumotlar bazalari

| Hujjat | Tavsif |
|--------|--------|
| [PostgreSQL](databases/postgres.md) | Asosiy DB |
| [Elasticsearch](databases/elasticsearch.md) | Indeks, mapping, nested maydonlar |
| [Redis](databases/redis.md) | Kesh / navbat |

---

## Infratuzilma

| Hujjat | Tavsif |
|--------|--------|
| [Umumiy](infrastructure/infrastructure.md) | Docker, tarmoq |
| [Docker Compose](infrastructure/docker-compose.md) | Lokal ishga tushirish |
| [Docker Swarm](infrastructure/swarm.md) | Klaster |
| [Tarmoqlar va volumelar](infrastructure/networks-volumes.md) | Network / storage |

---

## Operatsiyalar

| Hujjat | Tavsif |
|--------|--------|
| [Runbook](operations/runbook.md) | Ishga tushirish, backup |
| [Ubuntu deploy](operations/ubuntu-deployment.md) | Server o‘rnatish |
| [Troubleshooting](operations/troubleshooting.md) | Xatolar |

---

*Indeks yangilandi: 2026-03-23*
