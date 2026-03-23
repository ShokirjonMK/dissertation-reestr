# Modul: Dissertatsiya muammolari va takliflar (strukturalangan ro‘yxatlar)

> **Versiya:** 1.0.0  
> **Yangilangan:** 2026-03-23  
> **Backend:** `back/app/models/dissertation_content.py`, `back/app/api/dissertation_content.py`, `back/app/services/dissertation_content_service.py`, `back/app/ai/extractor.py`  
> **API prefiks:** `/api/v1/dissertations/{dissertation_id}/...`

---

## 1. Maqsad

Bitta dissertatsiya uchun **bir nechta muammo** va **bir nechta taklif** qatorlarini alohida saqlash (dissertatsiya kartasidagi yagona `problem` / `proposal` maydonlaridan tashqari). Qo‘lda kiritish, ommaviy saqlash (bulk), PDF/Word dan matn ajratib AI yordamida taklif qilish, hamda Elasticsearch orqali **muammo/taklif matni bo‘yicha qidiruv**.

---

## 2. Ma'lumotlar modeli

### 2.1 `dissertation_problems`

| Maydon | Tavsif |
|--------|--------|
| `id` | PK |
| `dissertation_id` | FK → `dissertations.id` (CASCADE) |
| `order_num` | Tartib |
| `problem_text` | Matn |
| `problem_category`, `source_page` | Ixtiyoriy |
| `is_auto_extracted` | AI yoki qo‘lda |
| `created_at` | Yaratilgan vaqt |

### 2.2 `dissertation_proposals` (jadval nomi)

**Eslatma:** SQL jadval nomi `dissertation_proposals`; ORM klassi `DissertationProposalContent` (dissertatsiya `proposal` TEXT maydoni bilan chalkashmaslik uchun).

| Maydon | Tavsif |
|--------|--------|
| `proposal_text` | Taklif matni |
| `proposal_category`, `source_page` | Ixtiyoriy |
| Qolgani | `dissertation_problems` ga o‘xshash |

`Dissertation` modelida munosabatlar: `problems`, `proposal_contents`.

---

## 3. API

| Usul | Yo‘l | Tavsif |
|------|------|--------|
| POST | `.../problems` | Bitta muammo qo‘shish |
| GET | `.../problems` | Ro‘yxat |
| POST | `.../problems/bulk` | Ommaviy saqlash (`replace_existing`) |
| DELETE | `.../problems/{problem_id}` | O‘chirish |
| POST | `.../proposal-contents` | Bitta taklif qatori |
| GET | `.../proposal-contents` | Ro‘yxat |
| POST | `.../proposal-contents/bulk` | Ommaviy saqlash |
| DELETE | `.../proposal-contents/{id}` | O‘chirish |
| POST | `.../extract-problems-proposals` | Multipart `file` — PDF/Word dan ajratish (AI servis) |

Barcha marshrutlar autentifikatsiyadan keyin.

---

## 4. AI ajratish

1. `pdfplumber` / `python-docx` orqali matn olinadi (`back/app/ai/extractor.py`).
2. Matn qisqartiriladi (token cheklovi uchun).
3. `POST {AI_SERVICE_URL}/extract` ga `prompt` yuboriladi.
4. Javobdan JSON ajratiladi; struktura: `problems[]`, `proposals[]` (tartib, matn, sahifa).

**Joriy holat:** AI servisda LLM ulanmaguncha **stub** javob qaytarilishi mumkin — extractor xatolikni yumshoq qaytaradi.

---

## 5. Qidiruv (Elasticsearch)

- Indeks hujjatiga `problems` va `proposal_contents` **nested** massivlar qo‘shiladi (`search-service` mapping).
- Backend indekslash: `DissertationService.to_index_payload` — muammo/taklif qatorlari qo‘shiladi; saqlagach `index_dissertation` chaqiriladi.
- **Search-service:** `GET /search/problems-proposals` — `q`, `type` (problems | proposals | both), filtrlar (`year_from`, `year_to`, `field`, `degree`, `university_id`).
- **Asosiy API proksi:** `GET /api/v1/search/problems-proposals` — search-service ga yo‘naltiradi.

**Muhim:** indeks avvalroq yaratilgan bo‘lsa, yangi nested mapping uchun indeksni qayta yaratish yoki mapping yangilash kerak bo‘lishi mumkin.

---

## 6. Frontend

| Joy | Tavsif |
|-----|--------|
| `ProblemsProposalsEditor` | `/dashboard/dissertations/[id]` sahifasida kartochka |
| `SimpleProblemSearch` | `/dashboard/search/problems` |
| Sidebar | **Muammo/taklif qidiruvi** — barcha autentifikatsiyadan o‘tgan rollar |

API yordamchi: `front/src/services/api.ts` (`fetchDissertationProblems`, `fetchDissertationProposalContents`, `API_BASE_URL`, `buildAuthHeaders`).

---

## 7. Farq: Implementation Proposals modulidan

| | Strukturalangan muammo/takliflar | Implementation proposals |
|--|-----------------------------------|---------------------------|
| Ma’nosi | Dissertatsiya matnidan ajratilgan ro‘yxatlar | Amaliyotga joriy etish bo‘yicha rasmiy taklif hujjati |
| Jadval | `dissertation_problems`, `dissertation_proposals` | `implementation_proposals` |
| Status oqimi | Yo‘q (dissertatsiya statusiga bog‘liq emas) | draft → submitted → under_review → … |

---

## 8. Bog‘liq hujjatlar

- [Implementation Proposals](../implementation-proposals/README.md)
- [Search Service](../../services/search-service.md)
- [AI Service](../../services/ai-service.md)
- [Elasticsearch](../../databases/elasticsearch.md)
