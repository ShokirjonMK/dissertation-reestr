# Texnik Topshiriq — Qo'shimcha Talablar
## Dissertatsiya Reestri Tizimi — v2.0

**Hujjat turi:** Texnik Topshiriq (TZ)  
**Versiya:** 2.0  
**Sana:** 2026-03-23  
**Asos:** `TIZIM_MAQSADI_VA_HOLATI.md`, mijoz talablari  
**Maqsad:** Mavjud tizimga 2 ta yangi blok qo'shish

---

## 1. Umumiy Ko'rinish

Mavjud dissertatsiya reestri tizimiga quyidagi ikkita yangi funksional blok qo'shiladi:

| # | Blok | Qisqa tavsif |
|---|------|--------------|
| 1 | **ACT bloki** — Amalga tatbiq etish takliflari | Ilmiy hodim taklif yuboradi → Adliya hodimi ko'rib tasdiqlaydi |
| 2 | **Muammo va Takliflar qidiruvi** | Soddalashtirilgan qidiruv va ma'lumot kiritish |

---

## 2. Blok 1 — Amalga Tatbiq Etish Takliflari (Акт внедрения)

### 2.1 Maqsad

Dissertatsiya bo'yicha **Акт внедрения** (amalga tatbiq etish akti) rasmiylashtirish jarayonidan **oldin**, ilmiy hodim tizim orqali rasmiy taklif (proposal) shakllantiradi va yuboradi. Adliya vazirligi xodimlari bu taklifni ko'rib chiqib, tasdiqlaydi yoki rad etadi.

### 2.2 Ishtirokchilar va Rollar

| Rol | Vazifa |
|-----|--------|
| `EMPLOYEE` (Ilmiy hodim) | Taklif shakllantiradi, yuboradi, holati kuzatadi |
| `MODERATOR` / `ADMIN` (Adliya hodimi) | Ko'rib chiqadi, izoh yozadi, tasdiqlaydi yoki rad etadi |
| `DOCTORANT` | O'z dissertatsiyasi bo'yicha taklifni kuzatadi (read-only) |
| `SUPERVISOR` | Ko'rish huquqi (read-only) |

### 2.3 Ma'lumot Modeli

#### `ImplementationProposal` (Amalga tatbiq etish taklifi)

```
id                    UUID, PK
dissertation_id       UUID, FK → dissertations.id
proposed_by           UUID, FK → users.id  (ilmiy hodim)
reviewed_by           UUID, FK → users.id (Adliya hodimi, nullable)

-- Taklif tarkibi
title                 TEXT NOT NULL           -- Taklif sarlavhasi
problem_description   TEXT NOT NULL           -- Hal qilinayotgan muammo
proposal_text         TEXT NOT NULL           -- Taklif matni (asl)
expected_result       TEXT NOT NULL           -- Kutilayotgan natija
implementation_area   TEXT NOT NULL           -- Tatbiq doirasi (soha/muassasa)
implementation_org    TEXT NOT NULL           -- Tatbiq etilishi ko'zlangan tashkilot
priority              ENUM(low, medium, high, critical)  DEFAULT 'medium'
source_chapter        TEXT                    -- Dissertatsiyaning qaysi bobi
source_pages          TEXT                    -- Sahifalar (masalan "45-52")

-- Holat va sana
status                ENUM(draft, submitted, under_review, approved, rejected, revision_required)
submitted_at          TIMESTAMP
reviewed_at           TIMESTAMP
deadline              DATE                    -- Ko'rib chiqish muddati

-- Izohlar
reviewer_comment      TEXT                    -- Adliya hodimi izohi
revision_notes        TEXT                    -- Qayta ishlash bo'yicha yo'riqnoma
internal_notes        TEXT                    -- Ichki (admin/moderator) izoh

-- Fayl
attachment_url        TEXT                    -- Ixtiyoriy qo'shimcha hujjat (PDF)

created_at            TIMESTAMP DEFAULT now()
updated_at            TIMESTAMP DEFAULT now()
```

#### `ProposalStatusHistory` (Holat tarixi)

```
id                UUID, PK
proposal_id       UUID, FK
changed_by        UUID, FK → users.id
from_status       ENUM
to_status         ENUM
comment           TEXT
changed_at        TIMESTAMP DEFAULT now()
```

### 2.4 Status Oqimi (Workflow)

```
[EMPLOYEE]          [MODERATOR/ADMIN]
    |                     |
  draft ──submit──► submitted
                        |
                   under_review ──────────────────┐
                        |                         |
                   [Ko'rib chiqish]                |
                    /         \                   |
               approved      rejected         revision_required
                                                  |
                                            [EMPLOYEE qayta]
                                                  |
                                              submitted
```

**Status qoidalari:**

| Harakat | Kim bajaradi | Qaysi statusdan | Qaysi statusga |
|---------|--------------|-----------------|----------------|
| `submit` | EMPLOYEE | draft | submitted |
| `start_review` | MODERATOR/ADMIN | submitted | under_review |
| `approve` | MODERATOR/ADMIN | under_review | approved |
| `reject` | MODERATOR/ADMIN | under_review | rejected |
| `request_revision` | MODERATOR/ADMIN | under_review | revision_required |
| `resubmit` | EMPLOYEE | revision_required | submitted |
| `save_draft` | EMPLOYEE | — | draft |

### 2.5 API Endpointlari

#### Asosiy CRUD

```
POST   /api/v1/proposals/                    -- Yangi taklif yaratish (EMPLOYEE)
GET    /api/v1/proposals/                    -- Ro'yxat (filter: status, dissertation_id, priority)
GET    /api/v1/proposals/{id}               -- Batafsil ko'rish
PUT    /api/v1/proposals/{id}               -- Tahrirlash (faqat draft/revision_required)
DELETE /api/v1/proposals/{id}               -- O'chirish (faqat draft, faqat o'zi)
```

#### Status boshqaruvi

```
POST   /api/v1/proposals/{id}/submit        -- Yuborish (EMPLOYEE)
POST   /api/v1/proposals/{id}/start-review  -- Ko'rib chiqishni boshlash (MOD/ADMIN)
POST   /api/v1/proposals/{id}/approve       -- Tasdiqlash (MOD/ADMIN) + comment
POST   /api/v1/proposals/{id}/reject        -- Rad etish (MOD/ADMIN) + comment
POST   /api/v1/proposals/{id}/request-revision  -- Qayta ishlash (MOD/ADMIN) + notes
POST   /api/v1/proposals/{id}/resubmit      -- Qayta yuborish (EMPLOYEE)
```

#### Qo'shimcha

```
GET    /api/v1/proposals/{id}/history       -- Status tarixi
GET    /api/v1/proposals/my                 -- Mening takliflarim
GET    /api/v1/proposals/pending            -- Ko'rib chiqilayotganlar (MOD/ADMIN)
GET    /api/v1/proposals/stats              -- Statistika (ADMIN)
POST   /api/v1/proposals/{id}/upload        -- Fayl yuklash
```

#### Dissertatsiya bilan bog'liq

```
GET    /api/v1/dissertations/{id}/proposals  -- Dissertatsiya bo'yicha barcha takliflar
```

### 2.6 Frontend Sahifalari

#### EMPLOYEE uchun

**`/proposals/new`** — Yangi taklif shakli:
- Dissertation tanlash (dropdown/search)
- `title` — sarlavha
- `problem_description` — muammo tavsifi (textarea, min 100 belgi)
- `proposal_text` — taklif matni (textarea, min 200 belgi)
- `expected_result` — kutilayotgan natija
- `implementation_area` — soha (dropdown: qonunchilik, ta'lim, huquqni muhofaza qilish, iqtisodiyot, boshqa)
- `implementation_org` — tashkilot nomi
- `priority` — ustuvorlik (radio: past/o'rta/yuqori/kritik)
- `source_chapter` — bob/bo'lim (optional)
- `source_pages` — sahifalar (optional)
- `attachment` — fayl yuklash (optional, PDF max 10MB)
- Tugmalar: **"Qoralama sifatida saqlash"** | **"Yuborish"**

**`/proposals`** — Mening takliflarim ro'yxati:
- Jadval: sarlavha, dissertatsiya, status (badge), yuborilgan sana, ko'rib chiquvchi, amallar
- Filter: status bo'yicha
- Badge ranglari: draft(kulrang), submitted(ko'k), under_review(sariq), approved(yashil), rejected(qizil), revision_required(to'q sariq)
- Har bir qator: Ko'rish | Tahrirlash (draft/revision) | O'chirish (draft)

**`/proposals/{id}`** — Taklif tafsilotlari:
- Barcha maydonlar
- Holat tarixi (timeline)
- Reviewer izohi (agar bor)
- Revision notes (agar bor)
- Qayta yuborish tugmasi (revision_required da)

#### MODERATOR/ADMIN uchun

**`/admin/proposals`** — Barcha takliflar:
- Filtrlar: status, priority, sana oralig'i, muallif, dissertatsiya
- Batch amallar: bir nechta bir vaqtda o'tkazish
- Ko'rib chiqilmagan takliflar soni (badge, sidebar da)

**`/admin/proposals/{id}/review`** — Ko'rib chiqish sahifasi:
- Taklif tafsilotlari (chap panel)
- Dissertatsiya ma'lumotlari (o'ng panel, reference uchun)
- Amallar paneli:
  - Tasdiqlash (yashil tugma) → modal: izoh (ixtiyoriy)
  - Rad etish (qizil tugma) → modal: sabab (majburiy)
  - Qayta ishlash (sariq tugma) → modal: ko'rsatmalar (majburiy)
- Status tarixi

### 2.7 Bildirishnomalar (Notifications)

| Hodisa | Qabul qiluvchi | Kanal |
|--------|---------------|-------|
| Taklif yuborildi | Barcha MODERATOR/ADMIN | In-app + Email |
| Taklif tasdiqlandi | EMPLOYEE (muallif) | In-app + Email |
| Taklif rad etildi | EMPLOYEE (muallif) | In-app + Email |
| Revision talab qilindi | EMPLOYEE (muallif) | In-app + Email |
| Qayta yuborildi | Oldingi reviewer | In-app |
| Muddat yaqinlashdi (2 kun) | MODERATOR/ADMIN | In-app |

### 2.8 Statistika va Hisobot (Admin)

- Jami takliflar soni (status bo'yicha)
- O'rtacha ko'rib chiqish vaqti (kunlarda)
- Tasdiqlash/rad etish nisbati
- Eng faol mualliflar
- Soha bo'yicha taqsimot
- Oylik dinamika (grafik)
- CSV/Excel eksport

---

## 3. Blok 2 — Muammo va Takliflar Qidiruvi (Soddalashtirilgan)

### 3.1 Maqsad

Mavjud qidiruv tizimi murakkab bo'lib, foydalanuvchi uchun qiyin. Yangi qidiruv:
- **Faqat** muammolar va takliflar bo'yicha ishlaydi
- Oddiy va tezkor
- Ma'lumot kiritish sodda bo'lishi shart

### 3.2 Dissertatsiya Modeliga Qo'shimchalar

#### `DissertationProblem` (Muammolar)

```
id                UUID, PK
dissertation_id   UUID, FK
order_num         INT                 -- tartib raqami (1, 2, 3...)
problem_text      TEXT NOT NULL       -- muammo matni
problem_category  TEXT                -- kategoriya (ixtiyoriy)
source_page       TEXT                -- sahifa (ixtiyoriy)
is_auto_extracted BOOLEAN DEFAULT false
created_at        TIMESTAMP
```

#### `DissertationProposal` (Takliflar — dissertatsiyadan)

```
id                UUID, PK
dissertation_id   UUID, FK
order_num         INT
proposal_text     TEXT NOT NULL       -- taklif matni
proposal_category TEXT                -- kategoriya (ixtiyoriy)
source_page       TEXT                -- sahifa (ixtiyoriy)
is_auto_extracted BOOLEAN DEFAULT false
created_at        TIMESTAMP
```

> **Eslatma:** Bu jadvallar dissertatsiyaning o'zidan (PDF dan avtomatik yoki qo'lda kiritilgan) muammo va takliflarni saqlaydi. Blok 1 dagi `ImplementationProposal` esa EMPLOYEE tomonidan shakllantiriladigan alohida hujjat.

### 3.3 Ma'lumot Kiritish — Ikkita Rejim

#### Rejim A: Avtomatik ajratib olish (AI yordamida)

Foydalanuvchi PDF yoki Word yuklaydi → AI servis muammo va takliflarni avtomatik ajratadi → foydalanuvchi ko'rib chiqadi va tasdiqlaydi.

**Endpoint:**
```
POST /api/v1/dissertations/{id}/extract-problems-proposals
```
**AI prompt (back/app/services/ai/extractor.py):**
```python
EXTRACTION_PROMPT = """
Dissertatsiya matnidan faqat muammolar va takliflarni ajratib ber.

Natijani JSON formatida qaytarki:
{
  "problems": [
    {"order": 1, "text": "...", "page": "..."},
    ...
  ],
  "proposals": [
    {"order": 1, "text": "...", "page": "..."},
    ...
  ]
}

Faqat JSON qaytargin, boshqa hech narsa yozma.
"""
```

**Frontend jarayoni:**
1. PDF/Word yuklash tugmasi
2. "Avtomatik ajratish" tugmasi
3. Loading spinner ("AI tahlil qilmoqda...")
4. Natija: ikkita panel — Muammolar ro'yxati | Takliflar ro'yxati
5. Har bir element: tekst + tahrirlash + o'chirish tugmasi
6. "+ Qo'shish" tugmasi (qo'lda qo'shish uchun)
7. "Saqlash" tugmasi

#### Rejim B: Qo'lda kiritish (soddalashtirilgan)

Murakkab forma o'rniga **minimal interfeys**:

```
MUAMMOLAR bo'limi:
┌─────────────────────────────────────────┐
│ 1. [Muammo matnini kiriting...]   [✕]   │
│ 2. [Muammo matnini kiriting...]   [✕]   │
│ [+ Muammo qo'shish]                     │
└─────────────────────────────────────────┘

TAKLIFLAR bo'limi:
┌─────────────────────────────────────────┐
│ 1. [Taklif matnini kiriting...]   [✕]   │
│ 2. [Taklif matnini kiriting...]   [✕]   │
│ [+ Taklif qo'shish]                     │
└─────────────────────────────────────────┘
```

- Har bir qator: textarea (auto-resize) + o'chirish tugmasi
- "+ qo'shish" tugmasi yangi qator qo'shadi
- Sahifa ko'rsatish — ixtiyoriy (collapse/expand)
- Saqlash — auto-save yoki tugma

### 3.4 Qidiruv Interfeysi — Yangi Sodda Versiya

**Sahifa:** `/search` (mavjud qidiruvni almashtirish yoki parallel versiya sifatida `/search/problems`)

#### UI Tuzilishi

```
┌─────────────────────────────────────────────────────┐
│          MUAMMO VA TAKLIFLAR BO'YICHA QIDIRUV       │
│                                                     │
│  [🔍 Qidiruv so'zini kiriting...              ]    │
│                                                     │
│  Nima qidirmoqdasiz?                               │
│  ○ Muammolar  ○ Takliflar  ● Ikkalasi             │
│                                                     │
│  [Qidirish]                                        │
└─────────────────────────────────────────────────────┘

Filtrlar (collapsible, ixtiyoriy):
  Soha: [Hammasi ▼]    Yil: [2020 - 2026]    Ilmiy daraja: [Hammasi ▼]
```

#### Natija Ko'rinishi

Har bir natija kartasi:

```
┌──────────────────────────────────────────────────────┐
│  📄 Dissertatsiya: "Sarlavha..."          2024       │
│  👤 Muallif: F.I.O   |   🏛 Universitet            │
│  ─────────────────────────────────────────────────  │
│  🔴 MUAMMO:                                         │
│  "...qidiruv so'zi bo'lgan matn parchasi..."        │
│                                                      │
│  🟢 TAKLIF:                                         │
│  "...mos taklif matni..."                           │
│                                                      │
│  [Batafsil ko'rish]  [Barcha muammolar]  [Barcha takliflar] │
└──────────────────────────────────────────────────────┘
```

#### Qidiruv Mantig'i

```python
# Elasticsearch query
{
  "query": {
    "bool": {
      "should": [
        {
          "nested": {
            "path": "problems",
            "query": {
              "multi_match": {
                "query": search_term,
                "fields": ["problems.problem_text^2"],
                "fuzziness": "AUTO"
              }
            },
            "inner_hits": {"size": 2}
          }
        },
        {
          "nested": {
            "path": "proposals",
            "query": {
              "multi_match": {
                "query": search_term,
                "fields": ["proposals.proposal_text^2"],
                "fuzziness": "AUTO"
              }
            },
            "inner_hits": {"size": 2}
          }
        }
      ],
      "filter": [
        # soha, yil, daraja filtrlari
      ]
    }
  },
  "highlight": {
    "fields": {
      "problems.problem_text": {},
      "proposals.proposal_text": {}
    }
  }
}
```

### 3.5 API Endpointlari

```
# Muammo/Taklif CRUD
POST   /api/v1/dissertations/{id}/problems           -- Muammo qo'shish
GET    /api/v1/dissertations/{id}/problems           -- Muammolar ro'yxati
PUT    /api/v1/dissertations/{id}/problems/{pid}     -- Tahrirlash
DELETE /api/v1/dissertations/{id}/problems/{pid}     -- O'chirish
POST   /api/v1/dissertations/{id}/problems/bulk      -- Ko'p muammo birdan

POST   /api/v1/dissertations/{id}/proposals          -- Taklif qo'shish
GET    /api/v1/dissertations/{id}/proposals          -- Takliflar ro'yxati
PUT    /api/v1/dissertations/{id}/proposals/{pid}    -- Tahrirlash
DELETE /api/v1/dissertations/{id}/proposals/{pid}    -- O'chirish
POST   /api/v1/dissertations/{id}/proposals/bulk     -- Ko'p taklif birdan

# AI ajratish
POST   /api/v1/dissertations/{id}/extract-problems-proposals  -- AI ajratish

# Qidiruv
GET    /api/v1/search/problems-proposals?q=...&type=both&field=...&year_from=...&year_to=...
```

**Qidiruv parametrlari:**

| Param | Tip | Default | Tavsif |
|-------|-----|---------|--------|
| `q` | string | — | Qidiruv so'zi (majburiy) |
| `type` | enum(problems, proposals, both) | both | Nima qidirish |
| `field` | string | — | Ilmiy soha (ixtiyoriy) |
| `year_from` | int | — | Yildan (ixtiyoriy) |
| `year_to` | int | — | Yilgacha (ixtiyoriy) |
| `degree` | enum | — | Ilmiy daraja (ixtiyoriy) |
| `university_id` | UUID | — | Universitet (ixtiyoriy) |
| `page` | int | 1 | Sahifalash |
| `size` | int | 10 | Sahifadagi natijalar |

### 3.6 Elasticsearch Indeksi O'zgarishlari

`dissertations` indeksiga qo'shimcha maydonlar:

```json
{
  "mappings": {
    "properties": {
      "problems": {
        "type": "nested",
        "properties": {
          "id": {"type": "keyword"},
          "order_num": {"type": "integer"},
          "problem_text": {
            "type": "text",
            "analyzer": "uzbek_russian_analyzer",
            "fields": {"keyword": {"type": "keyword"}}
          },
          "problem_category": {"type": "keyword"}
        }
      },
      "proposals": {
        "type": "nested",
        "properties": {
          "id": {"type": "keyword"},
          "order_num": {"type": "integer"},
          "proposal_text": {
            "type": "text",
            "analyzer": "uzbek_russian_analyzer",
            "fields": {"keyword": {"type": "keyword"}}
          },
          "proposal_category": {"type": "keyword"}
        }
      }
    }
  }
}
```

---

## 4. Alembic Migratsiyalari

```
migrations/
  versions/
    0010_add_implementation_proposals.py
    0011_add_dissertation_problems.py
    0012_add_dissertation_proposals.py
    0013_add_proposal_status_history.py
```

---

## 5. Fayl Tuzilishi — Yangi Fayllar

### Backend (`back/`)

```
back/app/
  models/
    implementation_proposal.py      # ImplementationProposal model
    proposal_status_history.py      # StatusHistory model
    dissertation_problem.py         # DissertationProblem model
    dissertation_proposal.py        # DissertationProposal model (dissertatsiyadan)

  schemas/
    implementation_proposal.py      # Pydantic schemas
    dissertation_problems.py        # Problems/Proposals schemas

  routers/
    implementation_proposals.py     # /api/v1/proposals/*
    problems_proposals.py           # /api/v1/dissertations/{id}/problems|proposals/*
    search_problems.py              # /api/v1/search/problems-proposals

  services/
    implementation_proposal_service.py
    problems_proposals_service.py
    notification_service.py         # Email/in-app bildirish (yangilash)

  ai/
    extractor.py                    # PDF dan muammo/taklif ajratish

migrations/versions/
  0010_add_implementation_proposals.py
  0011_add_dissertation_problems_proposals.py
```

### Frontend (`front/`)

```
front/src/
  app/
    (dashboard)/
      proposals/
        page.tsx                    # Mening takliflarim ro'yxati
        new/page.tsx                # Yangi taklif shakli
        [id]/page.tsx               # Taklif tafsilotlari
        [id]/edit/page.tsx          # Tahrirlash
      search/
        problems/page.tsx           # Yangi sodda qidiruv sahifasi
      admin/
        proposals/
          page.tsx                  # Admin: barcha takliflar
          [id]/review/page.tsx      # Ko'rib chiqish sahifasi

  components/
    proposals/
      ProposalForm.tsx              # Asosiy taklif shakli komponenti
      ProposalCard.tsx              # Ro'yxat kartasi
      ProposalStatusBadge.tsx       # Status badge
      ProposalReviewPanel.tsx       # Ko'rib chiqish paneli
      StatusHistoryTimeline.tsx     # Holat tarixi
      ProposalStats.tsx             # Statistika widget

    problems-proposals/
      ProblemsProposalsEditor.tsx   # Muammo/taklif kiritish editor
      AutoExtractButton.tsx         # AI ajratish tugmasi
      ProblemItem.tsx               # Bitta muammo qatori
      ProposalItem.tsx              # Bitta taklif qatori

    search/
      SimpleProblemSearch.tsx       # Sodda qidiruv komponenti
      SearchResultCard.tsx          # Natija kartasi
      SearchFilters.tsx             # Qo'shimcha filtrlar (collapse)
      HighlightedText.tsx           # Highlight ko'rsatish

  hooks/
    useProposals.ts
    useProblemsProposals.ts
    useSimpleSearch.ts
    useAutoExtract.ts

  types/
    implementation-proposal.ts
    dissertation-problems.ts
    search.ts

  api/
    proposals.ts                    # API chaqiruvlari
    problems-proposals.ts
    search.ts
```

---

## 6. Ruxsatlar Matritsasi (Yangi)

### ImplementationProposal

| Harakat | EMPLOYEE | MODERATOR | ADMIN | DOCTORANT | SUPERVISOR |
|---------|----------|-----------|-------|-----------|------------|
| Yaratish | ✅ | ✅ | ✅ | ❌ | ❌ |
| O'z drafti tahrirlash | ✅ | ✅ | ✅ | ❌ | ❌ |
| Yuborish (submit) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ko'rib chiqish | ❌ | ✅ | ✅ | ❌ | ❌ |
| Tasdiqlash/Rad | ❌ | ✅ | ✅ | ❌ | ❌ |
| Ko'rish (o'zi yozgan) | ✅ | ✅ | ✅ | ✅* | ✅* |
| Ko'rish (barchasi) | ❌ | ✅ | ✅ | ❌ | ❌ |
| O'chirish (faqat draft) | ✅ | ✅ | ✅ | ❌ | ❌ |

*faqat o'z dissertatsiyasiga bog'liq takliflar

### DissertationProblem/Proposal

| Harakat | DOCTORANT | EMPLOYEE | MODERATOR | ADMIN |
|---------|-----------|----------|-----------|-------|
| Qo'shish/tahrirlash (o'z dis.) | ✅ | ✅ | ✅ | ✅ |
| AI ajratish | ✅ | ✅ | ✅ | ✅ |
| Ko'rish | ✅ | ✅ | ✅ | ✅ |
| O'chirish (o'z dis.) | ✅ | ✅ | ✅ | ✅ |

---

## 7. Bildirishnomalar Tizimi

### In-app Bildirishnomalar

```
notifications jadvaliga qo'shimcha type lar:
  - PROPOSAL_SUBMITTED
  - PROPOSAL_APPROVED
  - PROPOSAL_REJECTED
  - PROPOSAL_REVISION_REQUIRED
  - PROPOSAL_RESUBMITTED
  - PROPOSAL_DEADLINE_APPROACHING
```

### Email Shablon (minimalni)

Har bir holat o'zgarishi uchun qisqa email:
- Mavzu: `[Dissertatsiya Reestri] Taklifingiz holati o'zgardi`
- Tana: status, izoh, havola

---

## 8. Qabul Mezonlari (Acceptance Criteria)

### Blok 1

- [ ] EMPLOYEE yangi taklif yaratib, draft sifatida saqlashi mumkin
- [ ] EMPLOYEE taklif yuborishi va holat kuzatishi mumkin
- [ ] MODERATOR/ADMIN ko'rib chiqilmagan takliflar ro'yxatini ko'rishi mumkin
- [ ] MODERATOR/ADMIN tasdiqlash/rad etish/revision so'rashi mumkin
- [ ] Har bir holat o'zgarishi tarixda saqlanishi kerak
- [ ] Bildirishnomalar ishlashi kerak (in-app)
- [ ] Status badge lari to'g'ri rangda ko'rinishi kerak
- [ ] Admin statistika sahifasi ishlashi kerak

### Blok 2

- [ ] Foydalanuvchi faqat qidiruv so'zi kiritib natija olishi mumkin
- [ ] Qidiruv natijasida muammo va taklif matni highlight qilinishi kerak
- [ ] Filtrlar ixtiyoriy va collapsible bo'lishi kerak
- [ ] AI ajratish tugmasi PDF/Word yuklaganda paydo bo'lishi kerak
- [ ] AI ajratish natijasi tahrirlash imkoniyati bilan ko'rsatilishi kerak
- [ ] Qo'lda kiritish "+" tugmasi bilan ishlashi kerak
- [ ] Kamida 1 ta muammo yoki taklif kiritilishi shart (majburiy emas, lekin tavsiya)

---

## 9. Texnologiyalar (Mavjudlarga Qo'shimcha)

| Texnologiya | Maqsad | Qayerda |
|-------------|--------|---------|
| Elasticsearch `nested` queries | Muammo/taklif qidiruvi | search-service |
| FastAPI BackgroundTasks | Email bildirishnomalar | back |
| `python-docx` | Word fayldan matn ajratish | back/ai-service |
| `pdfplumber` yoki `pypdf2` | PDF dan matn | back/ai-service |
| React Hook Form | Taklif shakli | front |
| Framer Motion | Status timeline animatsiya | front |

---

## 10. Muhim Eslatmalar

1. **Blok 1 va Blok 2 mustaqil** — biri ishlamasa ikkinchisi ta'sirlanmasin
2. **Mavjud qidiruv o'chirilmaydi** — `/search/problems` yangi URL da, eski `/search` ishlayveradi
3. **AI ajratish ixtiyoriy** — LLM ulanmagan bo'lsa ham qo'lda kiritish ishlaydi (graceful degradation)
4. **Backward compatibility** — mavjud `dissertations` API o'zgarmaydi, faqat yangi endpointlar qo'shiladi
5. **Stub bildirishnomalar** — Email real SMTP ulanmasa ham in-app ishlashi kerak

---

*TZ v2.0 | Dissertatsiya Reestri | 2026-03-23*
