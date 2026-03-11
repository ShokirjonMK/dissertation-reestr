# Backend API Reference

Base URL: `http://localhost:8000/api/v1`

Swagger UI: `http://localhost:8000/docs`

---

## Autentifikatsiya

Barcha himoyalangan endpointlar `Authorization: Bearer <token>` headerini talab qiladi.

### POST /auth/login
Login va JWT token olish.

**Request:**
```json
{
  "username": "admin",
  "password": "admin12345"
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

### GET /auth/me
Joriy foydalanuvchi ma'lumotlari.

### GET /auth/oneid/login
OneID OAuth boshlanish URL manzili.

### GET /auth/oneid/callback
OneID OAuth callback handler.

---

## Dissertatsiyalar

### GET /dissertations/
Barcha dissertatsiyalar ro'yxati.

**Filtrlash parametrlari:**

| Parametr | Tur | Tavsif |
|----------|-----|--------|
| `scientific_direction_id` | int | Ilmiy yo'nalish ID |
| `university_id` | int | Universitet ID |
| `author_id` | int | Muallif ID |
| `supervisor_id` | int | Rahbar ID |
| `year` | int | Himoya yili |
| `status` | string | draft/pending/approved/rejected/defended |
| `query` | string | Umumiy qidiruv matni |
| `title` | string | Sarlavha bo'yicha |
| `problem` | string | Muammo bo'yicha |
| `proposal` | string | Taklif bo'yicha |
| `annotation` | string | Annotatsiya bo'yicha |
| `conclusion` | string | Xulosa bo'yicha |
| `keywords` | string | Kalit so'z |
| `author` | string | Muallif ismi |
| `supervisor` | string | Rahbar ismi |
| `category` | string | Kategoriya |
| `expert_rating_min` | float | Minimal ekspert reytingi |
| `region_id` | int | Region ID |
| `visibility` | string | internal/public |

### POST /dissertations/
JSON formatda dissertatsiya yaratish.

**Ruxsat:** Admin, Doctorant

```json
{
  "title": "Dissertatsiya nomi",
  "scientific_direction_id": 1,
  "university_id": 1,
  "supervisor_id": 2,
  "region_id": 1,
  "problem": "Muammo tavsifi",
  "proposal": "Taklif tavsifi",
  "annotation": "Annotatsiya",
  "conclusion": "Xulosa",
  "keywords": ["huquq", "raqamlashtirish"],
  "defense_date": "2026-06-01",
  "category": "general",
  "expert_rating": 0.0,
  "visibility": "internal",
  "status": "draft"
}
```

### POST /dissertations/submit
Fayllar bilan birga dissertatsiya yuborish (multipart/form-data).

**Ruxsat:** Admin, Doctorant

Form fields: yuqoridagi JSON maydonlar + fayllar:
- `autoreferat_text` — Avtoreferat matni
- `autoreferat_file` — Avtoreferat fayli
- `dissertation_pdf_file` — PDF fayl
- `dissertation_word_file` — Word fayl

### GET /dissertations/{id}
Bitta dissertatsiya batafsil ma'lumoti (DissertationDetailRead).

### PUT /dissertations/{id}
Dissertatsiyani yangilash.

**Ruxsat:** Admin (barchani), Doctorant (faqat o'zini)

### PATCH /dissertations/{id}/moderate?status_value=approved
Dissertatsiya holatini o'zgartirish.

**Ruxsat:** Admin, Moderator

Qabul qilinadigan: `approved` | `rejected` | `pending`

### GET /dissertations/{id}/files/{file_kind}
Fayl yuklab olish. `file_kind`: `autoreferat` | `pdf` | `word`

### DELETE /dissertations/{id}
Dissertatsiyani o'chirish.

**Ruxsat:** Admin

---

## Foydalanuvchilar

### GET /users/
Barcha foydalanuvchilar. **Ruxsat:** Admin

### POST /users/
Yangi foydalanuvchi. **Ruxsat:** Admin

```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "securepassword",
  "role_name": "doctorant"
}
```

### GET /users/{id} / PUT /users/{id} / DELETE /users/{id}
Foydalanuvchi CRUD. **Ruxsat:** Admin (barchani), foydalanuvchi (o'zini).

---

## Kataloglar (CRUD)

```
GET  POST  /catalogs/scientific-directions/
GET  PUT   DELETE  /catalogs/scientific-directions/{id}

GET  POST  /catalogs/universities/
GET  PUT   DELETE  /catalogs/universities/{id}

GET  POST  /catalogs/regions/
GET  PUT   DELETE  /catalogs/regions/{id}

GET  POST  /catalogs/districts/
GET  PUT   DELETE  /catalogs/districts/{id}
```

---

## Qidiruv va AI

### POST /search
Elasticsearch orqali to'liq matnli qidiruv.

```json
{
  "query": "raqamlashtirish",
  "filters": { "status": "approved" },
  "size": 20
}
```

### POST /ask
AI asosida savol-javob.

```json
{ "question": "Mediatsiya bo'yicha qanday tadqiqotlar bor?" }
```

---

## Sog'liq tekshiruvi

### GET /health
```json
{ "status": "ok" }
```

---

## DissertationDetailRead sxemasi

```json
{
  "id": 1,
  "title": "...",
  "status": "approved",
  "category": "general",
  "expert_rating": 86.0,
  "visibility": "internal",
  "defense_date": "2026-07-01",
  "keywords": ["mediatsiya"],
  "scientific_direction_id": 1,
  "university_id": 1,
  "author_id": 2,
  "supervisor_id": 3,
  "region_id": 1,
  "problem": "...",
  "proposal": "...",
  "annotation": "...",
  "conclusion": "...",
  "author_name": "doctorant",
  "supervisor_name": "supervisor",
  "university_name": "TSUL",
  "scientific_direction_name": "Civil Law",
  "has_autoreferat_file": true,
  "has_dissertation_pdf_file": false,
  "has_dissertation_word_file": true,
  "created_at": "2025-01-01T00:00:00",
  "updated_at": "2025-01-01T00:00:00"
}
```
