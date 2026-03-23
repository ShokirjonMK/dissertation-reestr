# Backend Arxitekturasi

**Texnologiya:** FastAPI (Python 3.13+)
**Port:** 8000
**Swagger UI:** http://localhost:8000/docs

---

## Qatlamli arxitektura

```
HTTP so'rov
    ↓
api/ (Route handlers)
    ↓
schemas/ (Validatsiya - Pydantic)
    ↓
services/ (Biznes logika)
    ↓
repositories/ (Ma'lumotlar bazasi so'rovlari)
    ↓
models/ (SQLAlchemy ORM)
    ↓
PostgreSQL
```

---

## Papka tuzilishi

```
back/app/
├── main.py              # FastAPI app, middleware, routerlar
├── api/
│   ├── health.py        # GET /health
│   ├── auth.py          # Login, /me, OneID callback
│   ├── users.py         # Foydalanuvchilar CRUD
│   ├── catalogs.py      # Yo'nalishlar, universitetlar, regionlar
│   ├── dissertations.py # Dissertatsiyalar CRUD + moderatsiya
│   ├── dissertation_content.py  # Strukturalangan muammo/takliflar + extract
│   ├── implementation_proposals.py  # Amaliyot takliflari API
│   ├── search.py        # Qidiruv, AI, problems-proposals qidiruvi
│   └── deps.py          # Dependency injection
│
├── schemas/
│   ├── auth.py          # LoginRequest, TokenResponse
│   ├── user.py          # UserCreate, UserRead
│   ├── dissertation.py  # DissertationCreate, DissertationRead, ...
│   ├── catalogs.py      # ScientificDirectionCreate, ...
│   ├── search.py        # SearchRequest, AskRequest
│   ├── dissertation_content.py
│   └── implementation_proposal.py
│
├── models/
│   ├── entities.py      # Asosiy ORM (User, Dissertation, ...)
│   ├── dissertation_content.py   # DissertationProblem, DissertationProposalContent
│   └── implementation_proposal.py  # ImplementationProposal, ProposalStatusHistory
│
├── ai/
│   └── extractor.py     # PDF/DOCX matn + AI extract chaqiruvi
│
├── repositories/
│   ├── dissertation_repository.py
│   ├── user_repository.py
│   └── catalog_repository.py
│
├── services/
│   ├── auth_service.py              # authenticate_user, register_user
│   ├── dissertation_service.py      # create, update, list
│   ├── dissertation_document_service.py  # Fayl yuklash/saqlash
│   ├── reindex_service.py           # Elasticsearch sinxronizatsiya
│   ├── search_sync_service.py       # Search va AI servislarga proxy
│   ├── dissertation_content_service.py
│   ├── implementation_proposal_service.py
│   └── seed_service.py              # bootstrap_defaults()
│
├── integrations/
│   ├── oneid_client.py              # OneID OAuth (stub)
│   ├── hr_client.py                 # HR sistema (stub)
│   └── passport_client.py           # Pasport tekshiruvi (stub)
│
└── core/
    ├── config.py                    # Pydantic Settings (.env)
    ├── database.py                  # SQLAlchemy engine, SessionLocal
    └── security.py                  # JWT, bcrypt
```

---

## Ishga tushish jarayoni

```python
# main.py
Base.metadata.create_all(bind=engine)  # Jadvallar yaratish

@app.on_event("startup")
def on_startup():
    bootstrap_defaults()           # Seed data
    sync_dissertations_to_search() # Elasticsearch indekslash
```

---

## API routerlar

| Router | Prefix | Tags |
|--------|--------|------|
| health | `/api/v1` | health |
| auth | `/api/v1/auth` | auth |
| users | `/api/v1/users` | users |
| catalogs | `/api/v1/catalogs` | catalogs |
| dissertations | `/api/v1/dissertations` | dissertations |
| search | `/api/v1` | search-ai |

---

## Dependency Injection

### get_db_dep
```python
def get_db_dep():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### get_current_user
```python
def get_current_user(token: str = Depends(oauth2_scheme), db = Depends(get_db_dep)):
    # JWT decode → user_id → DB lookup
    return user
```

### require_roles
```python
def require_roles(*roles: RoleName):
    def checker(user = Depends(get_current_user)):
        if user.role.name not in roles:
            raise HTTPException(403, "Insufficient permissions")
        return user
    return checker
```

---

## CORS konfiguratsiya

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Sozlamalar (core/config.py)

```python
class Settings(BaseSettings):
    db_url: str
    redis_url: str
    elastic_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 120
    file_storage_path: str = "/app/storage"
    ai_service_url: str
    search_service_url: str
    integration_service_url: str
    cors_origins: list[str]

    class Config:
        env_file = ".env"
```

---

## Fayl saqlash

```python
# DissertationDocumentService
class DissertationDocumentService:
    def __init__(self, storage_path: Path):
        self.storage_path = storage_path

    def save_file(self, dissertation_id, file, prefix):
        # {storage_path}/dissertations/{id}/{prefix}_{uuid}.ext
        ...
```

---

## Xatolarni qayta ishlash

FastAPI avtomatik `422 Unprocessable Entity` qaytaradi Pydantic validatsiya xatosi bo'lganda.

Qo'lda `HTTPException` ishlatiladigan holatlar:
- `404`: Topilmadi
- `400`: Noto'g'ri kirish
- `403`: Ruxsat yo'q
- `401`: Token yo'q/noto'g'ri
