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

---

## Joriy holat

Hozirda AI Service qidiruv natijalarini yig'ib, oddiy javob generatsiya qiladi (template-asosida). Haqiqiy LLM integratsiyasi uchun qo'shimcha konfiguratsiya kerak.

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

Backend `POST /api/v1/ask` so'rovi kelganda AI Service'ga yo'naltiradi:

```python
# back/app/services/search_sync_service.py
async def ask_ai(question: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.ai_service_url}/ask",
            json={"question": question}
        )
    return response.json()
```

---

## Konfiguratsiya (.env)

```
AI_SERVICE_URL=http://ai-service:8002
```
