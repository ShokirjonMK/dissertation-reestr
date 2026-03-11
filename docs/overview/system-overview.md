# Tizim Umumiy Ko'rinishi

## Loyiha maqsadi

Dissertatsiyalar muammolari va takliflari reestri — Adliya vazirligi uchun mo'ljallangan markazlashgan axborot tizimi. Tizim orqali doktorantlar dissertatsiya ma'lumotlarini kiritadi, Adliya vazirligi ekspertlari ularni ko'rib chiqadi, tasdiqlaydi yoki rad etadi. Himoya qilingan ishlar reestri yuritiladi, qidiruv va AI-analitika imkoniyatlari taqdim etiladi.

---

## Arxitektura

```
┌─────────────────────────────────────────────────────────────┐
│                      FOYDALANUVCHI                          │
│                   (Browser: port 3000)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                FRONTEND (Next.js 14)                        │
│  Glass UI · TailwindCSS · Zustand · TanStack Query          │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API
┌────────────────────────▼────────────────────────────────────┐
│               BACKEND (FastAPI, port 8000)                  │
│  JWT Auth · Role-based · SQLAlchemy · Pydantic              │
└────┬─────────────┬─────────────┬───────────────┬────────────┘
     │             │             │               │
┌────▼───┐  ┌──────▼───┐  ┌─────▼────┐  ┌──────▼──────┐
│Postgres│  │  Search  │  │    AI    │  │Integration  │
│  :5432 │  │ :8001    │  │ :8002    │  │ Service     │
└────────┘  └──────────┘  └──────────┘  │ :8003       │
                │                        └─────────────┘
         ┌──────▼──────┐
         │Elasticsearch│
         │  :9200      │
         └─────────────┘
┌─────────────────────────────────────────────────────────────┐
│                   Redis :6379 (Cache)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Servislar

| Servis | Port | Texnologiya | Maqsad |
|--------|------|-------------|--------|
| Frontend | 3000 | Next.js 14 | Foydalanuvchi interfeysi |
| Backend | 8000 | FastAPI | Asosiy API va biznes mantiq |
| Search Service | 8001 | FastAPI + Elasticsearch | To'liq matnli qidiruv |
| AI Service | 8002 | FastAPI | RAG-asosida savol-javob |
| Integration Service | 8003 | FastAPI | HR va pasport integratsiyasi |
| PostgreSQL | 5432 | PostgreSQL 16 | Asosiy ma'lumotlar bazasi |
| Elasticsearch | 9200 | ES 8.13 | Qidiruv indeksi |
| Redis | 6379 | Redis 7 | Kesh va sessiya |

---

## Foydalanuvchi rollari

| Rol | Huquqlar |
|-----|----------|
| **Admin** | Barcha operatsiyalar, foydalanuvchilarni boshqarish |
| **Moderator** | Dissertatsiyalarni ko'rish, tasdiqlash/rad etish |
| **Doctorant** | O'z dissertatsiyalarini yaratish va boshqarish |
| **Supervisor** | Doktorantlar ishlarini ko'rish va izoh berish |
| **Employee** | Faqat ko'rish va qidirish |

---

## Asosiy xususiyatlar

### 1. Dissertatsiya boshqaruvi
- Dissertatsiya ma'lumotlarini kiritish (sarlavha, muammo, taklif, annotatsiya, xulosa)
- Fayllarni yuklash (PDF, Word, avtoreferat)
- Status kuzatuvi: `draft → pending → approved/rejected → defended`
- Ekspert reytingi va ko'rinuvchanlik sozlamalari

### 2. Qidiruv va filtrlash
- Elasticsearch asosida to'liq matnli qidiruv
- Ko'p parametrli filtrlash (yo'nalish, universitet, muallif, holat, yil...)
- Sinonim va xato-tolerant qidiruv

### 3. AI Assistant
- RAG (Retrieval Augmented Generation) texnologiyasi
- Dissertatsiya bazasidan kontekstli javob berish
- Chat interfeysi orqali muloqot

### 4. Moderatsiya
- Moderatorlar dissertatsiyalarni ko'rib chiqadi
- Tasdiqlash, rad etish yoki ko'rib chiqishga qaytarish
- Ekspert izohlar va tavsiyalar

### 5. Kataloglar (CRUD)
- Ilmiy yo'nalishlar
- Universitetlar
- Regionlar va tumanlar

---

## Texnologiyalar steki

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Til**: TypeScript
- **Stil**: TailwindCSS + Glass UI
- **UI komponentlar**: Shadcn/ui
- **Holat**: Zustand
- **Ma'lumot olish**: TanStack Query
- **Ikonlar**: Lucide React

### Backend
- **Framework**: FastAPI (Python 3.13+)
- **ORM**: SQLAlchemy 2.0
- **Validatsiya**: Pydantic v2
- **Auth**: JWT (python-jose)
- **Migratsiya**: Alembic
- **HTTP**: httpx

### Infratuzilma
- **Konteynerlashtirish**: Docker + Docker Compose
- **Klasterlashtirish**: Docker Swarm
- **Reverse Proxy**: NGINX Proxy Manager
- **Konteyner UI**: Portainer

---

## Ma'lumotlar oqimi

```
Doktorant → Dissertatsiya yuboradi
    ↓
Backend validatsiya qiladi, PostgreSQL'ga saqlaydi
    ↓
Search Service Elasticsearch'ga indekslaydi
    ↓
Moderator ko'rib chiqadi va tasdiqlaydi/rad etadi
    ↓
Employee/foydalanuvchi qidiradi va ko'radi
    ↓
AI Assistant savollarga javob beradi
```

---

## Standart hisoblar (Development)

| Foydalanuvchi | Parol | Rol |
|---------------|-------|-----|
| admin | admin12345 | Admin |
| moderator | moderator123 | Moderator |
| doctorant | doctorant123 | Doctorant |
| supervisor | supervisor123 | Supervisor |
| employee | employee123 | Employee |

> **Muhim**: Ishlab chiqarish muhitida bu parollarni o'zgartiring!
