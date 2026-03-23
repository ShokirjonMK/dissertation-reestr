# AI Service

**Port:** 8002
**Texnologiya:** FastAPI
**Papka:** `services/ai-service/`

---

## Maqsad

RAG (Retrieval Augmented Generation) texnologiyasiga asoslangan savol-javob xizmati. Dissertatsiya bazasidan tegishli ma'lumotlarni topib, kontekstli javob generatsiya qiladi.

---

## Arxitektura (RAG)

```
Foydalanuvchi savoli
      ↓
1. Search Service ga qidiruv so'rovi
      ↓
2. Eng tegishli dissertatsiyalar olinadi (top_k)
      ↓
3. Dissertatsiya matnlari kontekst sifatida yig'iladi
      ↓
4. Kontekst + savol → Javob generatsiya
      ↓
Javob + manbalar qaytariladi
```

---

## Endpointlar

### GET /health
```json
{ "ok": true }
```

### POST /ask
AI asosida savol-javob.

**Request:**
```json
{
  "question": "Mediatsiya bo'yicha qanday tadqiqotlar bor?",
  "top_k": 5
}
```

**Response:**
```json
{
  "answer": "Mediatsiya bo'yicha tadqiqotlar...",
  "references": [
    {
      "id": 2,
      "title": "Fuqarolik nizolarini mediatsiya orqali hal etish samaradorligi"
    }
  ]
}
```

### POST /extract
Dissertatsiya matnidan muammo va takliflarni JSON ko'rinishida ajratish uchun **prompt** yuboriladi. Backend `extractor` fayldan matn olib, ushbu endpointga murojaat qiladi.

**Request:**
```json
{
  "prompt": "Quyidagi matndan FAQAT muammolar va takliflarni JSON qilib ber..."
}
```

**Response:**
```json
{
  "text": "{\"problems\": [...], \"proposals\": [...]}"
}
```

`text` ichidagi JSON keyin backend tomonidan parse qilinadi.

**Joriy holat:** LLM ulanguncha stub javob qaytarilishi mumkin — ishlab chiqarishda haqiqiy model ulash kerak.

---

## Joriy holat

`/ask` uchun: qidiruv natijalarini yig'ib, oddiy javob generatsiya qiladi (template-asosida). Haqiqiy LLM integratsiyasi uchun qo'shimcha konfiguratsiya kerak.

---

## LLM integratsiyasi (kelajak)

`services/ai-service/` ga quyidagilardan birini ulash mumkin:

### Llama (lokal)
```python
# requirements.txt ga qo'shish
llama-cpp-python

# Model yuklab olish
# Meta Llama 3 yoki Mistral 7B
```

### OpenAI API
```python
# requirements.txt ga qo'shish
openai

# .env ga qo'shish
OPENAI_API_KEY=sk-...
```

### Anthropic Claude API
```python
# requirements.txt ga qo'shish
anthropic

# .env ga qo'shish
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Backend bilan integratsiya

- **Savol-javob:** `POST /api/v1/ai/ask` → `search_sync_service.ask_ai()` → `POST {AI_SERVICE_URL}/ask` (sinxron `httpx`).
- **Matn ajratish:** `back/app/ai/extractor.py` → `POST {AI_SERVICE_URL}/extract` (`prompt` bilan).

---

## Konfiguratsiya (.env)

```
AI_SERVICE_URL=http://ai-service:8002
```
