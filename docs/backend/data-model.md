# Ma'lumotlar Modeli

## Entity-Relationship Diagrammasi

```
roles ──────── users ──────────── user_profiles
  1:N            │ 1:N
                 │
         dissertations ─── dissertation_documents
              │  │  │
              │  │  ├── dissertation_problems (1:N)
              │  │  ├── dissertation_proposals (1:N, strukturalangan takliflar)
              │  │  └── implementation_proposals (1:N)
              │  │
        ┌─────┴──────┬──────┬──────────┐
        │            │      │          │
scientific_directions  universities  regions ── districts

implementation_proposals ─── proposal_status_history (1:N)
         │
       users (proposed_by, reviewed_by)

proposal_status_history ── users (changed_by)
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
| country_id | FK → countries.id NULLABLE | Mamlakat |
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

### `dissertation_problems`
Strukturalangan muammolar ro'yxati (dissertatsiya bo'yicha ko'p qator).

| Ustun | Tur | Tavsif |
|-------|-----|--------|
| id | INTEGER PK | |
| dissertation_id | FK → dissertations.id ON DELETE CASCADE | |
| order_num | INTEGER | Tartib |
| problem_text | TEXT | Matn |
| problem_category | TEXT NULL | Kategoriya |
| source_page | TEXT NULL | Sahifa / manba |
| is_auto_extracted | BOOLEAN | AI bilan to'ldirilganmi |
| created_at | DATETIME | |

### `dissertation_proposals`
Strukturalangan takliflar ro'yxati (**jadval nomi**; dissertatsiya `proposal` TEXT maydonidan mustaqil).

| Ustun | Tur | Tavsif |
|-------|-----|--------|
| id | INTEGER PK | |
| dissertation_id | FK → dissertations.id ON DELETE CASCADE | |
| order_num | INTEGER | Tartib |
| proposal_text | TEXT | Matn |
| proposal_category | TEXT NULL | |
| source_page | TEXT NULL | |
| is_auto_extracted | BOOLEAN | |
| created_at | DATETIME | |

### `implementation_proposals`
Amaliyotga joriy etish bo'yicha alohida taklif hujjati.

| Ustun | Tur | Tavsif |
|-------|-----|--------|
| id | INTEGER PK | |
| dissertation_id | FK → dissertations.id ON DELETE CASCADE | |
| proposed_by | FK → users.id | Muallif |
| reviewed_by | FK → users.id NULL | Ko'rib chiqqan |
| title | TEXT | Sarlavha |
| problem_description | TEXT | |
| proposal_text | TEXT | |
| expected_result | TEXT | |
| implementation_area, implementation_org | TEXT | |
| priority | ENUM | low, medium, high, critical |
| source_chapter, source_pages | TEXT NULL | |
| status | ENUM | draft, submitted, under_review, approved, rejected, revision_required |
| submitted_at, reviewed_at | DATETIME NULL | |
| deadline | DATE NULL | |
| reviewer_comment, revision_notes, internal_notes | TEXT NULL | |
| attachment_url | TEXT NULL | |
| created_at, updated_at | DATETIME | |

### `proposal_status_history`
| Ustun | Tur | Tavsif |
|-------|-----|--------|
| id | INTEGER PK | |
| proposal_id | FK → implementation_proposals.id ON DELETE CASCADE | |
| changed_by | FK → users.id | |
| from_status | ENUM NULL | Oldingi status |
| to_status | ENUM | Yangi status |
| comment | TEXT NULL | |
| changed_at | DATETIME | |

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
