# Dissertatsiya reestri tizimi — maqsad va joriy holat

**Hujjat turi:** yagona umumiy ko‘rinish (maqsad + holat)  
**Asos:** `dissertation_registry_TZ.md`, `dissertation_infrastructure.md`, `dissertation_ui_spec.md`, `docs/overview/system-overview.md`, `docs/overview/requirements-coverage.md`, joriy kod bazasi  
**Oxirgi yangilanish:** 2026-03-23

---

## 1. Loyihaning nomi va tuzilishi

Bu monorepo **Dissertation Registry System** (dissertatsiyalar reestri) deb ataladi. U uchta asosiy spetsifikatsiya hujjatidan ishlab chiqilgan va quyidagi qismlardan iborat:

| Qism | Joylashuv | Vazifa |
|------|-----------|--------|
| Frontend | `front/` | Next.js, foydalanuvchi interfeysi |
| Asosiy API | `back/` | FastAPI, biznes mantiq, ma’lumotlar |
| Qidiruv servisi | `services/search-service/` | Elasticsearch integratsiyasi |
| AI servisi | `services/ai-service/` | RAG / savol-javob (sozlamaga bog‘liq) |
| Integratsiya servisi | `services/integration-service/` | Tashqi API lar (stub) |
| Infratuzilma | `infra/`, `docker-compose.yml` | Docker, tarmoqlar, NGINX, Portainer |

Rasmiy TZ (`dissertation_registry_TZ.md`) dissertatsiya ishlarida **muammolar, takliflar va xulosalar**ni markazlashtirishni ham qamrab oladi; amaliy implementatsiya esa keng **dissertatsiya reestri** (metadata, fayllar, moderatsiya, qidiruv, AI) sifatida qurilgan.

---

## 2. Tizimning maqsadi

### 2.1 Strategik maqsad

**O‘zbekiston Respublikasida** himoya qilingan va himoyaga tayyorlanayotgan ilmiy dissertatsiyalarning (nomzodlik va doktorlik) **yagona raqamli bazasini** yuritish, **qidirish**, **tahlil qilish** va kerak bo‘lsa **ekspert nazorati** (moderatsiya) orqali tartibga solish.

Kontekstda hal qilinadigan muammolar (TZ va umumiy ko‘rinish bo‘yicha):

- Dissertatsiyalar tarqoq saqlanishi va ularni kuzatish qiyinligi
- Ilmiy ishlarning mavjudligini va dublikatlarni tekshirish ehtiyoji
- Ilmiy yo‘nalishlar bo‘yicha statistika va tendensiyalar
- Adliya vazirligi va tegishli mutaxassislar uchun **hisobot** va **ko‘rib chiqish** jarayoni
- **Sun’iy intellekt** yordamida tahlil, savol-javob va (reja bo‘yicha) plagiat/o‘xshashlik yo‘nalishidagi xizmatlar
- **Ko‘p tilli** interfeys (o‘zbek, rus, ingliz) qo‘llab-quvvatlash

### 2.2 Operatsion vazifalar

| # | Vazifa | Qisqa tavsif |
|---|--------|--------------|
| 1 | Ro‘yxatga olish | Dissertatsiya ma’lumotlari va fayllarni kiritish (wizard va API) |
| 2 | Saqlash | PostgreSQL + fayl saqlash + qidiruv indeksi |
| 3 | Qidiruv | To‘liq matn, fuzzy, kontekst (Elasticsearch) |
| 4 | Tahlil | AI servisi orqali RAG arxitekturasi |
| 5 | Moderatsiya | Tasdiqlash / rad etish, ekspert izohlari |
| 6 | Hisobot | Statistika va analitika (rolga bog‘liq) |
| 7 | Kataloglar | Mamlakatlar, universitetlar, yo‘nalishlar, regionlar va hokazo |

### 2.3 Foydalanuvchi rollari va ularning roli

| Rol | Kod (taxminan) | Asosiy vazifa |
|-----|----------------|---------------|
| Administrator | `ADMIN` | Tizim, foydalanuvchilar, kataloglar |
| Moderator | `MODERATOR` | Ko‘rib chiqish, tasdiqlash/rad |
| Doktorant | `DOCTORANT` | O‘z ishlarini yuklash va boshqarish |
| Ilmiy rahbar | `SUPERVISOR` | Doktorant ishlarini ko‘rish, izoh |
| Xodim | `EMPLOYEE` | Ko‘rish va qidiruv |

Batafsil ruxsatlar matritsasi: `docs/overview/system-overview.md` va `docs/backend/auth-roles.md`.

---

## 3. Arxitektura (qisqacha)

Foydalanuvchi brauzer orqali **Next.js** frontenga ulanadi; **asosiy API** (FastAPI) barcha asosiy biznes operatsiyalarni bajaradi. **Search service** Elasticsearch bilan ishlaydi. **AI service** RAG/savol-javob uchun ajratilgan. **Integration service** tashqi davlat/tashkilot tizimlari uchun mo‘ljallangan (hozircha ko‘p qismi stub).

Ma’lumotlar qatlami: **PostgreSQL** (asosiy ma’lumotlar), **Elasticsearch** (qidiruv), **Redis** (kesh, sessiya, cheklovlar bo‘yicha reja).

Batafsil diagramma va texnologiyalar: `docs/overview/system-overview.md`.

---

## 4. Joriy holat — funksional bajarilish

Quyidagi jadval loyiha ichidagi **talablar qamrovi** hujjatiga (`docs/overview/requirements-coverage.md`) asoslangan; u kod va dokumentatsiya holatini aks ettiradi.

### 4.1 TZ (texnik topshiriq) bo‘yicha

| Yo‘nalish | Holat | Qisqa izoh |
|-----------|-------|------------|
| 5 ta rol | ✅ | admin, moderator, doctorant, supervisor, employee |
| Foydalanuvchi profili | ✅ | Pasport, kontakt, manzil maydonlari |
| OneID integratsiyasi | ⚠️ Stub | `oneid_client.py` — sinov adapteri |
| HR integratsiyasi | ⚠️ Stub | `hr.adliya.uz` uchun stub |
| Pasport tekshiruvi (IIV) | ⚠️ Stub | Haqiqiy API ulanmagan |
| Dissertatsiya maydonlari | ✅ | Metadata to‘plami |
| Fayl yuklash (PDF, Word, avtoreferat) | ✅ | Multipart |
| Status oqimi | ✅ | draft → pending → approved/rejected → defended |
| Moderatsiya | ✅ | Moderator va admin |
| Filtrlash | ✅ | Ko‘p parametrli |
| Qidiruv (Elasticsearch) | ✅ | Full-text, fuzzy, context |
| AI savol-javob (RAG) | ✅ / ⚠️ | Arxitektura bor; LLM prod ulanishi sozlamaga bog‘liq |
| Kataloglar CRUD | ✅ | Yo‘nalishlar, universitetlar, regionlar, tumanlar |
| Login/parol + JWT | ✅ | |
| Yopiq tizim (auth guard) | ✅ | |

### 4.2 UI/UX spec bo‘yicha

Asosiy talablar bajarilgan: dashboard layout, glass UI, dark mode, jadval (sort/filter/pagination), AI chat vidjeti, keng qidiruv va filtrlash, responsive, shadcn/ui asosidagi komponentlar. Batafsil ro‘yxat: `docs/overview/requirements-coverage.md`.

### 4.3 Infratuzilma bo‘yicha

| Element | Holat |
|---------|--------|
| Docker / Dockerfile lar | ✅ |
| `docker-compose.yml` (root) | ✅ |
| Docker Swarm stack | ✅ `infra/docker/stacks/core-stack.yml` |
| NGINX Proxy Manager | ✅ `infra/nginx/` |
| Portainer | ✅ `infra/portainer/` |
| Tarmoq va volume lar | ✅ |
| Healthcheck lar | ✅ |
| Mikroservis ajratish | ✅ (5 servis) |

**CI/CD:** `docs/overview/requirements-coverage.md` da “rejalashtirilmagan” deb qoldirilgan bo‘lsa-da, repoda **GitHub Actions** bor: `.github/workflows/deploy.yml` — `main` ga pushda lint/typecheck va production deploy ish oqimi (loyiha server sozlamalariga bog‘liq).

### 4.4 Texnologiya steki (amalda)

Python FastAPI, Next.js, PostgreSQL 16, Elasticsearch 8.13, Redis 7, Docker — reja bo‘yicha qo‘llanilgan va hujjatlashtirilgan.

### 4.5 Umumiy baho (hujjatdagi yig‘indidan)

Talablar qamrovi hujjatida taxminiy ballar: infratuzilma ~95%, TZ funksiyalari ~90%, UI/UX ~94%, dokumentatsiya ~95%, ishga tayyorlik ~92%, **umumiy ~93%**. Bu subyektiv baho bo‘lib, prod tayyorligini almashtirmaydi.

---

## 5. Production uchun ochiq qolgan ishlar

Quyidagilar to‘liq ishlab chiqarish muhitida odatda talab etiladi:

1. **OneID** — haqiqiy OAuth/API (`back/app/integrations/oneid_client.py`)
2. **HR** — `hr.adliya.uz` bilan ulanish
3. **Pasport / JSHSHIR** — IIV API bilan ulanish
4. **AI model** — haqiqiy LLM (masalan, mahalliy yoki bulut) va kalitlar boshqaruvi
5. **Alembic migratsiyalari** — sxema versiyalash (agar hali to‘liq qo‘llanmagan bo‘lsa)
6. **Monitoring** — Prometheus/Grafana yoki muqobil
7. **SSL** — masalan, NGINX Proxy Manager + Let’s Encrypt
8. **Parollar** — seed hisoblar faqat development uchun; prod da almashtirish shart

---

## 6. Tez ishga tushirish (lokal)

```bash
cp .env.example .env
docker compose up -d --build
```

**Servis manzillari:**

- Frontend: http://localhost:3000  
- Backend API hujjatlari: http://localhost:8000/docs  
- Search: http://localhost:8001/docs  
- AI: http://localhost:8002/docs  
- Integration: http://localhost:8003/docs  

**Namuna hisoblar** (faqat dev): `README.md` dagi ro‘yxat (masalan `admin` / `admin12345`).

---

## 7. Qo‘shimcha hujjatlar

To‘liq modul bo‘yicha: [`docs/README.md`](docs/README.md).

---

*Ushbu fayl loyiha maqsadi va joriy holatning bitta qisqa-emaas, lekin bir faylda to‘planishi uchun mo‘ljallangan. Tafsilotlar uchun yuqoridagi manbalar va `docs/` katalogidagi maxsus hujjatlar ustun.*
