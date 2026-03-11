# Ma'lumotlar Modeli

## Entity-Relationship Diagrammasi

```
roles ──────── users ──────────── user_profiles
  1:N            │ 1:N
                 │
         dissertations ─── dissertation_documents
              │
        ┌─────┴──────┬──────┬──────────┐
        │            │      │          │
scientific_directions  universities  regions ── districts
```

---

## Jadvallar

### `roles`
| Ustun | Tur | Tavsif |
|-------|-----|--------|
| id | INTEGER PK | |
| name | ENUM | admin/moderator/doctorant/supervisor/employee |
| description | VARCHAR(255) | Rol tavsifi |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### `users`
| Ustun | Tur | Tavsif |
|-------|-----|--------|
| id | INTEGER PK | |
| username | VARCHAR(80) UNIQUE | Login |
| email | VARCHAR(120) UNIQUE | Email |
| password_hash | VARCHAR(255) | Bcrypt hash |
| is_active | BOOLEAN | Faol/nofaol |
| role_id | FK → roles.id | Rol |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### `user_profiles`
| Ustun | Tur | Tavsif |
|-------|-----|--------|
| id | INTEGER PK | |
| user_id | FK → users.id UNIQUE | |
| last_name | VARCHAR(100) | Familiya |
| first_name | VARCHAR(100) | Ism |
| middle_name | VARCHAR(100) | Otasining ismi |
| passport_seria | VARCHAR(10) | Pasport seriyasi |
| passport_number | VARCHAR(20) | Pasport raqami |
| passport_pin | VARCHAR(20) | PINFL |
| passport_given_date | DATE | Berilgan sana |
| passport_issued_date | DATE | Muddati |
| passport_given_by | VARCHAR(255) | Kim tomonidan berilgan |
| birthday | DATE | Tug'ilgan kun |
| phone | VARCHAR(30) | Asosiy telefon |
| phone_secondary | VARCHAR(30) | Qo'shimcha telefon |
| passport_file | VARCHAR(255) | Pasport fayli yo'li |
| country_id | INTEGER | Mamlakat ID |
| is_foreign | BOOLEAN | Xorijiy fuqaro |
| region_id | FK → regions.id | Region |
| area_id | FK → districts.id | Tuman |
| address | VARCHAR(255) | Manzil |
| gender | VARCHAR(20) | Jinsi |

### `scientific_directions`
| Ustun | Tur | Tavsif |
|-------|-----|--------|
| id | INTEGER PK | |
| name | VARCHAR(255) UNIQUE | Yo'nalish nomi |
| description | TEXT | Tavsif |

**Standart ma'lumotlar:** Constitutional Law, Civil Law, Criminal Law

### `universities`
| Ustun | Tur | Tavsif |
|-------|-----|--------|
| id | INTEGER PK | |
| name | VARCHAR(255) UNIQUE | To'liq nom |
| short_name | VARCHAR(64) | Qisqa nom |

**Standart ma'lumotlar:** TSUL, NUUz

### `regions`
| Ustun | Tur | Tavsif |
|-------|-----|--------|
| id | INTEGER PK | |
| name | VARCHAR(120) UNIQUE | Region nomi |

### `districts`
| Ustun | Tur | Tavsif |
|-------|-----|--------|
| id | INTEGER PK | |
| name | VARCHAR(120) | Tuman nomi |
| region_id | FK → regions.id | Region |

### `dissertations`
| Ustun | Tur | Tavsif |
|-------|-----|--------|
| id | INTEGER PK | |
| title | VARCHAR(500) | Sarlavha |
| scientific_direction_id | FK | Ilmiy yo'nalish |
| university_id | FK | Universitet |
| author_id | FK → users.id | Muallif |
| supervisor_id | FK → users.id NULLABLE | Ilmiy rahbar |
| region_id | FK → regions.id NULLABLE | Region |
| problem | TEXT | Dissertatsiya muammosi |
| proposal | TEXT | Dissertatsiya taklifi |
| annotation | TEXT | Annotatsiya |
| conclusion | TEXT | Xulosa |
| keywords | JSON | Kalit so'zlar ro'yxati |
| defense_date | DATE NULLABLE | Himoya sanasi |
| category | VARCHAR(80) | Kategoriya |
| expert_rating | FLOAT | Ekspert reytingi (0–100) |
| visibility | VARCHAR(20) | internal/public |
| status | ENUM | Holat |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### `dissertation_documents`
| Ustun | Tur | Tavsif |
|-------|-----|--------|
| id | INTEGER PK | |
| dissertation_id | FK UNIQUE | |
| autoreferat_text | TEXT | Avtoreferat matni |
| autoreferat_file_path | VARCHAR(500) | Avtoreferat fayli yo'li |
| autoreferat_file_name | VARCHAR(255) | Original fayl nomi |
| dissertation_pdf_file_path | VARCHAR(500) | PDF yo'li |
| dissertation_pdf_file_name | VARCHAR(255) | PDF fayl nomi |
| dissertation_word_file_path | VARCHAR(500) | Word yo'li |
| dissertation_word_file_name | VARCHAR(255) | Word fayl nomi |
| dissertation_word_text | TEXT | Word matni (extract qilingan) |

---

## Dissertatsiya Statuslari

```
DRAFT → PENDING → APPROVED → DEFENDED
                ↘ REJECTED
```

| Status | Tavsif | Kim o'zgartiradi |
|--------|--------|-----------------|
| `draft` | Qoralama | Doctorant/Admin |
| `pending` | Ko'rib chiqish kutilmoqda | Doctorant/Admin |
| `approved` | Tasdiqlangan | Moderator/Admin |
| `rejected` | Rad etilgan | Moderator/Admin |
| `defended` | Himoya qilingan | Admin |

---

## Fayllarni saqlash

```
/app/storage/                    # Docker volume
  dissertations/
    {dissertation_id}/
      autoreferat_{uuid}.pdf
      dissertation_{uuid}.pdf
      dissertation_{uuid}.docx
```

Docker volum mapping: `./volumes/backend-storage:/app/storage`
