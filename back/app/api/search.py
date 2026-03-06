from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db_dep
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
