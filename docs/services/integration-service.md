# Integration Service

**Port:** 8003
**Texnologiya:** FastAPI
**Papka:** `services/integration-service/`

---

## Maqsad

Tashqi tizimlar bilan integratsiya adapterlari:
- Ichki Ishlar Vazirligi pasport tekshiruvi
- `hr.adliya.uz` HR tizimi

---

## Endpointlar

### GET /health
```json
{ "ok": true }
```

### POST /passport/verify
Pasport ma'lumotlarini tekshirish.

**Request:**
```json
{
  "seria": "AA",
  "number": "1234567",
  "pin": "12345678901234"
}
```

**Response (muvaffaqiyatli):**
```json
{
  "valid": true,
  "message": "Passport format is valid"
}
```

**Response (xato):**
```json
{
  "valid": false,
  "message": "Invalid passport seria format"
}
```

### POST /hr/check
HR tizimida foydalanuvchini tekshirish.

**Request:**
```json
{
  "email": "user@adliya.uz"
}
```

**Response:**
```json
{
  "authorized": true,
  "message": "HR domain authorized"
}
```

---

## Joriy holat (Stub)

Hozirda haqiqiy API so'rovlari o'rniga formatni tekshiradi:

**Pasport:**
- Seriya: 2 harf (A-Z)
- Raqam: 7 raqam
- PIN: 14 ta raqam

**HR:**
- Ruxsat berilgan domenlar: `@adliya.uz`, `@minjust.uz`

---

## Ishlab chiqarish uchun

Haqiqiy integratsiya uchun `services/integration-service/app/main.py` ni yangilash kerak:

### IIV Pasport API
```python
# Haqiqiy endpoint ga HTTP so'rov
response = await httpx.post(
    "https://api.mvd.gov.uz/passport/verify",
    json=payload,
    headers={"Authorization": f"Bearer {IIV_API_KEY}"}
)
```

### HR Adliya API
```python
# hr.adliya.uz API
response = await httpx.get(
    f"https://hr.adliya.uz/api/employee/{email}",
    headers={"Authorization": f"Bearer {HR_API_KEY}"}
)
```

---

## Konfiguratsiya (.env)

```
INTEGRATION_SERVICE_URL=http://integration-service:8003
```
