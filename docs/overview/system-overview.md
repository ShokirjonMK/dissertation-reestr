# Dissertatsiya Reestri — Tizim Umumiy Ko'rinishi

> **Versiya:** 2.0.0
> **Yangilangan:** 2026-03-11
> **Muallif:** Texnik arxitektura bo'limi

---

## 1. Tizim Maqsadi va Vazifasi

**Dissertatsiya Reestri** — O'zbekiston Respublikasida himoya qilingan va himoyaga tayyorlanayotgan ilmiy dissertatsiyalarning (nomzodlik va doktorlik) yagona raqamli bazasini yuritish, qidirish va tahlil qilish uchun mo'ljallangan davlat axborot tizimi. Tizim Adliya vazirligi nazoratida ishlaydi.

### 1.1 Asosiy Maqsadlar

- Ilmiy dissertatsiyalarni markazlashgan holda ro'yxatga olish va saqlash
- Dissertatsiyalarni elektron formatda arxivlash va indekslash
- Ilmiy ish natijalari va xulosalarini tezkor qidirish imkoniyatini ta'minlash
- Sun'iy intellekt yordamida ilmiy tahlil va plagiat tekshiruvi
- Ilmiy yo'nalishlar, universitetlar, mualliflar bo'yicha statistik hisobotlar shakllantirish
- Xalqaro ilmiy ma'lumotlar bazalari bilan integratsiya

### 1.2 Tizim Vazifalari

| # | Vazifa | Tavsif |
|---|--------|---------|
| 1 | Ro'yxatga olish | Dissertatsiyalarni yuklash va rasmiylashtirish |
| 2 | Saqlash | Fayl va metadata arxivlash |
| 3 | Qidiruv | To'liq matn va semantik qidiruv |
| 4 | Tahlil | AI yordamida ilmiy tahlil |
| 5 | Moderatsiya | Ekspert ko'rib chiqish va tasdiqlash jarayoni |
| 6 | Hisobot | Statistika va analitika |
| 7 | Eksport | Turli formatlarda yuklab olish |

### 1.3 Loyiha Konteksti

Tizim O'zbekiston ilmiy jamoatchiligi uchun quyidagi muammolarni hal qiladi:

- Dissertatsiyalar tarqoq va kuzatilmagan holda saqlanishi
- Ilmiy ishlarning mavjudligini tekshirish qiyinligi
- Plagiat va dublikat ishlarning oldini olish zarurati
- Ilmiy yo'nalishlarda progress va tendensiyalarni kuzatish
- Adliya vazirligi tomonidan nazorat va hisobot talab qilinishi

---

## 2. Arxitektura Diagrammasi

```
┌─────────────────────────────────────────────────────────────────┐
│                        FOYDALANUVCHI                            │
│              (Browser / Mobile / API Client)                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS (443)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     NGINX Reverse Proxy                         │
│                    (SSL Termination, Load Balancing)            │
└──────────────┬──────────────────────────┬───────────────────────┘
               │ :3000                    │ :8000
               ▼                          ▼
┌──────────────────────┐      ┌───────────────────────────────────┐
│   FRONTEND           │      │   BACKEND (Main API)              │
│   Next.js 14         │      │   FastAPI (Python 3.13+)          │
│   TypeScript         │◄────►│   Port: 8000                      │
│                      │      │                                   │
│  - App Router        │      │  - REST API v1                    │
│  - Zustand Store     │      │  - JWT Auth (Access + Refresh)    │
│  - TailwindCSS       │      │  - Role-based Access Control      │
│  - TanStack Query    │      │  - SQLAlchemy 2.0 ORM             │
│  - shadcn/ui         │      │  - Pydantic v2 Validation         │
│  - Glass UI          │      │  - Alembic Migrations             │
└──────────────────────┘      └────────────┬──────────────────────┘
                                           │
              ┌────────────────────────────┼────────────────────────────┐
              │                            │                            │
              ▼                            ▼                            ▼
┌─────────────────────┐   ┌───────────────────────┐   ┌───────────────────────┐
│   Search Service    │   │    AI Service          │   │ Integration Service   │
│   FastAPI           │   │    FastAPI             │   │ FastAPI               │
│   Port: 8001        │   │    Port: 8002          │   │ Port: 8003            │
│                     │   │                        │   │                       │
│  - ES integratsiya  │   │  - LLM/RAG pipeline    │   │  - IIV pasport API    │
│  - Full-text search │   │  - Embedding gen.      │   │  - JSHSHIR tekshiruv  │
│  - Aggregatsiyalar  │   │  - AI tahlil           │   │  - Tashqi servislar   │
└──────┬──────────────┘   └──────────┬─────────────┘   └───────────────────────┘
       │                             │
       ▼                             ▼
┌─────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│  ElasticSearch  │   │   PostgreSQL 16      │   │   Redis 7           │
│  Port: 9200     │   │   Port: 5432         │   │   Port: 6379        │
│                 │   │                     │   │                     │
│ - Matn indeksi  │   │ - Dissertatsiyalar  │   │ - Session cache     │
│ - Vektor indeks │   │ - Foydalanuvchilar  │   │ - API rate limit    │
│ - Aggreg. cache │   │ - Kataloglar        │   │ - Task queue        │
└─────────────────┘   └─────────────────────┘   └─────────────────────┘
```

---

## 3. Texnologiya Stack

### 3.1 Backend Servislar

| Texnologiya | Versiya | Maqsad |
|-------------|---------|--------|
| Python | 3.13+ | Asosiy dasturlash tili |
| FastAPI | 0.104+ | REST API framework (barcha servislar) |
| SQLAlchemy | 2.0+ | ORM (Object-Relational Mapping) |
| Alembic | 1.12+ | Database migratsiyalari |
| Pydantic | 2.0+ | Ma'lumot validatsiyasi va serializatsiya |
| python-jose | 3.3+ | JWT token yaratish va tekshirish |
| passlib | 1.7+ | Parol shifrlash (bcrypt) |
| python-multipart | — | Multipart fayl yuklash |
| httpx | 0.25+ | Asinxron HTTP so'rovlar |
| asyncpg | 0.29+ | Asinxron PostgreSQL drayveri |

### 3.2 Frontend

| Texnologiya | Versiya | Maqsad |
|-------------|---------|--------|
| Next.js | 14+ | React framework (App Router) |
| TypeScript | 5.0+ | Statik tip tekshiruvi |
| Zustand | 4.4+ | Global holat boshqaruvi |
| TanStack Query | 5.0+ | Server holat va kesh boshqaruvi |
| TailwindCSS | 3.3+ | Utility-first CSS framework |
| shadcn/ui | latest | Accessible UI komponentlar |
| React Hook Form | 7.0+ | Forma boshqaruvi |
| Zod | 3.0+ | Runtime schema validatsiyasi |
| Lucide React | latest | SVG ikonlar kutubxonasi |
| Axios | 1.5+ | HTTP so'rovlar interceptor |

### 3.3 Ma'lumotlar Bazasi va Kesh

| Texnologiya | Versiya | Maqsad |
|-------------|---------|--------|
| PostgreSQL | 16+ | Asosiy relatsion ma'lumotlar bazasi |
| ElasticSearch | 8.13+ | To'liq matn qidiruvi va indekslash |
| Redis | 7.2+ | Kesh, session va navbat boshqaruvi |

### 3.4 Sun'iy Intellekt

| Texnologiya | Versiya | Maqsad |
|-------------|---------|--------|
| LLM (OpenAI/Local) | GPT-4/Llama | Matn tahlili va generatsiya |
| LangChain | 0.1+ | RAG pipeline orkestratsiyasi |
| Sentence Transformers | latest | Matn vektorizatsiyasi (embedding) |
| PyPDF2 / pdfplumber | latest | PDF matn ekstraktsiyasi |
| python-docx | latest | DOCX fayl o'qish va tahlil |

### 3.5 Infratuzilma

| Texnologiya | Versiya | Maqsad |
|-------------|---------|--------|
| Docker | 24+ | Konteynerizatsiya |
| Docker Compose | 2.20+ | Multi-servis orchestration |
| Docker Swarm | — | Klasterlashtirish (production) |
| NGINX Proxy Manager | latest | Reverse proxy, SSL termination |
| Portainer | latest | Konteyner boshqaruv paneli |

---

## 4. Servislar Ro'yxati va Vazifalari

### 4.1 Main API Servisi (FastAPI, :8000)

Barcha biznes mantiq va ma'lumot boshqaruvi uchun asosiy backend servisi.

**Modullar:**
- `auth` — JWT autentifikatsiya, rol boshqaruvi
- `dissertations` — Dissertatsiya CRUD, status boshqaruvi
- `catalogs` — Mamlakatlar, universitetlar, yo'nalishlar, regionlar
- `authors` — Muallif profili va identifikatsiya
- `files` — Fayl yuklash, validatsiya, saqlash
- `reports` — Statistika va hisobot generatsiyasi

### 4.2 Frontend Servisi (Next.js, :3000)

Server-side rendering bilan foydalanuvchi interfeysi.

**Asosiy sahifalar:**
- `/` — Bosh sahifa (qidiruv + statistika)
- `/dashboard` — Boshqaruv paneli
- `/dashboard/dissertations` — Dissertatsiyalar ro'yxati
- `/dashboard/dissertations/upload` — Yuklash wizard (6 bosqich)
- `/dashboard/catalogs/*` — Kataloglar boshqaruvi
- `/dashboard/reports` — Hisobotlar va analitika

### 4.3 Search Service (FastAPI, :8001)

ElasticSearch bilan integratsiya va qidiruv mantiqini boshqarish.

**Imkoniyatlar:**
- To'liq matn qidiruvi (full-text search)
- Vektorli semantik qidiruv
- Faceted filtrlash va aggregatsiyalar
- Sinonim va xato-tolerant qidiruv
- Avtoto'ldirish (autocomplete) taklifi

### 4.4 AI Service (FastAPI, :8002)

RAG (Retrieval Augmented Generation) asosidagi AI xizmatlari.

**Imkoniyatlar:**
- Dissertatsiya bazasidan kontekstli javob
- Chat interfeysi uchun LLM integratsiya
- Annotatsiya va kalit so'zlar generatsiyasi
- Plagiat va o'xshashlik tekshiruvi
- Ilmiy matn tahlili va baholash

### 4.5 Integration Service (FastAPI, :8003)

Tashqi davlat tizimlari bilan integratsiya.

**Integratsiyalar:**
- IIV pasport tizimi (shaxs tekshirish)
- JSHSHIR bazasi (shaxsni identifikatsiya)
- HR tizimlar (xodim ma'lumotlari)

### 4.6 PostgreSQL (:5432)

Barcha tizim ma'lumotlari uchun asosiy relatsion baza.

**Asosiy jadvallar:**
- `users` — Foydalanuvchi profillari
- `dissertations` — Dissertatsiya metadatasi
- `authors` — Muallif ma'lumotlari
- `countries`, `universities`, `regions`, `scientific_directions` — Kataloglar

### 4.7 ElasticSearch (:9200)

To'liq matn va vektorli qidiruv uchun indekslash.

**Indekslar:**
- `dissertations` — Asosiy qidiruv indeksi
- `dissertations_vectors` — Semantik qidiruv uchun embedding vektorlar

### 4.8 Redis (:6379)

Tezkor kesh va navbat boshqaruvi.

**Foydalanish holatlari:**
- JWT token blacklist (logout)
- API rate limiting
- Session ma'lumotlari
- Tez-tez so'raladigan katalog ma'lumotlari keshi

---

## 5. Foydalanuvchilar va Rolar Jadvali

| Rol | Kodi | Tavsif |
|-----|------|---------|
| Administrator | `ADMIN` | Tizim va foydalanuvchilar boshqaruvi |
| Moderator | `MODERATOR` | Dissertatsiya ko'rib chiqish va tasdiqlash |
| Doktorant | `DOCTORANT` | O'z dissertatsiyalarini yuklash va boshqarish |
| Ilmiy rahbar | `SUPERVISOR` | Doktorant ishlarini ko'rish va izoh berish |
| Xodim | `EMPLOYEE` | Faqat ko'rish va qidirish |

### 5.1 Ruxsatlar Matritsasi

| Amal | ADMIN | MODERATOR | DOCTORANT | SUPERVISOR | EMPLOYEE |
|------|-------|-----------|-----------|------------|---------|
| Dissertatsiya yaratish | + | — | + | — | — |
| O'z dissertatsiyasini ko'rish | + | + | + | + | + |
| Barcha dissertatsiyalarni ko'rish | + | + | — | + | + |
| Dissertatsiya tasdiqlash | + | + | — | — | — |
| Katalog ko'rish | + | + | + | + | + |
| Katalog tahrirlash | + | — | — | — | — |
| Foydalanuvchi boshqaruvi | + | — | — | — | — |
| Hisobotlar | + | + | — | — | — |
| AI assistant | + | + | + | + | + |

---

## 6. Asosiy Funksiyalar Ro'yxati

### 6.1 Dissertatsiya Boshqaruvi

- **Yuklash Wizard** — 6 bosqichli dissertatsiya kiritish jarayoni
- **Status kuzatuvi** — `draft → pending → approved/rejected → defended`
- **Metadata tahrirlash** — Sarlavha, kalit so'zlar, annotatsiya o'zgartirish
- **Ekspert izohlari** — Moderator tomonidan izoh va tavsiyalar
- **Ko'p formatli eksport** — PDF, DOCX, JSON

### 6.2 Qidiruv va Filtrlash

- **To'liq matn qidiruvi** — ElasticSearch orqali barcha maydonlar
- **Semantik qidiruv** — LLM embedding orqali ma'no bo'yicha qidiruv
- **Faceted filtrlash** — Yo'nalish, universitet, yil, mamlakat bo'yicha
- **Saralash** — Sana, aloqadorlik, ko'rishlar soni bo'yicha
- **Avtoto'ldirish** — Qidiruv satrida taklif generatsiyasi

### 6.3 Muallif Boshqaruvi

- **Muallif profili** — Shaxsiy ma'lumotlar va ilmiy faoliyat tarixi
- **3 ta identifikatsiya usuli** — To'liq ism / JSHSHIR / Pasport
- **O'zini muallif qilish** — Foydalanuvchi o'z profili bilan muallif bo'lishi
- **Ilmiy rahbar** — Supervisor ma'lumotlarini qo'shish

### 6.4 Kataloglar (CRUD)

- **Mamlakatlar** — Xalqaro katalog, ko'p tilli nom
- **Universitetlar** — Mamlakat va region bog'liqligi
- **Ilmiy yo'nalishlar** — Kod va tavsif bilan
- **Regionlar** — Mamlakat bog'liqligi

### 6.5 Sun'iy Intellekt Xizmatlari

- **AI Assistant (Chat)** — RAG asosida savollar javoblash
- **Annotatsiya generatsiyasi** — Matn asosida avtomatik annotatsiya
- **Kalit so'zlar chiqarish** — NLP orqali aniqlash
- **Plagiat tekshiruvi** — Mavjud dissertatsiyalar bilan solishtirish
- **Semantik o'xshashlik** — Tegishli ishlarni tavsiya qilish

### 6.6 Hisobotlar va Statistika

- Yo'nalishlar bo'yicha dissertatsiyalar soni
- Universitetlar reytingi
- Yillik dinamika
- Mualliflar faoliyati statistikasi
- PDF/Excel formatida eksport

---

## 7. Ma'lumot Oqimi

```
Doktorant → Wizard (6 bosqich) → API Validatsiya → PostgreSQL
                                        │
                                        ├── PDF/DOCX Fayl → MinIO/Local Storage
                                        │                          │
                                        │                   Text Extraction
                                        │                          │
                                        │                   ES Indexing
                                        │                          │
                                        │                   AI Embedding
                                        │                          │
                                        └── Metadata ←─────────────┘
                                               │
                               Moderator → Ko'rib chiqish → Tasdiqlash/Rad
                                               │
                                    Approved → Public ko'rinishi
                                               │
                               Qidiruv ← ElasticSearch ← Foydalanuvchi
                                               │
                               AI Chat ← RAG Pipeline ← Savol
```

---

## 8. Xavfsizlik

| Xavfsizlik qatlami | Texnologiya | Tavsif |
|-------------------|-------------|---------|
| Autentifikatsiya | JWT (Access 15 min + Refresh 30 kun) | Token asosida sessiya |
| Parol | bcrypt hashing | Bir yo'nalishlI shifrlash |
| Ruxsatlar | Role-based Access Control | Har bir endpoint uchun rol tekshiruvi |
| Rate Limiting | Redis | IP va user bazasida cheklash |
| Transport | HTTPS/TLS | Barcha trafik shifrlangan |
| Input | Pydantic v2 | Barcha kirishlar validatsiya |
| SQL | SQLAlchemy ORM | Parameterizatsiya orqali injection himoyasi |
| Fayl | MIME + hajm tekshiruvi | Xavfli fayl yuklashdan himoya |

---

## 9. Standart Hisoblar (Development muhiti)

| Foydalanuvchi | Parol | Rol |
|---------------|-------|-----|
| admin | admin12345 | Admin |
| moderator | moderator123 | Moderator |
| doctorant | doctorant123 | Doctorant |
| supervisor | supervisor123 | Supervisor |
| employee | employee123 | Employee |

> **MUHIM:** Ishlab chiqarish (production) muhitida bu parollarni albatta o'zgartiring!

---

*Hujjat versiyasi: 2.0.0. So'nggi o'zgarishlar uchun Git tarixini tekshiring.*
