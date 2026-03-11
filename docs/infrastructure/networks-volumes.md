# Tarmoqlar va Volumelar

## Tarmoqlar (Networks)

```
┌────────────────────────────────────────────────────────┐
│  proxy_network                                         │
│  ┌──────────┐                                          │
│  │ frontend │                                          │
│  └──────────┘                                          │
├────────────────────────────────────────────────────────┤
│  backend_network                                       │
│  ┌──────────┐  ┌──────────┐                           │
│  │ frontend │  │ backend  │                           │
│  └──────────┘  └──────────┘                           │
├────────────────────────────────────────────────────────┤
│  services_network                                      │
│  ┌──────────┐ ┌────────┐ ┌────┐ ┌─────────────┐      │
│  │ backend  │ │ search │ │ ai │ │ integration │      │
│  └──────────┘ └────────┘ └────┘ └─────────────┘      │
├────────────────────────────────────────────────────────┤
│  database_network                                      │
│  ┌──────────┐ ┌────────┐ ┌────────────────┐ ┌───────┐│
│  │ backend  │ │ search │ │ elasticsearch  │ │ redis ││
│  └──────────┘ └────────┘ └────────────────┘ └───────┘│
│                          ┌──────────┐                  │
│                          │ postgres │                  │
│                          └──────────┘                  │
└────────────────────────────────────────────────────────┘
```

### Tarmoq izolyatsiyasi

| Tarmoq | Servislar | Vazifa |
|--------|-----------|--------|
| `proxy_network` | frontend | Tashqi so'rovlar uchun |
| `backend_network` | frontend, backend | Frontend-backend muloqoti |
| `services_network` | backend, search, ai, integration | Mikroservislar muloqoti |
| `database_network` | backend, search, postgres, elasticsearch, redis | Ma'lumotlar bazasiga kirish |

**Xavfsizlik prinsipi:** Har bir servis faqat o'z vazifasi uchun kerak bo'lgan tarmoqlarga kiradi.

---

## Volumelar (Persistent Storage)

```
volumes/
├── postgres-data/
│   └── data/              # PostgreSQL ma'lumotlar fayllari
├── elastic-data/          # Elasticsearch indeks fayllari
├── redis-data/            # Redis AOF va snapshot fayllari
├── portainer-data/        # Portainer konfiguratsiyasi
├── nginx-data/            # NGINX Proxy Manager ma'lumotlari
└── backend-storage/
    └── dissertations/     # Yuklangan fayllar
        └── {id}/
            ├── autoreferat_{uuid}.pdf
            ├── dissertation_{uuid}.pdf
            └── dissertation_{uuid}.docx
```

### Volume xaritasi (docker-compose.yml)

| Servis | Host path | Konteyner path |
|--------|-----------|----------------|
| postgres | `./volumes/postgres-data/data` | `/var/lib/postgresql/data` |
| elasticsearch | `./volumes/elastic-data` | `/usr/share/elasticsearch/data` |
| redis | `./volumes/redis-data` | `/data` |
| backend | `./volumes/backend-storage` | `/app/storage` |

---

## Muhim eslatmalar

### Development
- Bind mount ishlatiladi — papkalar host'da saqlanadi
- `volumes/` papkasini `.gitignore` da saqlang (allaqachon qo'shilgan)
- Ma'lumotlar yo'qolmasin uchun `docker compose down` ishlatganda `-v` flagini qo'shmang

### Production (Docker Swarm)
```bash
# Named volumes ishlatish tavsiya etiladi
docker volume create postgres_data
docker volume create elastic_data
```

---

## Backup

```bash
# PostgreSQL backup
docker compose exec postgres pg_dump \
  -U registry_user dissertation_registry \
  > backup_$(date +%Y%m%d_%H%M%S).sql

# Fayllar backup
tar -czf files_backup_$(date +%Y%m%d).tar.gz volumes/backend-storage/

# Elasticsearch backup (snapshot API)
curl -u elastic:elasticpassword -X PUT \
  "http://localhost:9200/_snapshot/backup" \
  -H "Content-Type: application/json" \
  -d '{"type": "fs", "settings": {"location": "/mnt/backup"}}'
```
