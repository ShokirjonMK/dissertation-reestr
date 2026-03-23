# Search Service

**Port:** 8001
**Texnologiya:** FastAPI + Elasticsearch 8.13
**Papka:** `services/search-service/`

---

## Maqsad

Elasticsearch orqali dissertatsiyalarni to'liq matnli qidirish imkoniyatini taqdim etadi. Backend `search-service` ga HTTP so'rovlar orqali murojaat qiladi.

---

## Endpointlar

### GET /health
Servis sog'lig'ini tekshirish.
```json
{ "ok": true }
```

### POST /index/dissertation
Dissertatsiyani Elasticsearch'ga indekslash.

**Request:**
```json
{
  "id": 1,
  "title": "Dissertatsiya nomi",
  "problem": "...",
  "proposal": "...",
  "annotation": "...",
  "conclusion": "...",
  "keywords": ["kalit1", "kalit2"],
  "autoreferat_text": null,
  "dissertation_word_text": null,
  "status": "approved",
  "category": "civil",
  "expert_rating": 86.0,
  "visibility": "internal",
  "scientific_direction_id": 1,
  "scientific_direction_name": "Civil Law",
  "university_id": 1,
  "university_name": "TSUL",
  "author_id": 2,
  "author_name": "doctorant",
  "supervisor_id": 3,
  "supervisor_name": "supervisor",
  "region_id": 1,
  "defense_date": "2026-07-01",
  "problems": [
    { "order_num": 1, "problem_text": "...", "source_page": "12" }
  ],
  "proposal_contents": [
    { "order_num": 1, "proposal_text": "...", "source_page": "45" }
  ]
}
```

**Response:**
```json
{ "indexed": true }
```

### POST /search
To'liq matnli qidiruv.

**Request:**
```json
{
  "query": "raqamlashtirish",
  "filters": {
    "status": "approved",
    "visibility": "internal"
  },
  "size": 20
}
```

**Response:**
```json
{
  "hits": [
    {
      "id": "1",
      "score": 1.5,
      "source": { ...dissertation fields... }
    }
  ],
  "total": 5
}
```

### GET /search/problems-proposals
Strukturalangan `problems` va `proposal_contents` nested maydonlarida qidiruv.

**Query parametrlari:**

| Parametr | Tavsif |
|----------|---------|
| `q` | Qidiruv matni (min 2 belgi) |
| `type` | `problems` \| `proposals` \| `both` (default: both) |
| `field` | Ilmiy yo'nalish bo'yicha matn filtri |
| `year_from`, `year_to` | Himoya sanasi yil oralig'i (`defense_date`) |
| `degree` | `category` ustuniga term |
| `university_id` | Butun son (string sifatida ham yuboriladi) |
| `page`, `size` | Sahifalash |

**Javob:** `items` (dissertatsiya qisqacha + `matched_problems`, `matched_proposals` highlight bilan), `total`, `page`, `size`, `pages`, `query`.

Indeks hujjatida `problems` va `proposal_contents` massivlari bo'lishi kerak (backend indekslashda qo'shiladi).

Modul hujjati: [Dissertation problems & proposals](../modules/dissertation-problems-proposals/README.md).

---

## Qidiruv xususiyatlari

### To'liq matnli qidiruv
Quyidagi maydonlarda ishlaydi:
- `title` (og'irlik: 3)
- `problem` (og'irlik: 2)
- `proposal` (og'irlik: 2)
- `annotation` (og'irlik: 1.5)
- `conclusion` (og'irlik: 1.5)
- `keywords` (og'irlik: 2)
- `autoreferat_text` (og'irlik: 1)
- `dissertation_word_text` (og'irlik: 1)
- `author_name`, `supervisor_name`, `university_name` (og'irlik: 1)

### Fuzzy (xato-tolerant) qidiruv
```python
fuzziness: "AUTO"
```
Imloviy xatolarga chidamli.

### Sinonim qidiruv
Elasticsearch `uz_synonyms` analyzer tayyorlangan.

### Kontekst qidiruv
`phrase` va `best_fields` tipidagi so'rovlar kombinatsiyasi.

---

## Elasticsearch indeksi

Indeks nomi: `dissertations`

**Mapping asosiy maydonlar:**
```json
{
  "title": { "type": "text", "analyzer": "standard" },
  "problem": { "type": "text" },
  "proposal": { "type": "text" },
  "status": { "type": "keyword" },
  "expert_rating": { "type": "float" },
  "visibility": { "type": "keyword" },
  "defense_date": { "type": "date" }
}
```

---

## Ishonchliligi (Resilience)

Agar Elasticsearch mavjud bo'lmasa, servis xotirada minimal indeks saqlaydi va oddiy qidiruv natijasini qaytaradi. Bu servisning ishga tushishiga imkon beradi.

---

## Backend bilan integratsiya

Backend startup'da barcha dissertatsiyalarni sinxronlashtiradi:

```python
# back/app/services/reindex_service.py
def sync_dissertations_to_search():
    # Barcha dissertatsiyalarni Elasticsearch'ga indekslaydi
```

Yangi dissertatsiya yaratilganda yoki yangilanganda ham indekslash chaqiriladi.
