from datetime import date
from pathlib import Path
from typing import Literal

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status as http_status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db_dep, require_roles
from app.core.config import settings
from app.models.entities import DissertationStatus, RoleName, User
from app.repositories.dissertation_repository import DissertationRepository
from app.repositories.user_repository import UserRepository
from app.schemas.dissertation import (
    DissertationCreate,
    DissertationDetailRead,
    DissertationFilter,
    DissertationRead,
    DissertationUpdate,
)
from app.services.dissertation_document_service import DissertationDocumentService
from app.services.dissertation_service import DissertationService

router = APIRouter()


def _resolve_author_id(current_user: User, requested_author_id: int | None) -> int:
    is_admin = current_user.role.name == RoleName.ADMIN
    if is_admin and requested_author_id is not None:
        return requested_author_id
    return current_user.id


def _normalize_keywords(raw_keywords: str | None) -> list[str]:
    if not raw_keywords:
        return []
    return [token.strip() for token in raw_keywords.split(",") if token.strip()]


def _validate_user_refs(db: Session, author_id: int, supervisor_id: int | None) -> None:
    user_repo = UserRepository(db)
    if user_repo.get_by_id(author_id) is None:
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail="Author user not found")
    if supervisor_id is not None and user_repo.get_by_id(supervisor_id) is None:
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail="Supervisor user not found")


@router.post("/", response_model=DissertationDetailRead)
def create_dissertation(
    payload: DissertationCreate,
    db: Session = Depends(get_db_dep),
    current_user: User = Depends(require_roles(RoleName.ADMIN, RoleName.DOCTORANT)),
) -> DissertationDetailRead:
    repo = DissertationRepository(db)
    service = DissertationService(repo)

    payload_data = payload.model_dump(exclude={"author_id"})
    payload_data["author_id"] = _resolve_author_id(current_user, payload.author_id)
    _validate_user_refs(db, payload_data["author_id"], payload_data.get("supervisor_id"))
    dissertation = service.create(payload_data)
    return dissertation


@router.post("/submit", response_model=DissertationDetailRead)
def create_dissertation_with_files(
    title: str = Form(...),
    scientific_direction_id: int = Form(...),
    university_id: int = Form(...),
    author_id: int | None = Form(default=None),
    supervisor_id: int | None = Form(default=None),
    region_id: int | None = Form(default=None),
    problem: str = Form(...),
    proposal: str = Form(...),
    annotation: str = Form(...),
    conclusion: str = Form(...),
    keywords: str = Form(default=""),
    defense_date: date | None = Form(default=None),
    category: str = Form(default="general"),
    expert_rating: float = Form(default=0.0),
    visibility: str = Form(default="internal"),
    status: DissertationStatus = Form(default=DissertationStatus.DRAFT),
    autoreferat_text: str | None = Form(default=None),
    autoreferat_file: UploadFile | None = File(default=None),
    dissertation_pdf_file: UploadFile | None = File(default=None),
    dissertation_word_file: UploadFile | None = File(default=None),
    db: Session = Depends(get_db_dep),
    current_user: User = Depends(require_roles(RoleName.ADMIN, RoleName.DOCTORANT)),
) -> DissertationDetailRead:
    repo = DissertationRepository(db)
    service = DissertationService(repo)

    payload = {
        "title": title,
        "scientific_direction_id": scientific_direction_id,
        "university_id": university_id,
        "author_id": _resolve_author_id(current_user, author_id),
        "supervisor_id": supervisor_id,
        "region_id": region_id,
        "problem": problem,
        "proposal": proposal,
        "annotation": annotation,
        "conclusion": conclusion,
        "keywords": _normalize_keywords(keywords),
        "defense_date": defense_date,
        "category": category,
        "expert_rating": expert_rating,
        "visibility": visibility,
        "status": status,
    }
    _validate_user_refs(db, payload["author_id"], payload["supervisor_id"])

    try:
        dissertation = service.create_with_documents(
            payload,
            autoreferat_text=autoreferat_text,
            autoreferat_file=autoreferat_file,
            dissertation_pdf_file=dissertation_pdf_file,
            dissertation_word_file=dissertation_word_file,
        )
    except ValueError as exc:
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return dissertation


@router.get("/", response_model=list[DissertationRead])
def list_dissertations(
    scientific_direction_id: int | None = None,
    university_id: int | None = None,
    author_id: int | None = None,
    supervisor_id: int | None = None,
    year: int | None = None,
    status: DissertationStatus | None = Query(default=None),
    query: str | None = None,
    title: str | None = None,
    problem: str | None = None,
    proposal: str | None = None,
    annotation: str | None = None,
    conclusion: str | None = None,
    keywords: str | None = None,
    author: str | None = None,
    supervisor: str | None = None,
    category: str | None = None,
    expert_rating_min: float | None = None,
    region_id: int | None = None,
    visibility: str | None = None,
    db: Session = Depends(get_db_dep),
    _: User = Depends(get_current_user),
) -> list[DissertationRead]:
    filters = DissertationFilter(
        scientific_direction_id=scientific_direction_id,
        university_id=university_id,
        author_id=author_id,
        supervisor_id=supervisor_id,
        year=year,
        status=status,
        query=query,
        title=title,
        problem=problem,
        proposal=proposal,
        annotation=annotation,
        conclusion=conclusion,
        keywords=keywords,
        author=author,
        supervisor=supervisor,
        category=category,
        expert_rating_min=expert_rating_min,
        region_id=region_id,
        visibility=visibility,
    )
    repo = DissertationRepository(db)
    return DissertationService(repo).list(filters)


@router.get("/{dissertation_id}", response_model=DissertationDetailRead)
def get_dissertation(
    dissertation_id: int,
    db: Session = Depends(get_db_dep),
    _: User = Depends(get_current_user),
) -> DissertationDetailRead:
    obj = DissertationRepository(db).get(dissertation_id)
    if obj is None:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Dissertation not found")
    return obj


@router.get("/{dissertation_id}/files/{file_kind}")
def get_dissertation_file(
    dissertation_id: int,
    file_kind: Literal["autoreferat", "pdf", "word"],
    db: Session = Depends(get_db_dep),
    _: User = Depends(get_current_user),
):
    repo = DissertationRepository(db)
    dissertation = repo.get(dissertation_id)
    if dissertation is None:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Dissertation not found")

    document = repo.get_document(dissertation_id)
    if document is None:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="File is not attached")

    file_map = {
        "autoreferat": (document.autoreferat_file_path, document.autoreferat_file_name, "application/octet-stream"),
        "pdf": (document.dissertation_pdf_file_path, document.dissertation_pdf_file_name, "application/pdf"),
        "word": (document.dissertation_word_file_path, document.dissertation_word_file_name, "application/octet-stream"),
    }
    raw_path, original_name, media_type = file_map[file_kind]
    file_service = DissertationDocumentService(Path(settings.file_storage_path))
    resolved = file_service.resolve_file(raw_path)
    if resolved is None:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="File not found")

    filename = original_name or resolved.name
    return FileResponse(path=resolved, media_type=media_type, filename=filename)


@router.put("/{dissertation_id}", response_model=DissertationDetailRead)
def update_dissertation(
    dissertation_id: int,
    payload: DissertationUpdate,
    db: Session = Depends(get_db_dep),
    current_user: User = Depends(get_current_user),
) -> DissertationDetailRead:
    repo = DissertationRepository(db)
    existing = repo.get(dissertation_id)
    if existing is None:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Dissertation not found")

    update_payload = payload.model_dump(exclude_unset=True)
    if current_user.role.name == RoleName.DOCTORANT:
        if existing.author_id != current_user.id:
            raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail="Cannot edit another author's dissertation")
        if "author_id" in update_payload and update_payload["author_id"] != current_user.id:
            raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail="Cannot reassign dissertation author")

    if current_user.role.name != RoleName.ADMIN and "author_id" in update_payload:
        update_payload["author_id"] = existing.author_id

    target_author_id = update_payload.get("author_id", existing.author_id)
    target_supervisor_id = update_payload.get("supervisor_id", existing.supervisor_id)
    _validate_user_refs(db, target_author_id, target_supervisor_id)

    service = DissertationService(repo)
    updated = service.update(dissertation_id, update_payload)
    if updated is None:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Dissertation not found")
    return updated


@router.patch("/{dissertation_id}/moderate", response_model=DissertationRead)
def moderate_dissertation(
    dissertation_id: int,
    status_value: DissertationStatus,
    db: Session = Depends(get_db_dep),
    _: User = Depends(require_roles(RoleName.MODERATOR, RoleName.ADMIN)),
) -> DissertationRead:
    if status_value not in {DissertationStatus.APPROVED, DissertationStatus.REJECTED, DissertationStatus.PENDING}:
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail="Unsupported moderation status")

    repo = DissertationRepository(db)
    updated = DissertationService(repo).update(dissertation_id, {"status": status_value})
    if updated is None:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Dissertation not found")
    return updated


@router.delete("/{dissertation_id}")
def delete_dissertation(
    dissertation_id: int,
    db: Session = Depends(get_db_dep),
    _: User = Depends(require_roles(RoleName.ADMIN)),
) -> dict[str, bool]:
    file_service = DissertationDocumentService(Path(settings.file_storage_path))
    file_service.cleanup_dissertation_files(dissertation_id)
    if not DissertationRepository(db).delete(dissertation_id):
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Dissertation not found")
    return {"deleted": True}
