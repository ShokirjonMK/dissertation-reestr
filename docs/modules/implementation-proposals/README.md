# Modul: Amaliyotga joriy etish takliflari (Implementation Proposals)

> **Versiya:** 1.0.0  
> **Yangilangan:** 2026-03-23  
> **Backend:** `back/app/models/implementation_proposal.py`, `back/app/api/implementation_proposals.py`, `back/app/services/implementation_proposal_service.py`  
> **API prefiks:** `/api/v1/proposals`

---

## 1. Maqsad

**Biznes oqim:** doktorant (yoki boshqa ruxsat etilgan foydalanuvchi) **muammo va yechim taklifini** yozadi; **Adliya xodimi** (`employee`) yoki moderator/admin taklifni ko‘rib chiqib **tasdiqlaydi yoki rad etadi**; shundan keyin alohida ravishda **ilmiy ish (dissertatsiya)** boshlanishi mumkin. Shu sababli taklif **dissertatsiyaga ixtiyoriy bog‘lanadi** — avval taklif, keyin `dissertation_id` ni bog‘lash yoki dissertatsiya yaratish mumkin.

**Texnik jihat:** amaliyotga joriy etish bo‘yicha takliflarni alohida hujjat sifatida yuritish: yaratish, tahrirlash, yuborish, ko‘rib chiqish, tasdiqlash, rad etish yoki qayta ishlash talabi. Har bir holat o‘zgarishi **tarix jadvaliga** yoziladi.

---

## 2. Ma'lumotlar modeli

### 2.1 `implementation_proposals`

| Maydon | Tavsif |
|--------|--------|
| `id` | PK (integer) |
| `dissertation_id` | FK → `dissertations.id` (CASCADE), **nullable** — taklif dissertatsiyadan oldin yaratilishi mumkin |
| `proposed_by` | FK → `users.id` |
| `reviewed_by` | FK → `users.id`, nullable |
| `title`, `problem_description`, `proposal_text`, `expected_result` | Matn |
| `implementation_area`, `implementation_org` | Amaliyot sohasi va tashkilot |
| `priority` | ENUM: low, medium, high, critical |
| `source_chapter`, `source_pages` | Ixtiyoriy manba |
| `status` | ENUM: draft, submitted, under_review, approved, rejected, revision_required |
| `submitted_at`, `reviewed_at`, `deadline` | Vaqt / sana |
| `reviewer_comment`, `revision_notes`, `internal_notes`, `attachment_url` | Izohlar / fayl |
| `created_at`, `updated_at` | Audit |

### 2.2 `proposal_status_history`

Har bir status o‘zgarishi: `from_status`, `to_status`, `changed_by`, `comment`, `changed_at`.

---

## 3. Status oqimi

```
draft ──submit──► submitted ──start_review──► under_review
                                                    │
                    ┌──────────────────────────────┼──────────────────────────────┐
                    ▼                              ▼                              ▼
              approved                       rejected                  revision_required
                    │                                                            │
                    └──────────────────────── (qayta yuborish) ◄───────────────┘
                              (submit, draft/revision_required dan)
```

- **Tahrirlash:** faqat `draft` yoki `revision_required`.
- **Yuborish:** `draft` yoki `revision_required` dan `submitted` ga.
- **Ko‘rib chiqish (Adliya / moderator / admin):** `under_review` dan `approved` / `rejected` / `revision_required`.

---

## 4. API (qisqa)

Barcha endpointlar JWT talab qiladi (Swagger: `/docs`).

| Usul | Yo‘l | Tavsif |
|------|------|--------|
| POST | `/proposals/` | Yaratish (doctorant, supervisor, admin, moderator, employee) |
| GET | `/proposals/my` | Joriy foydalanuvchining takliflari |
| GET | `/proposals/pending` | Yuborilganlar (employee, moderator, admin) |
| GET | `/proposals/` | Ro‘yxat (employee, moderator, admin), filtr: `status`, `dissertation_id` |
| GET | `/proposals/{id}` | Batafsil + tarix |
| PUT | `/proposals/{id}` | Yangilash (egasi yoki admin/moderator qoidalari) |
| POST | `/proposals/{id}/submit` | Yuborish |
| POST | `/proposals/{id}/start-review` | Ko‘rib chiqishni boshlash |
| POST | `/proposals/{id}/approve` | Tasdiqlash (+ ixtiyoriy `comment`) |
| POST | `/proposals/{id}/reject` | Rad (`comment` majburiy, min 10 belgi) |
| POST | `/proposals/{id}/request-revision` | Qayta ishlash (`revision_notes` majburiy) |
| POST | `/proposals/{id}/resubmit` | Qayta yuborish |

To‘liq sxemalar: [API Reference](../../backend/api-reference.md).

---

## 5. Frontend

| Marshrut | Tavsif |
|----------|--------|
| `/dashboard/proposals` | Mening takliflarim |
| `/dashboard/proposals/new` | Yangi taklif (react-hook-form + zod) |
| `/dashboard/proposals/[id]` | Tafsilot, tarix, moderatsiya tugmalari |
| `/dashboard/admin/proposals` | Kutilayotganlar / barcha ro‘yxat (moderator, admin) |

Komponentlar: `ProposalStatusBadge`, `StatusHistoryTimeline` (`front/src/components/proposals/`).

Sidebar: **Takliflar** (employee, moderator, admin), **Takliflar (admin)** (moderator, admin).

---

## 6. Migratsiya

Alembik: `back/alembic/versions/0010_add_implementation_proposals.py` (PostgreSQL ENUM + jadvallar). Loyihada `Base.metadata.create_all` ham ishlatilishi mumkin — muhit bo‘yicha bittasini tanlash tavsiya etiladi.

---

## 7. Bog‘liq hujjatlar

- [Dissertatsiya muammolari va strukturalangan takliflar](../dissertation-problems-proposals/README.md) — boshqa modul (bir dissertatsiyada ro‘yxatlar)
- [Ma'lumotlar modeli](../../backend/data-model.md)
