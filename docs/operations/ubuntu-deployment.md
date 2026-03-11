# Ubuntu Serverda Tizimni Ishga Tushirish

## Server talablari

| Resurs | Minimal | Tavsiya |
|--------|---------|---------|
| CPU | 4 core | 8 core |
| RAM | 8 GB | 16 GB |
| Disk | 50 GB | 100 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Internet | Mavjud | Mavjud |

> Elasticsearch yolg'iz kamida 2 GB RAM talab qiladi. Minimal konfiguratsiyada `ES_JAVA_OPTS=-Xms512m -Xmx512m` sozlash kerak.

---

## 1. Serverga kirish

```bash
ssh ubuntu@your_server_ip
# yoki
ssh root@your_server_ip
```

---

## 2. Tizimni yangilash

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git nano ufw htop
```

---

## 3. Docker o'rnatish

```bash
# Eski versiyalarni o'chirish
sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null

# Docker rasmiy repozitoriyasini qo'shish
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker o'rnatish
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Versiyani tekshirish
docker --version
docker compose version

# Joriy foydalanuvchini docker guruhiga qo'shish (sudo siz ishlatish)
sudo usermod -aG docker $USER
newgrp docker
```

---

## 4. Elasticsearch tizim sozlamalari

```bash
# vm.max_map_count ni sozlash (Elasticsearch uchun majburiy)
sudo sysctl -w vm.max_map_count=262144
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf

# Tekshirish
sysctl vm.max_map_count
```

---

## 5. Loyihani yuklash

```bash
# Repozitoriyni klonlash
cd /opt
sudo git clone https://github.com/your-org/dissertation-registry.git
sudo chown -R $USER:$USER dissertation-registry
cd dissertation-registry
```

Yoki arxivdan:
```bash
# Arxivni serverga ko'chirish
scp dissertation-registry.tar.gz ubuntu@your_server_ip:/opt/

# Serverda ochish
cd /opt
tar -xzf dissertation-registry.tar.gz
cd dissertation-registry
```

---

## 6. Muhit o'zgaruvchilarini sozlash

```bash
cp .env.example .env
nano .env
```

**Muhim o'zgartirishlar (ishlab chiqarish uchun):**

```bash
# Xavfsiz parollar o'rnating!
POSTGRES_PASSWORD=SuperSecurePassword123!
ELASTIC_PASSWORD=ElasticSecurePass456!
JWT_SECRET=your-very-long-random-secret-key-minimum-32-chars

# Server URL manzilini sozlash
ONEID_REDIRECT_URI=https://your-domain.uz/api/v1/auth/oneid/callback

# CORS sozlash (frontend domeningiz)
CORS_ORIGINS=["https://your-domain.uz","https://www.your-domain.uz"]
```

Xavfsiz JWT secret yaratish:
```bash
openssl rand -hex 32
```

---

## 7. Fayllar papkasini yaratish

```bash
mkdir -p volumes/backend-storage/dissertations
mkdir -p volumes/postgres-data/data
mkdir -p volumes/elastic-data
mkdir -p volumes/redis-data
mkdir -p volumes/portainer-data
mkdir -p volumes/nginx-data
```

---

## 8. Tizimni ishga tushirish

```bash
# Build va ishga tushirish
docker compose up -d --build

# Holat kuzatish
docker compose ps

# Loglarni ko'rish (birinchi ishga tushirishda)
docker compose logs -f
```

**Kutish vaqti:** Birinchi marta ~5-10 daqiqa (imaglar yuklanadi, build bo'ladi).

---

## 9. Holat tekshirish

```bash
# Barcha servislar running holatda bo'lishi kerak
docker compose ps

# Health check
curl http://localhost:8000/api/v1/health
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8003/health

# Login test
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin12345"}'
```

---

## 10. Xavfsizlik devori (UFW) sozlash

```bash
# UFW ni yoqish
sudo ufw enable

# SSH ga ruxsat
sudo ufw allow ssh

# HTTP va HTTPS
sudo ufw allow 80
sudo ufw allow 443

# NGINX Proxy Manager admin panel
sudo ufw allow 81

# Portainer (agar tashqi kirish kerak bo'lsa)
sudo ufw allow 9000

# Ma'lumotlar bazalari portlarini ochmaslik (faqat ichki)
# 5432, 9200, 6379 — ochmaslik

# Holat
sudo ufw status verbose
```

---

## 11. NGINX Proxy Manager o'rnatish

```bash
cd /opt/dissertation-registry/infra/nginx/nginx-proxy-manager
docker compose up -d
```

**Kirish:** `http://your_server_ip:81`

**Birinchi kirish:**
- Email: `admin@example.com`
- Parol: `changeme`

**Domen sozlash:**
1. "Proxy Hosts" → "Add Proxy Host"
2. Domain Names: `your-domain.uz`
3. Forward Hostname/IP: `frontend`
4. Forward Port: `3000`
5. SSL tab → "Request a new SSL Certificate" (Let's Encrypt)

**Backend API uchun:**
1. Domain: `api.your-domain.uz`
2. Forward: `backend` → `8000`

---

## 12. Portainer o'rnatish (ixtiyoriy)

```bash
cd /opt/dissertation-registry/infra/portainer
docker compose up -d
```

**Kirish:** `http://your_server_ip:9000`

---

## 13. Systemd avtomatik ishga tushirish

```bash
# Systemd service yaratish
sudo nano /etc/systemd/system/dissertation-registry.service
```

```ini
[Unit]
Description=Dissertation Registry System
Requires=docker.service
After=docker.service

[Service]
Type=forking
RemainAfterExit=yes
WorkingDirectory=/opt/dissertation-registry
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose stop
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
```

```bash
# Servisni yoqish
sudo systemctl daemon-reload
sudo systemctl enable dissertation-registry
sudo systemctl start dissertation-registry

# Holat
sudo systemctl status dissertation-registry
```

---

## 14. Avtomatik backup sozlash

```bash
# Backup skriptini yaratish
sudo nano /opt/backup-dissertation.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/dissertation"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# PostgreSQL backup
docker compose -f /opt/dissertation-registry/docker-compose.yml \
  exec -T postgres pg_dump \
  -U registry_user dissertation_registry \
  > "$BACKUP_DIR/postgres_$DATE.sql"

# Fayllar backup
tar -czf "$BACKUP_DIR/files_$DATE.tar.gz" \
  /opt/dissertation-registry/volumes/backend-storage/

# Eski backuplarni o'chirish (30 kundan eski)
find $BACKUP_DIR -mtime +30 -delete

echo "Backup muvaffaqiyatli: $DATE"
```

```bash
sudo chmod +x /opt/backup-dissertation.sh

# Cron job (har kuni soat 02:00 da)
sudo crontab -e
```

Quyidagini qo'shing:
```
0 2 * * * /opt/backup-dissertation.sh >> /var/log/dissertation-backup.log 2>&1
```

---

## 15. Monitoring (ixtiyoriy)

```bash
# htop — tizim resurslari
htop

# Docker stats — konteyner resurslari
docker stats

# Disk holati
df -h

# Log hajmi
du -sh /opt/dissertation-registry/volumes/
```

---

## Docker Swarm (High Availability)

Agar bir nechta server bo'lsa:

```bash
# Asosiy serverda (manager)
docker swarm init --advertise-addr YOUR_SERVER_IP

# Qo'shilish uchun token olish
docker swarm join-token worker

# Ikkinchi serverda (worker)
docker swarm join --token WORKER_TOKEN MANAGER_IP:2377

# Stack deploy (manager serverda)
cd /opt/dissertation-registry
docker stack deploy -c infra/docker/stacks/core-stack.yml registry

# Holat
docker stack ps registry
docker stack services registry
```

---

## Muammolar

### Docker compose yuklanmaydi
```bash
docker compose logs -f
# Xatoni aniqlang
```

### Elasticsearch ishga tushmaydi
```bash
# vm.max_map_count ni tekshiring
sysctl vm.max_map_count
# 262144 bo'lishi kerak

# Agar bo'lmasa:
sudo sysctl -w vm.max_map_count=262144
docker compose restart elasticsearch
```

### Portlar band
```bash
sudo ss -tlnp | grep 8000
sudo ss -tlnp | grep 3000
# Band qilgan jarayonni toping va to'xtating
```

### Server RAM yetarli emas
```bash
# Elasticsearch heap ni kamaytirish
# docker-compose.yml da:
# ES_JAVA_OPTS=-Xms256m -Xmx256m (minimal)

# Yoki swap qo'shish
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## Yangilash (Update)

```bash
cd /opt/dissertation-registry

# Oxirgi o'zgarishlarni olish
git pull origin main

# Qayta build va restart
docker compose up -d --build

# Faqat bitta servisni yangilash
docker compose build backend
docker compose up -d backend
```

---

## Tekshirish ro'yxati

- [ ] Server talablariga mos (CPU, RAM, disk)
- [ ] Docker o'rnatilgan
- [ ] `vm.max_map_count=262144` sozlangan
- [ ] `.env` fayl to'ldirilgan (xavfsiz parollar)
- [ ] `docker compose up -d --build` muvaffaqiyatli
- [ ] Barcha servislar `running` holatda
- [ ] `GET /api/v1/health` → 200 OK
- [ ] Login muvaffaqiyatli
- [ ] UFW yoqilgan, portlar to'g'ri sozlangan
- [ ] NGINX Proxy Manager ishlaydi
- [ ] SSL sertifikat olindi
- [ ] Systemd service yoqilgan
- [ ] Backup cron job sozlangan
- [ ] Standart parollar o'zgartirilgan!
