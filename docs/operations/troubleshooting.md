# Muammolarni bartaraf etish

## Tiziz tekshiruv buyruqlari

```bash
# Barcha konteynerlar holati
docker compose ps

# Barcha loglar
docker compose logs -f

# Bitta servis logi
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
docker compose logs -f elasticsearch
```

---

## Backend ishga tushmaydi

**Belgi:** `dissertation-backend` container `Exit` yoki `Restarting`

**Tekshirish:**
```bash
docker compose logs backend
```

**Keng uchraydigan sabablar:**

1. **DB_URL noto'g'ri:**
   ```
   Error: could not connect to server
   ```
   `.env` dagi `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` mos kelishini tekshiring.

2. **Postgres tayyor emas:**
   Backend postgres `healthy` bo'lguncha kutadi. `docker compose ps` orqali tekshiring.

3. **search-service yoki integration-service tayyor emas:**
   Backend bu servislar `healthy` bo'lguncha kutadi.

4. **Import xatosi:**
   Python dependensiyalari etishmayapti. Docker imageni qayta build qiling:
   ```bash
   docker compose build backend
   docker compose up -d backend
   ```

---

## Frontend ishga tushmaydi

**Belgi:** `http://localhost:3000` ochilmaydi

**Tekshirish:**
```bash
docker compose logs frontend
```

**Sabablar:**
1. Backend `healthy` bo'lmagunga qadar frontend kelmaydi
2. Port 3000 band. `.env` da `FRONTEND_PORT=3001` qo'ying

---

## Qidiruv bo'sh natija qaytaradi

**Belgi:** Qidiruv hech nima topa olmaydi

**Tekshirish:**
```bash
docker compose logs search-service
docker compose logs elasticsearch
```

**Yechim:**
1. Elasticsearch ishga tushganini tekshiring: `http://localhost:9200`
2. Dissertatsiya yaratilganda indekslash avtomatik bo'lishi kerak
3. Manual reindeks uchun backend restart:
   ```bash
   docker compose restart backend
   ```
   Startup'da `sync_dissertations_to_search()` chaqiriladi.

---

## Frontend API xatosi

**Belgi:** Login bo'lmaydi, "Network Error" ko'rinadi

**Yechim:**
1. Browser DevTools → Network tab → API so'rovlarga qarang
2. `http://localhost:8000/api/v1/health` ga brauzerdan kiring
3. CORS muammo bo'lsa, `.env` da `CORS_ORIGINS` ni tekshiring

---

## Elasticsearch memory xatosi

**Belgi:** Elasticsearch konteyner tezda o'chib ketadi

**Yechim:** `.env` yoki `docker-compose.yml` da:
```yaml
environment:
  - ES_JAVA_OPTS=-Xms512m -Xmx512m
```
Serverda kamida 2GB RAM bo'lishi kerak.

---

## Fayl yuklash ishlamaydi

**Belgi:** Dissertatsiya faylini yuklashda xato

**Tekshirish:**
```bash
docker compose exec backend ls /app/storage
```

**Yechim:** Volume mount to'g'ri ekanligi:
```yaml
volumes:
  - ./volumes/backend-storage:/app/storage
```
`volumes/backend-storage/` papkasi mavjudligini tekshiring.

---

## Postgres ma'lumotlari yo'qoldi

**Sabab:** `volumes/postgres-data/` papkasi o'chirilgan.

**Muhim:** Development muhitida volumes papkasini o'chirmang!

Backup:
```bash
docker compose exec postgres pg_dump -U registry_user dissertation_registry > backup.sql
```

Restore:
```bash
docker compose exec -T postgres psql -U registry_user dissertation_registry < backup.sql
```

---

## Docker image eski

```bash
# Barcha imageni qayta build qilish
docker compose build --no-cache
docker compose up -d
```

---

## Portni tekshirish

```bash
# Linux/Mac
lsof -i :3000
lsof -i :8000

# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :8000
```

---

## Containerlar orasida ulanish

Backend boshqa servislarga konteyner nomidan murojaat qiladi:
- `http://postgres:5432` (xost nomi: `postgres`)
- `http://elasticsearch:9200`
- `http://redis:6379`
- `http://search-service:8001`
- `http://ai-service:8002`
- `http://integration-service:8003`

---

## Ma'lum stub integratsiyalar

**OneID:** Haqiqiy OAuth integratsiyasi stub. Ishlab chiqarish uchun `back/app/integrations/oneid_client.py` ni to'ldiring.

**HR Sistema:** `back/app/integrations/hr_client.py` stub. `hr.adliya.uz` API ga ulanish kerak.

**Pasport:** `back/app/integrations/passport_client.py` stub. IIV API ga ulanish kerak.
