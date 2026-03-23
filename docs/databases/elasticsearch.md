# Elasticsearch

**Versiya:** Elasticsearch 8.13.4
**Port:** 9200
**Papka:** `databases/elasticsearch/`

---

## Konfiguratsiya

**docker-compose.yml:**
```yaml
elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:8.13.4
  environment:
    - discovery.type=single-node
    - xpack.security.enabled=true
    - ELASTIC_PASSWORD=elasticpassword
    - ES_JAVA_OPTS=-Xms512m -Xmx512m
  volumes:
    - ./volumes/elastic-data:/usr/share/elasticsearch/data
    - ./databases/elasticsearch/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml:ro
```

**Ulanish URL (.env):**
```
ELASTIC_URL=http://elastic:elasticpassword@elasticsearch:9200
```

---

## Indeks

Indeks nomi: `dissertations`

**Indekslangan maydonlar:**

| Maydon | Tur | Tavsif |
|--------|-----|--------|
| id | integer | Dissertatsiya ID |
| title | text | Sarlavha |
| problem | text | Muammo |
| proposal | text | Taklif |
| annotation | text | Annotatsiya |
| conclusion | text | Xulosa |
| keywords | text[] | Kalit so'zlar |
| autoreferat_text | text | Avtoreferat matni |
| dissertation_word_text | text | Word matni |
| author_name | text | Muallif ismi |
| supervisor_name | text | Rahbar ismi |
| university_name | text | Universitet nomi |
| scientific_direction_name | text | Yo'nalish nomi |
| status | keyword | Holat |
| category | keyword | Kategoriya |
| visibility | keyword | Ko'rinuvchanlik |
| expert_rating | float | Ekspert reytingi |
| defense_date | date | Himoya sanasi |
| problems | nested | Strukturalangan muammolar (`order_num`, `problem_text`, `source_page`) |
| proposal_contents | nested | Strukturalangan takliflar (`order_num`, `proposal_text`, `source_page`) |

**Eslatma:** indeks avval yaratilgan bo'lsa va ushbu nested maydonlar yo'q bo'lsa, indeksni qayta yaratish yoki mapping yangilash talab etiladi — aks holda `GET /search/problems-proposals` to'g'ri ishlamasligi mumkin.

---

## Qidiruv rejimi

**Multi-match** so'rov barcha matn maydonlarida ishlaydi.

**Og'irliklar (boost):**
- title: 3.0
- keywords: 2.0
- problem, proposal: 2.0
- annotation, conclusion: 1.5
- boshqa matn maydonlar: 1.0

**Fuzzy qidiruv:** `fuzziness: AUTO` — imloviy xatolarga chidamli.

**Phrase match:** Aniq iboralar uchun.

---

## Tekshirish buyruqlari

```bash
# Elasticsearch holati
curl -u elastic:elasticpassword http://localhost:9200

# Indekslar ro'yxati
curl -u elastic:elasticpassword http://localhost:9200/_cat/indices

# Dissertatsiyalar soni
curl -u elastic:elasticpassword http://localhost:9200/dissertations/_count

# Qidiruv test
curl -u elastic:elasticpassword -X POST http://localhost:9200/dissertations/_search \
  -H "Content-Type: application/json" \
  -d '{"query": {"match": {"title": "raqamlashtirish"}}}'

# Indeksni o'chirish (ehtiyotkorlik!)
curl -u elastic:elasticpassword -X DELETE http://localhost:9200/dissertations
```

---

## Server talablari

Elasticsearch resurs talab qiladi:

| Parametr | Minimal | Tavsiya |
|----------|---------|---------|
| RAM | 1 GB (JVM heap) | 4 GB |
| CPU | 2 core | 4 core |
| Disk | 10 GB | 50 GB |

**Ishlab chiqarish uchun `vm.max_map_count` sozlash:**
```bash
sudo sysctl -w vm.max_map_count=262144
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
```

---

## Persistent volume

Elasticsearch ma'lumotlari `./volumes/elastic-data/` da saqlanadi.
