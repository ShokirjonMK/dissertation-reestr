from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    query: str
    filters: dict[str, str | int] | None = None
    size: int = 20


class SearchHit(BaseModel):
    id: str
    score: float
    source: dict


class SearchResponse(BaseModel):
    total: int
    hits: list[SearchHit]


class AskRequest(BaseModel):
    question: str = Field(min_length=5)
    top_k: int = 5


class AskResponse(BaseModel):
    answer: str
    references: list[dict]
