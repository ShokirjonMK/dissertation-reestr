# PostgreSQL

**Versiya:** PostgreSQL 16
**Port:** 5432
**Papka:** `databases/postgres/`

---

## Konfiguratsiya

**docker-compose.yml:**
```yaml
postgres:
  image: postgres:16
  environment:
    POSTGRES_DB: dissertation_registry
    POSTGRES_USER: registry_user
    POSTGRES_PASSWORD: registry_password
  volumes:
    - ./volumes/postgres-data/data:/var/lib/postgresql/data
    - ./databases/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
```

**Ulanish URL (.env):**
```
DB_URL=postgresql+psycopg2://registry_user:registry_password@postgres:5432/dissertation_registry
```

---

## Jadvallar ro'yxati

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

| Jadval | Tavsif |
|--------|--------|
| `roles` | Foydalanuvchi rollari |
| `users` | Foydalanuvchilar |
| `user_profiles` | Profil ma'lumotlari |
| `scientific_directions` | Ilmiy yo'nalishlar |
| `universities` | Universitetlar |
| `regions` | Regionlar |
| `districts` | Tumanlar |
| `dissertations` | Dissertatsiyalar |
| `dissertation_documents` | Dissertatsiya fayllar |

---

## init.sql

`databases/postgres/init.sql` fayli PostgreSQL ishga tushganda avtomatik bajariladi:

```sql
-- Kengaytmalar
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
```

`pg_trgm` — matn o'xshashlik qidiruvida ishlatiladi.
`unaccent` — diakritik belgilarni hisobga olmagan qidiruvda.

---

## Standart ma'lumotlar (Seed)

Backend ishga tushganda `bootstrap_defaults()` chaqiriladi:

**Rollar:** admin, moderator, doctorant, supervisor, employee

**Foydalanuvchilar:**
- admin / admin@registry.uz / admin12345
- moderator / moderator@adliya.uz / moderator123
- doctorant / doctorant@registry.uz / doctorant123
- supervisor / supervisor@registry.uz / supervisor123
- employee / employee@adliya.uz / employee123

**Ilmiy yo'nalishlar:** Constitutional Law, Civil Law, Criminal Law

**Universitetlar:** TSUL, NUUz

**Regionlar:** Toshkent shahri, Samarqand viloyati, Farg'ona viloyati

**Namunaviy dissertatsiyalar:** 2 ta

---

## Foydali buyruqlar

```bash
# Postgres konteyneriga kirish
docker compose exec postgres psql -U registry_user dissertation_registry

# Jadvallar ro'yxati
\dt

# Foydalanuvchilar
SELECT id, username, email FROM users;

# Dissertatsiyalar holat bo'yicha
SELECT status, COUNT(*) FROM dissertations GROUP BY status;

# Backup
docker compose exec postgres pg_dump -U registry_user dissertation_registry > backup.sql

# Restore
docker compose exec -T postgres psql -U registry_user dissertation_registry < backup.sql
```

---

## Migratsiyalar (Alembic)

Hozirda schema `SQLAlchemy` orqali avtomatik yaratiladi (`Base.metadata.create_all`).

Kelajakda Alembic migratsiyalari:
```bash
cd back
alembic init migrations
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

---

## Persistent volume

PostgreSQL ma'lumotlari `./volumes/postgres-data/data/` da saqlanadi.

Bu papkani **o'chirmaslik** kerak — aks holda barcha ma'lumotlar yo'qoladi!
