# Dissertatsiyalar Muammolari va Takliflari Reestri Axborot Tizimi

## TEXNIK TOPSHIRIQ (TZ) — v2.0

**Versiya:** 2.0
**Sana:** 2026-03-11
**Holat:** Tasdiqlangan — Kengaytirilgan versiya

---

# 1. Loyiha haqida umumiy ma'lumot

Ushbu loyiha dissertatsiya ishlarida ko'tarilgan muammolar, takliflar va
xulosalarni markazlashgan elektron bazada yuritish uchun mo'ljallangan
axborot tizimini yaratishni va kengaytirishni nazarda tutadi.

Tizim orqali:

- doktorantlar dissertatsiya mavzularini joylashtiradi
- dissertatsiyada ko'tarilgan muammolar va takliflar kiritiladi
- Adliya vazirligi mutaxassislari mavzularni ko'rib chiqadi va ruxsat beradi
- himoya qilingan ishlar reestri yuritiladi
- ilmiy ishlar amaliyotga tadbiq qilish imkoniyati bo'yicha tahlil qilinadi
- AI yordamida ilmiy bo'shliqlar aniqlanadi va tavsiyalar beriladi
- ko'p tilli interfeys (O'zbek, Rus, Ingliz) qo'llab-quvvatlanadi

---

# 2. Tizim foydalanuvchilari va rollar

## 2.1 Admin

- tizim konfiguratsiyasini boshqarish
- foydalanuvchilarni yaratish
- rollarni boshqarish
- kataloglarni boshqarish (mamlakatlar, universitetlar, yo'nalishlar, regionlar)
- statistikani ko'rish

## 2.2 Moderator (Adliya ekspertlari)

- dissertatsiyalarni ko'rib chiqish
- tasdiqlash yoki rad etish
- tavsiyalar berish
- amaliyotga joriy qilishni baholash

## 2.3 Doktorant

- dissertatsiya ma'lumotlarini kiritish (wizard interfeysi orqali)
- muammo va takliflarni yozish
- annotatsiya va kalit so'zlarni kiritish
- fayl yuklash (PDF, DOCX, TXT)

## 2.4 Ilmiy rahbar

- doktorant ishlarini ko'rib chiqish
- izoh va tavsiyalar berish

## 2.5 Foydalanuvchi (Adliya xodimlari)

- qidirish
- ko'rish
- tahlil qilish
- AI asosida qidiruv

---

# 3. Foydalanuvchi profili (barcha foydalanuvchilar uchun)

Har bir foydalanuvchi tizimda shaxsiy profilga ega bo'ladi.

### 3.1 Profil maydonlari

| Maydon | Tur | Izoh |
|---|---|---|
| id | integer | Birlamchi kalit |
| image | string | Profil rasmi |
| last_name | string | Familiya |
| first_name | string | Ism |
| middle_name | string | Otasining ismi |
| passport_seria | string(2) | Pasport seriyasi (AA) |
| passport_number | string(7) | Pasport raqami |
| passport_pin | string(14) | JSHSHIR |
| passport_given_date | date | Berilgan sana |
| passport_issued_date | date | Berilgan sana (muddati) |
| passport_given_by | string | Kim tomonidan berilgan |
| birthday | date | Tug'ilgan sana |
| phone | string | Asosiy telefon |
| phone_secondary | string | Qo'shimcha telefon |
| passport_file | string | Pasport faylining yo'li |
| country_id | FK → countries | Mamlakat |
| is_foreign | boolean | Xorijiy fuqaro |
| region_id | FK → regions | Region |
| area_id | FK → districts | Tuman |
| address | string | Manzil |
| gender | string | Jins (male/female) |

### 3.2 Foydalanuvchi yaratish usullari (dissertatsiya yuklashda)

**Usul 1:** To'liq ism (familiya, ism, otasining ismi)

**Usul 2:** JSHSHIR orqali
- Tizim tashqi API'ga so'rov yuboradi
- API dan: to'liq ism, jins, tug'ilgan sana, fuqarolik qaytadi
- Foydalanuvchi avtomatik yaratiladi

**Usul 3:** Pasport ma'lumotlari orqali
- passport_series (2 harf) + passport_number (7 raqam) + birth_date
- Tizim tashqi API'ga so'rov yuboradi
- Ma'lumotlar avtomatik to'ldiriladi

### 3.3 Integratsiya

Pasport ma'lumotlari Ichki Ishlar Vazirligi passport tizimi orqali tekshiriladi.

---

# 4. Autentifikatsiya

## 4.1 OneID integratsiyasi

Tizimga kirish OneID orqali amalga oshiriladi.

Boshlanish bosqichida login va parol orqali kirish ham mavjud.

## 4.2 JWT token

- Access token: 120 daqiqa
- Refresh token: 7 kun

---

# 5. HR tizimi bilan integratsiya

Tizim hr.adliya.uz bilan integratsiya qilinadi.

Maqsad:
- Adliya xodimlarini avtomatik aniqlash
- tizimdan foydalanish huquqini tekshirish

Boshlanishida foydalanuvchilar administrator tomonidan yaratiladi.

---

# 6. Kataloglar — YANGI TALABLAR

## 6.1 Mamlakatlar (Countries) — YANGI

```
countries
  id            integer PK
  name_uz       varchar(255)   -- O'zbekcha nom
  name_ru       varchar(255)   -- Ruscha nom
  name_en       varchar(255)   -- Inglizcha nom
  code          varchar(10)    -- ISO kod (UZ, RU, EN...)
  created_at    timestamp
  updated_at    timestamp
```

**Standart qiymat:** O'zbekiston (id=1)

## 6.2 Universitetlar (Universities) — KENGAYTIRILDI

```
universities
  id            integer PK
  name_uz       varchar(255)   -- O'zbekcha nom
  name_ru       varchar(255)   -- Ruscha nom
  name_en       varchar(255)   -- Inglizcha nom
  short_name    varchar(64)    -- Qisqa nom
  country_id    FK → countries
  region_id     FK → regions
  created_at    timestamp
  updated_at    timestamp
```

**Standart qiymat:** Toshkent Davlat Yuridik Universiteti

## 6.3 Ilmiy yo'nalishlar (Scientific Directions) — KENGAYTIRILDI

```
scientific_directions
  id            integer PK
  name_uz       varchar(255)   -- O'zbekcha nom
  name_ru       varchar(255)   -- Ruscha nom
  name_en       varchar(255)   -- Inglizcha nom
  code          varchar(20)    -- Klasifikatsiya kodi
  description   text
  created_at    timestamp
  updated_at    timestamp
```

## 6.4 Regionlar (Regions) — KENGAYTIRILDI

```
regions
  id            integer PK
  name_uz       varchar(120)   -- O'zbekcha nom
  name_ru       varchar(120)   -- Ruscha nom
  name_en       varchar(120)   -- Inglizcha nom
  country_id    FK → countries
  created_at    timestamp
  updated_at    timestamp
```

## 6.5 Tumanlar (Districts) — KENGAYTIRILDI

```
districts
  id            integer PK
  name_uz       varchar(120)
  name_ru       varchar(120)
  name_en       varchar(120)
  region_id     FK → regions
  created_at    timestamp
  updated_at    timestamp
```

---

# 7. Dissertatsiya ma'lumotlari — KENGAYTIRILDI

```
dissertations
  id                       integer PK
  title                    varchar(500)
  scientific_direction_id  FK → scientific_directions
  university_id            FK → universities
  author_id                FK → users
  supervisor_id            FK → users (nullable)
  region_id                FK → regions (nullable)
  country_id               FK → countries (default: O'zbekiston)
  problem                  text
  proposal                 text
  annotation               text
  conclusion               text
  keywords                 JSON[]      -- tag massivi
  defense_date             date
  category                 varchar(80)
  expert_rating            float
  visibility               varchar(20)
  status                   enum(draft, pending, approved, rejected, defended)
  created_at               timestamp
  updated_at               timestamp
```

---

# 8. Dissertatsiya yuklash moduli — WIZARD INTERFEYSI

Dissertatsiya yuklash formasi 6 bosqichli wizard ko'rinishida bo'ladi.

## 8.1 Bosqich 1 — Asosiy ma'lumotlar

- Dissertatsiya nomi
- Ilmiy yo'nalish (select, autocomplete)
- Universitet (select, default: TDYU)
- Mamlakat (select, default: O'zbekiston)
- Region
- Himoya sanasi

## 8.2 Bosqich 2 — Ilmiy tasnif

- Muammo (text area)
- Taklif (text area)

## 8.3 Bosqich 3 — Kalit so'zlar va annotatsiya

- Kalit so'zlar (tag input — autocomplete bilan)
- Annotatsiya
- Xulosa

## 8.4 Bosqich 4 — Muallif ma'lumotlari

- Muallifni tizimdan tanlash yoki yangi yaratish
- Yaratish usullari: to'liq ism / JSHSHIR / pasport
- Ilmiy rahbarne tanlash

## 8.5 Bosqich 5 — Fayl yuklash

- Autoreferat (PDF, DOCX)
- Dissertatsiya (PDF, DOCX)
- Qo'shimcha hujjatlar (PDF, DOCX, TXT)
- Fayl yuklanishi: storage → matn ajratish → ES indeks → AI tahlil

## 8.6 Bosqich 6 — Tasdiqlash

- Barcha ma'lumotlar ko'rinishi
- Yuborish tugmasi

---

# 9. Kalit so'zlar (Keywords) tizimi

Kalit so'zlar tag komponentlari shaklida kiritiladi.

Xususiyatlar:
- Autocomplete (mavjud kalit so'zlardan)
- Enter yoki vergul bilan yangi tag qo'shish
- X bilan tag o'chirish
- AI qidiruvda indekslangan
- PostgreSQL JSON array formatida saqlanadi

---

# 10. Fayl yuklash tizimi

## 10.1 Qo'llab-quvvatlanadigan formatlar

- PDF
- DOCX
- TXT

## 10.2 Qayta ishlash pipelinesi

```
Yuklash
  → MinIO / Lokal storage
  → Matn ajratish (PDF: PyMuPDF, DOCX: python-docx, TXT: to'g'ridan)
  → ElasticSearch indekslash
  → AI tahlil (RAG)
```

## 10.3 Fayl turlari

| Tur kodi | Nom | Tavsif |
|---|---|---|
| autoreferat | Autoreferat | Dissertatsiyaning qisqacha bayoni |
| dissertation_pdf | Dissertatsiya (PDF) | To'liq dissertatsiya |
| dissertation_word | Dissertatsiya (DOCX) | Word formatdagi dissertatsiya |
| additional | Qo'shimcha | Boshqa hujjatlar |

---

# 11. Filtrlash tizimi

Quyidagi parametrlar bo'yicha filtrlash:

- ilmiy yo'nalish
- universitet
- mamlakat
- dissertatsiya muallifi
- dissertatsiya rahbari
- yil
- status
- kalit so'zlar
- region

---

# 12. Qidiruv tizimi

ElasticSearch asosida:

- full text search
- context based search
- synonym search
- typo tolerant search

Qidiruv maydonlari:
- dissertatsiya nomi
- muammo
- taklif
- annotatsiya
- xulosa
- kalit so'zlar

---

# 13. AI qidiruv va savol-javob — KENGAYTIRILDI

## 13.1 Texnologiya

RAG (Retrieval Augmented Generation) — LLM + ElasticSearch

## 13.2 AI imkoniyatlari

- O'xshash dissertatsiyalarni topish
- Ilmiy bo'shliqlarni aniqlash
- Kalit so'zlarni tahlil qilish
- Ilmiy yo'nalishlar o'rtasida o'zaro bog'liqlikni aniqlash
- Kontekstli javob berish

## 13.3 AI interfeysi

Chat uslubida interfeys (ChatGPT kabi):
- Xabarlar oqimi
- Input maydoni
- Tavsiya qilingan savollar
- Manba havolalari (dissertatsiya linklariga)

---

# 14. Ko'p tilli tizim (i18n)

## 14.1 Qo'llab-quvvatlanadigan tillar

| Kod | Til | Standart |
|---|---|---|
| uz | O'zbek | Ha (standart) |
| ru | Rus | Yo'q |
| en | Ingliz | Yo'q |

## 14.2 Til saqlash

- localStorage da saqlash
- Cookie orqali backend ga uzatish
- Accept-Language header

## 14.3 Tarjima fayllari

```
front/src/locales/
  uz.json   -- O'zbek tarjimalari
  ru.json   -- Rus tarjimalari
  en.json   -- Ingliz tarjimalari
```

## 14.4 Katalog maydonlari

Barcha katalog jadvallarida:
- name_uz — O'zbekcha nom
- name_ru — Ruscha nom
- name_en — Inglizcha nom

---

# 15. UI / UX talablar — KENGAYTIRILDI

## 15.1 Dizayn printsiplari

macOS va iOS Human Interface Guidelines asosida minimalistik dizayn.
Glass UI uslubi (backdrop-blur, transparent background, rounded corners).

## 15.2 Layout

```
┌──────────────────────────────────────────────┐
│ Header (logo, til tanlash, dark mode, profil) │
├──────────────┬───────────────────────────────┤
│ Sidebar      │ Main Content                  │
│ (collapsible)│                               │
│              │                               │
├──────────────┴───────────────────────────────┤
│ Footer                                       │
└──────────────────────────────────────────────┘
```

## 15.3 Ranglar

| Nom | Qiymat |
|---|---|
| Primary | #4A90E2 |
| Background | #F5F7FA |
| Surface | #FFFFFF |
| Border | #E5E7EB |
| Text | #1F2933 |
| Success | #34C759 |
| Warning | #FF9500 |
| Error | #FF3B30 |

## 15.4 Tipografiya

- Headings: Noto Sans Mono
- Body: IBM Plex Serif / Inter / Roboto
- Title: 22–24px
- Subtitle: 18px
- Body: 14–16px

## 15.5 UI komponentlar

- Button, Input, Select, Checkbox, Radio
- Modal, Dropdown, Tabs
- Table (sorting, filtering, pagination, status)
- Card (glass style)
- Notification, Toast
- TagInput (kalit so'zlar uchun)
- FileUpload (drag & drop)
- StepWizard (dissertatsiya yuklash)
- AuthorSelect (muallif tanlash)

## 15.6 Animatsiya

- transition: 200–300ms ease-out
- slide, blur, word-by-word reveal

## 15.7 Dark mode

Tizim dark mode qo'llab-quvvatlaydi.
Switch header da joylashgan.

## 15.8 Mobil UI

- Responsive sidebar (collapsible)
- Mobile optimized forms
- Mobile search
- AI assistant chat
- Breakpoints: sm, md, lg, xl, 2xl

---

# 16. Dissertatsiya ko'rish sahifasi — YANGI

Dissertatsiya tafsilotlari sahifasi quyidagilarni o'z ichiga oladi:

- Dissertatsiya asosiy ma'lumotlari
- Muallif ma'lumotlari
- Ilmiy yo'nalish va universitet
- Kalit so'zlar (tag ko'rinishida)
- Annotatsiya va xulosa
- Fayl kartalari (collapsible)

### Fayl kartalari

```
┌─────────────────────────────┐
│ 📄 Autoreferat              │
│ [Preview] [Yuklab olish ↓]  │
└─────────────────────────────┘
┌─────────────────────────────┐
│ 📄 Dissertatsiya (PDF)      │
│ [Preview] [Yuklab olish ↓]  │
└─────────────────────────────┘
┌─────────────────────────────┐
│ 📄 Qo'shimcha hujjatlar     │
│ [Preview] [Yuklab olish ↓]  │
└─────────────────────────────┘
```

---

# 17. STACK (Texnologiyalar)

## Backend

| Texnologiya | Versiya | Maqsad |
|---|---|---|
| Python | 3.11+ | Asosiy til |
| FastAPI | 0.110+ | REST API |
| SQLAlchemy | 2.0+ | ORM |
| PostgreSQL | 16 | Asosiy DB |
| ElasticSearch | 8.13 | Qidiruv |
| Redis | 7 | Cache |
| Alembic | — | Migratsiyalar |
| PyMuPDF | — | PDF matn ajratish |
| python-docx | — | DOCX matn ajratish |
| Pydantic | v2 | Validatsiya |

## Frontend

| Texnologiya | Versiya | Maqsad |
|---|---|---|
| Next.js | 14+ | Framework |
| TypeScript | 5+ | Til |
| TailwindCSS | 3+ | Stil |
| Shadcn UI | — | UI komponentlar |
| Zustand | — | State management |
| TanStack Query | — | Data fetching |
| Lucide | — | Ikonkalar |
| next-i18next | — | Ko'p tilli qo'llab-quvvatlash |

## AI

LLM + RAG (Llama / Mistral / OpenAI)

## Infra

- Docker + Docker Swarm
- NGINX Proxy Manager
- Portainer

---

# 18. API Endpointlar (umumiy ro'yxat)

## Auth
```
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/oneid
GET    /api/v1/auth/oneid/callback
```

## Kataloglar
```
GET/POST         /api/v1/catalogs/countries
GET/PUT/DELETE   /api/v1/catalogs/countries/{id}
GET/POST         /api/v1/catalogs/scientific-directions
GET/PUT/DELETE   /api/v1/catalogs/scientific-directions/{id}
GET/POST         /api/v1/catalogs/universities
GET/PUT/DELETE   /api/v1/catalogs/universities/{id}
GET/POST         /api/v1/catalogs/regions
GET/PUT/DELETE   /api/v1/catalogs/regions/{id}
GET/POST         /api/v1/catalogs/districts
GET/PUT/DELETE   /api/v1/catalogs/districts/{id}
```

## Foydalanuvchilar
```
GET              /api/v1/users
GET/PUT/DELETE   /api/v1/users/{id}
POST             /api/v1/users/create-by-name
POST             /api/v1/users/create-by-pin
POST             /api/v1/users/create-by-passport
```

## Dissertatsiyalar
```
GET/POST         /api/v1/dissertations
GET/PUT/DELETE   /api/v1/dissertations/{id}
POST             /api/v1/dissertations/{id}/upload
GET              /api/v1/dissertations/{id}/files
GET              /api/v1/dissertations/{id}/files/{file_type}
DELETE           /api/v1/dissertations/{id}/files/{file_type}
```

## Qidiruv va AI
```
GET              /api/v1/search?q=...
POST             /api/v1/ai/chat
POST             /api/v1/ai/similar
POST             /api/v1/ai/gaps
```

---

# 19. Arxitektura

Tizim microservice arxitekturasi asosida quriladi.

```
                    ┌─────────────────┐
                    │   NGINX Proxy   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
         ┌────▼───┐    ┌─────▼──┐    ┌─────▼──┐
         │Frontend│    │Backend │    │  Docs  │
         │Next.js │    │FastAPI │    │        │
         └────────┘    └────┬───┘    └────────┘
                            │
          ┌─────────────────┼──────────────────┐
          │                 │                  │
     ┌────▼────┐    ┌───────▼──┐    ┌──────────▼──┐
     │Postgres │    │  Redis   │    │ElasticSearch│
     └─────────┘    └──────────┘    └─────────────┘
                            │
          ┌─────────────────┼──────────────────┐
          │                 │                  │
     ┌────▼─────┐   ┌───────▼──┐   ┌───────────▼──┐
     │AI Service│   │  Search  │   │ Integration  │
     │LLM + RAG │   │ Service  │   │   Service    │
     └──────────┘   └──────────┘   └──────────────┘
```

---

# 20. O'zgarishlar tarixi

| Versiya | Sana | O'zgarish |
|---|---|---|
| 1.0 | 2024 | Boshlang'ich TZ |
| 2.0 | 2026-03-11 | Kengaytirildi: i18n, Country, wizard, tag input, fayl upload, AI chat, mobil UI |
