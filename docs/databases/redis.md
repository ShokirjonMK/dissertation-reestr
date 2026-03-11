# Redis

**Versiya:** Redis 7 (Alpine)
**Port:** 6379
**Papka:** `databases/redis/`

---

## Konfiguratsiya

**docker-compose.yml:**
```yaml
redis:
  image: redis:7-alpine
  command: ["redis-server", "/usr/local/etc/redis/redis.conf"]
  volumes:
    - ./volumes/redis-data:/data
    - ./databases/redis/redis.conf:/usr/local/etc/redis/redis.conf:ro
```

**Ulanish URL (.env):**
```
REDIS_URL=redis://redis:6379/0
```

---

## redis.conf asosiy sozlamalar

```
# AOF (Append Only File) saqlash
appendonly yes
appendfilename "appendonly.aof"

# LRU eviction
maxmemory-policy allkeys-lru

# Parol (agar kerak bo'lsa)
# requirepass your_password
```

---

## Joriy foydalanish

Redis infratuzilmada tayyor, kesh va sessiya kengaytmalariga tayyorlab qo'yilgan:

- **Sessiya kesh**: JWT tokenlar uchun blacklist (ishlab chiqarishda)
- **API kesh**: Ko'p so'raladigan ma'lumotlar uchun
- **Rate limiting**: API so'rovlari cheklovlari
- **Task queue**: Background vazifalar uchun (kelajak)

---

## Tekshirish buyruqlari

```bash
# Redis konteyneriga kirish
docker compose exec redis redis-cli

# Ping test
docker compose exec redis redis-cli ping
# PONG

# Barcha kalitlar
docker compose exec redis redis-cli keys "*"

# Ma'lumot hajmi
docker compose exec redis redis-cli info memory

# Monitoring
docker compose exec redis redis-cli monitor
```

---

## Persistent volume

Redis ma'lumotlari `./volumes/redis-data/` da saqlanadi (AOF orqali).
