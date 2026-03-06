from fastapi import FastAPI
from pydantic import BaseModel, Field

from app.search_engine import SearchEngine

app = FastAPI(title="Search Service", version="1.0.0")
engine = SearchEngine()


class SearchRequest(BaseModel):
    query: str
    filters: dict[str, str | int] | None = None
    size: int = Field(default=20, ge=1, le=100)


class IndexRequest(BaseModel):
    id: int
    title: str
    problem: str
    proposal: str
    annotation: str
    conclusion: str
    keywords: list[str] = Field(default_factory=list)
    status: str
    scientific_direction_id: int
    university_id: int
    author_id: int
    supervisor_id: int | None = None
    defense_date: str | None = None


@app.on_event("startup")
def startup() -> None:
    engine.ensure_index()


@app.get("/health")
def health() -> dict[str, bool]:
    return {"ok": True}


@app.post("/index/dissertation")
def index_dissertation(payload: IndexRequest) -> dict[str, bool]:
    engine.index_document(str(payload.id), payload.model_dump())
    return {"indexed": True}


@app.post("/search")
def search(payload: SearchRequest) -> dict:
    return engine.search(payload.query, payload.filters, payload.size)
