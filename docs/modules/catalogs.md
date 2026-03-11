# Katalog Modullari — Texnik Hujjat

> **Versiya:** 1.0.0
> **Yangilangan:** 2026-03-11
> **Modul:** `catalogs`
> **Marshrut:** `/api/v1/catalogs/`

---

## 1. Umumiy Ma'lumot

Katalog modullari tizimning asosiy ma'lumotnoma ma'lumotlarini boshqaradi. Barcha kataloglar ko'p tilli (O'zbek, Rus, Ingliz) qo'llab-quvvatlash bilan ta'minlangan. Ma'lumotlar CRUD operatsiyalariga ega bo'lib, ko'rish barcha foydalanuvchilarga ruxsat etilgan, o'zgartirish esa faqat ADMIN roliga ega foydalanuvchilarga.

### Ko'p Tilli Printsip

Barcha katalog jadvallari quyidagi til maydonlarini o'z ichiga oladi:
- `name_uz` — O'zbek tilida nom (standart til)
- `name_ru` — Rus tilida nom
- `name_en` — Ingliz tilida nom

Frontend tomonidan joriy til sozlamasiga qarab tegishli maydon ko'rsatiladi.

---

## 2. Countries — Mamlakatlar Moduli

### 2.1 Database Sxemasi

**Jadval nomi:** `countries`

| Ustun | Tur | Cheklov | Tavsif |
|-------|-----|---------|---------|
| `id` | `INTEGER` | PRIMARY KEY, AUTO INCREMENT | Unikal identifikator |
| `name_uz` | `VARCHAR(255)` | NOT NULL | O'zbekcha nom |
| `name_ru` | `VARCHAR(255)` | NOT NULL | Ruscha nom |
| `name_en` | `VARCHAR(255)` | NOT NULL | Inglizcha nom |
| `code` | `VARCHAR(10)` | NOT NULL, UNIQUE | ISO 3166-1 alfa-2 kod (UZ, RU, US...) |
| `is_active` | `BOOLEAN` | DEFAULT TRUE | Faol holati |
| `created_at` | `TIMESTAMP` | DEFAULT NOW() | Yaratilgan vaqt |
| `updated_at` | `TIMESTAMP` | ON UPDATE | Yangilangan vaqt |

**SQLAlchemy Model:**
```python
class Country(Base):
    __tablename__ = "countries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name_uz: Mapped[str] = mapped_column(String(255), nullable=False)
    name_ru: Mapped[str] = mapped_column(String(255), nullable=False)
    name_en: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(10), unique=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, onupdate=func.now())

    # Relationships
    universities: Mapped[list["University"]] = relationship(back_populates="country")
    regions: Mapped[list["Region"]] = relationship(back_populates="country")
```

### 2.2 API Endpointlar

**Bazaviy URL:** `/api/v1/catalogs/countries`

| Method | Endpoint | Tavsif | Ruxsat |
|--------|----------|---------|--------|
| `GET` | `/api/v1/catalogs/countries` | Barcha mamlakatlar ro'yxati | Barchasi |
| `GET` | `/api/v1/catalogs/countries/{id}` | Bitta mamlakat | Barchasi |
| `POST` | `/api/v1/catalogs/countries` | Yangi mamlakat yaratish | ADMIN |
| `PUT` | `/api/v1/catalogs/countries/{id}` | Mamlakat yangilash | ADMIN |
| `DELETE` | `/api/v1/catalogs/countries/{id}` | Mamlakat o'chirish | ADMIN |

**GET so'rov parametrlari:**
```
GET /api/v1/catalogs/countries?search=uzbek&page=1&per_page=20&is_active=true
```

| Parametr | Tur | Standart | Tavsif |
|----------|-----|---------|---------|
| `search` | `string` | — | Nom bo'yicha qidiruv |
| `page` | `integer` | 1 | Sahifa raqami |
| `per_page` | `integer` | 20 | Sahifadagi elementlar soni |
| `is_active` | `boolean` | — | Faollik filtri |

**POST/PUT so'rov tanasi (JSON):**
```json
{
  "name_uz": "O'zbekiston",
  "name_ru": "Узбекистан",
  "name_en": "Uzbekistan",
  "code": "UZ",
  "is_active": true
}
```

**Javob formati:**
```json
{
  "id": 1,
  "name_uz": "O'zbekiston",
  "name_ru": "Узбекистан",
  "name_en": "Uzbekistan",
  "code": "UZ",
  "is_active": true,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": null
}
```

### 2.3 Frontend Sahifasi

**Marshrut:** `/dashboard/catalogs/countries`

**Komponentlar:**
- Jadval (DataTable) — barcha mamlakatlar ro'yxati
- Qidiruv paneli — nom va kod bo'yicha filtrlash
- Yaratish modali — yangi mamlakat qo'shish formasi
- Tahrirlash modali — mavjud ma'lumotni o'zgartirish
- O'chirish tasdiqlash dialogi

**Ruxsatlar:**
- ADMIN emas foydalanuvchilar: Yaratish/Tahrirlash/O'chirish tugmalari yashiriladi
- ADMIN: Barcha amallar mavjud

### 2.4 Validatsiya Qoidalari

| Maydon | Qoida | Xato xabari |
|--------|-------|-------------|
| `name_uz` | 2-255 belgi, bo'sh bo'lmasin | "O'zbekcha nom kiritilishi shart" |
| `name_ru` | 2-255 belgi, bo'sh bo'lmasin | "Ruscha nom kiritilishi shart" |
| `name_en` | 2-255 belgi, bo'sh bo'lmasin | "Inglizcha nom kiritilishi shart" |
| `code` | 2-10 belgi, UPPERCASE, unikal | "Kod band yoki noto'g'ri formatda" |

---

## 3. Universities — Universitetlar Moduli

### 3.1 Database Sxemasi

**Jadval nomi:** `universities`

| Ustun | Tur | Cheklov | Tavsif |
|-------|-----|---------|---------|
| `id` | `INTEGER` | PRIMARY KEY, AUTO INCREMENT | Unikal identifikator |
| `name_uz` | `VARCHAR(500)` | NOT NULL | O'zbekcha to'liq nom |
| `name_ru` | `VARCHAR(500)` | NOT NULL | Ruscha to'liq nom |
| `name_en` | `VARCHAR(500)` | NOT NULL | Inglizcha to'liq nom |
| `short_name` | `VARCHAR(50)` | NULLABLE | Qisqartma nom (TDYU, NUUz...) |
| `country_id` | `INTEGER` | FK → countries.id | Mamlakat bog'liqligi |
| `region_id` | `INTEGER` | FK → regions.id, NULLABLE | Region bog'liqligi |
| `is_active` | `BOOLEAN` | DEFAULT TRUE | Faol holati |
| `created_at` | `TIMESTAMP` | DEFAULT NOW() | Yaratilgan vaqt |
| `updated_at` | `TIMESTAMP` | ON UPDATE | Yangilangan vaqt |

### 3.2 Standart Qiymat

Wizard da universitet maydonining standart qiymati:

```
Toshkent Davlat Yuridik Universiteti (TDYU)
```

Bu Adliya vazirligi tizimining asosiy universiteti sifatida belgilangan. Wizard ochilganda `university_id` maydoni TDYU ID si bilan oldindan to'ldiriladi.

### 3.3 API Endpointlar

**Bazaviy URL:** `/api/v1/catalogs/universities`

| Method | Endpoint | Tavsif | Ruxsat |
|--------|----------|---------|--------|
| `GET` | `/api/v1/catalogs/universities` | Ro'yxat (filter: country_id, region_id) | Barchasi |
| `GET` | `/api/v1/catalogs/universities/{id}` | Bitta universitet | Barchasi |
| `POST` | `/api/v1/catalogs/universities` | Yangi universitet | ADMIN |
| `PUT` | `/api/v1/catalogs/universities/{id}` | Yangilash | ADMIN |
| `DELETE` | `/api/v1/catalogs/universities/{id}` | O'chirish | ADMIN |

**GET so'rov parametrlari:**
```
GET /api/v1/catalogs/universities?country_id=1&region_id=5&search=toshkent
```

**POST/PUT so'rov tanasi:**
```json
{
  "name_uz": "Toshkent Davlat Yuridik Universiteti",
  "name_ru": "Ташкентский Государственный Юридический Университет",
  "name_en": "Tashkent State University of Law",
  "short_name": "TDYU",
  "country_id": 1,
  "region_id": 1,
  "is_active": true
}
```

### 3.4 Frontend Sahifasi

**Marshrut:** `/dashboard/catalogs/universities`

**Qo'shimcha xususiyatlar:**
- Mamlakat va region bo'yicha filtrlash
- Kaskad select: Mamlakat → Region → Universitet

---

## 4. ScientificDirections — Ilmiy Yo'nalishlar Moduli

### 4.1 Database Sxemasi

**Jadval nomi:** `scientific_directions`

| Ustun | Tur | Cheklov | Tavsif |
|-------|-----|---------|---------|
| `id` | `INTEGER` | PRIMARY KEY, AUTO INCREMENT | Unikal identifikator |
| `name_uz` | `VARCHAR(500)` | NOT NULL | O'zbekcha nom |
| `name_ru` | `VARCHAR(500)` | NOT NULL | Ruscha nom |
| `name_en` | `VARCHAR(500)` | NOT NULL | Inglizcha nom |
| `code` | `VARCHAR(20)` | NOT NULL, UNIQUE | Yo'nalish kodi (12.00.01) |
| `description` | `TEXT` | NULLABLE | To'liq tavsif |
| `parent_id` | `INTEGER` | FK → self, NULLABLE | Ota yo'nalish (ierarxiya) |
| `is_active` | `BOOLEAN` | DEFAULT TRUE | Faol holati |
| `created_at` | `TIMESTAMP` | DEFAULT NOW() | Yaratilgan vaqt |
| `updated_at` | `TIMESTAMP` | ON UPDATE | Yangilangan vaqt |

### 4.2 Yo'nalish Kodi Formati

Ilmiy yo'nalish kodlari O'zbekiston ilmiy klassifikatsiyasiga mos:

```
12.00.01 — Davlat va huquq nazariyasi va tarixi
12.00.02 — Konstitutsiyaviy huquq
12.00.03 — Fuqarolik huquqi
...
```

### 4.3 API Endpointlar

**Bazaviy URL:** `/api/v1/catalogs/scientific-directions`

| Method | Endpoint | Tavsif | Ruxsat |
|--------|----------|---------|--------|
| `GET` | `/api/v1/catalogs/scientific-directions` | Ro'yxat | Barchasi |
| `GET` | `/api/v1/catalogs/scientific-directions/{id}` | Bitta | Barchasi |
| `GET` | `/api/v1/catalogs/scientific-directions/tree` | Ierarxik daraxt | Barchasi |
| `POST` | `/api/v1/catalogs/scientific-directions` | Yaratish | ADMIN |
| `PUT` | `/api/v1/catalogs/scientific-directions/{id}` | Yangilash | ADMIN |
| `DELETE` | `/api/v1/catalogs/scientific-directions/{id}` | O'chirish | ADMIN |

**POST/PUT so'rov tanasi:**
```json
{
  "name_uz": "Davlat va huquq nazariyasi va tarixi",
  "name_ru": "Теория и история государства и права",
  "name_en": "Theory and History of State and Law",
  "code": "12.00.01",
  "description": "Davlat va huquqning nazariy va tarixiy masalalarini o'rganadi",
  "parent_id": null,
  "is_active": true
}
```

### 4.4 Frontend Sahifasi

**Marshrut:** `/dashboard/catalogs/scientific-directions`

**Xususiyatlar:**
- Daraxt ko'rinishida (tree view) ko'rsatish
- Ierarxik select component wizard da
- Kod bo'yicha qidiruv va filtrlash

---

## 5. Regions — Regionlar Moduli

### 5.1 Database Sxemasi

**Jadval nomi:** `regions`

| Ustun | Tur | Cheklov | Tavsif |
|-------|-----|---------|---------|
| `id` | `INTEGER` | PRIMARY KEY, AUTO INCREMENT | Unikal identifikator |
| `name_uz` | `VARCHAR(255)` | NOT NULL | O'zbekcha nom |
| `name_ru` | `VARCHAR(255)` | NOT NULL | Ruscha nom |
| `name_en` | `VARCHAR(255)` | NOT NULL | Inglizcha nom |
| `country_id` | `INTEGER` | FK → countries.id, NOT NULL | Mamlakat bog'liqligi |
| `is_active` | `BOOLEAN` | DEFAULT TRUE | Faol holati |
| `created_at` | `TIMESTAMP` | DEFAULT NOW() | Yaratilgan vaqt |
| `updated_at` | `TIMESTAMP` | ON UPDATE | Yangilangan vaqt |

### 5.2 O'zbekiston Regionlari (Standart Ma'lumot)

```
1.  Toshkent shahri
2.  Toshkent viloyati
3.  Andijon viloyati
4.  Farg'ona viloyati
5.  Namangan viloyati
6.  Samarqand viloyati
7.  Buxoro viloyati
8.  Navoiy viloyati
9.  Qashqadaryo viloyati
10. Surxondaryo viloyati
11. Sirdaryo viloyati
12. Jizzax viloyati
13. Xorazm viloyati
14. Qoraqalpog'iston Respublikasi
```

### 5.3 API Endpointlar

**Bazaviy URL:** `/api/v1/catalogs/regions`

| Method | Endpoint | Tavsif | Ruxsat |
|--------|----------|---------|--------|
| `GET` | `/api/v1/catalogs/regions` | Ro'yxat (filter: country_id) | Barchasi |
| `GET` | `/api/v1/catalogs/regions/{id}` | Bitta region | Barchasi |
| `POST` | `/api/v1/catalogs/regions` | Yaratish | ADMIN |
| `PUT` | `/api/v1/catalogs/regions/{id}` | Yangilash | ADMIN |
| `DELETE` | `/api/v1/catalogs/regions/{id}` | O'chirish | ADMIN |

**GET so'rov parametrlari:**
```
GET /api/v1/catalogs/regions?country_id=1&search=toshkent
```

**POST/PUT so'rov tanasi:**
```json
{
  "name_uz": "Toshkent shahri",
  "name_ru": "Город Ташкент",
  "name_en": "Tashkent City",
  "country_id": 1,
  "is_active": true
}
```

### 5.4 Frontend Sahifasi

**Marshrut:** `/dashboard/catalogs/regions`

**Xususiyatlar:**
- Mamlakat bo'yicha filtrlash
- Kaskad bog'liqlik: Mamlakat tanlanganda region ro'yxati yangilanadi

---

## 6. Ko'p Tilli Qo'llab-Quvvatlash (i18n)

### 6.1 Barcha Kataloglarda Umumiy Printsip

Barcha katalog jadvallari uchun i18n qo'llab-quvvatlash uchta til maydoni orqali ta'minlanadi:

```python
# Pydantic schema misoli
class CatalogBaseSchema(BaseModel):
    name_uz: str = Field(..., min_length=2, max_length=500)
    name_ru: str = Field(..., min_length=2, max_length=500)
    name_en: str = Field(..., min_length=2, max_length=500)
```

### 6.2 Frontend Da Til Tanlash

```typescript
// Katalog nomini joriy tilda ko'rsatish
function getLocalizedName(item: CatalogItem, lang: string): string {
  switch (lang) {
    case 'ru': return item.name_ru;
    case 'en': return item.name_en;
    default:   return item.name_uz;
  }
}
```

### 6.3 Forma Interfeysi

Katalog qo'shish/tahrirlash formalarida barcha uch til uchun alohida maydon ko'rsatiladi:

```
Nom (O'zbek tilida): [_________________________]
Nom (Rus tilida):    [_________________________]
Nom (Ingliz tilida): [_________________________]
```

### 6.4 API Javoblarida i18n

API barcha til maydonlarini qaytaradi, frontend esa joriy tilga mos maydonni ko'rsatadi:

```json
{
  "id": 1,
  "name_uz": "O'zbekiston",
  "name_ru": "Узбекистан",
  "name_en": "Uzbekistan",
  "code": "UZ"
}
```

---

## 7. Kesh Strategiyasi

Katalog ma'lumotlari kam o'zgaradigan statik ma'lumotlar bo'lgani uchun Redis keshida saqlanadi:

| Kalit | TTL | Tavsif |
|-------|-----|---------|
| `catalog:countries:all` | 1 soat | Barcha mamlakatlar |
| `catalog:universities:all` | 1 soat | Barcha universitetlar |
| `catalog:regions:country:{id}` | 1 soat | Mamlakat bo'yicha regionlar |
| `catalog:directions:all` | 2 soat | Barcha yo'nalishlar |

ADMIN tomonidan ma'lumot o'zgartirilganda tegishli kesh invalidatsiya qilinadi.

---

## 8. Xatolarni Boshqarish

| HTTP Kodi | Holat | Misol |
|-----------|-------|-------|
| `200 OK` | Muvaffaqiyatli | Ma'lumot qaytarildi |
| `201 Created` | Yaratildi | Yangi yozuv saqlandi |
| `400 Bad Request` | Noto'g'ri so'rov | Validatsiya xatosi |
| `401 Unauthorized` | Autentifikatsiya kerak | Token yo'q |
| `403 Forbidden` | Ruxsat yo'q | ADMIN emas |
| `404 Not Found` | Topilmadi | ID mavjud emas |
| `409 Conflict` | Ziddiyat | Kod allaqachon band |
| `500 Internal Error` | Server xatosi | DB ulanish xatosi |

---

*Hujjat versiyasi: 1.0.0. So'nggi o'zgarishlar uchun Git tarixini tekshiring.*
