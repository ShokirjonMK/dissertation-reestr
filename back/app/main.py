from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, catalogs, dissertations, health, search, users
from app.core.config import settings
from app.core.database import Base, engine
from app.services.reindex_service import sync_dissertations_to_search
from app.services.seed_service import bootstrap_defaults

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Dissertation Registry API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(catalogs.router, prefix="/api/v1/catalogs", tags=["catalogs"])
app.include_router(dissertations.router, prefix="/api/v1/dissertations", tags=["dissertations"])
app.include_router(search.router, prefix="/api/v1", tags=["search-ai"])


@app.on_event("startup")
def on_startup() -> None:
    bootstrap_defaults()
    sync_dissertations_to_search()
