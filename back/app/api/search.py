import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db_dep
from app.core.config import settings
from app.models.entities import User
from app.schemas.search import AskRequest, AskResponse, SearchRequest
from app.services.search_sync_service import ask_ai, query_search

router = APIRouter()


@router.post("/search")
def search(
    payload: SearchRequest,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db_dep),
):
    _ = db
    try:
        return query_search(payload.model_dump())
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Search service unavailable: {exc}") from exc


@router.get("/search/problems-proposals")
def search_problems_proposals(
    q: str = Query(..., min_length=2),
    search_type: str = Query("both", alias="type", pattern="^(problems|proposals|both)$"),
    field: str | None = None,
    year_from: int | None = None,
    year_to: int | None = None,
    degree: str | None = None,
    university_id: str | None = None,
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=50),
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db_dep),
) -> dict:
    _ = db
    params: dict[str, str | int] = {"q": q, "type": search_type, "page": page, "size": size}
    if field is not None:
        params["field"] = field
    if year_from is not None:
        params["year_from"] = year_from
    if year_to is not None:
        params["year_to"] = year_to
    if degree is not None:
        params["degree"] = degree
    if university_id is not None:
        params["university_id"] = university_id
    try:
        with httpx.Client(timeout=20.0) as client:
            response = client.get(f"{settings.search_service_url}/search/problems-proposals", params=params)
            response.raise_for_status()
            return response.json()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Search service unavailable: {exc}") from exc


@router.post("/ai/ask", response_model=AskResponse)
def ask(
    payload: AskRequest,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db_dep),
) -> AskResponse:
    _ = db
    try:
        data = ask_ai(payload.model_dump())
        return AskResponse(**data)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"AI service unavailable: {exc}") from exc
