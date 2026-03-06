from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db_dep, require_roles
from app.models.entities import DissertationStatus, RoleName, User
from app.repositories.dissertation_repository import DissertationRepository
from app.schemas.dissertation import DissertationCreate, DissertationFilter, DissertationRead, DissertationUpdate
from app.services.dissertation_service import DissertationService

router = APIRouter()


@router.post("/", response_model=DissertationRead)
def create_dissertation(
    payload: DissertationCreate,
    db: Session = Depends(get_db_dep),
    current_user: User = Depends(require_roles(RoleName.ADMIN, RoleName.DOCTORANT)),
) -> DissertationRead:
    repo = DissertationRepository(db)
    service = DissertationService(repo)
    dissertation = service.create({**payload.model_dump(), "author_id": current_user.id})
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
    )
    repo = DissertationRepository(db)
    return DissertationService(repo).list(filters)


@router.get("/{dissertation_id}", response_model=DissertationRead)
def get_dissertation(
    dissertation_id: int,
    db: Session = Depends(get_db_dep),
    _: User = Depends(get_current_user),
) -> DissertationRead:
    obj = DissertationRepository(db).get(dissertation_id)
    if obj is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dissertation not found")
    return obj


@router.put("/{dissertation_id}", response_model=DissertationRead)
def update_dissertation(
    dissertation_id: int,
    payload: DissertationUpdate,
    db: Session = Depends(get_db_dep),
    current_user: User = Depends(get_current_user),
) -> DissertationRead:
    repo = DissertationRepository(db)
    existing = repo.get(dissertation_id)
    if existing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dissertation not found")

    if current_user.role.name == RoleName.DOCTORANT and existing.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot edit another author's dissertation")

    service = DissertationService(repo)
    updated = service.update(dissertation_id, payload.model_dump(exclude_unset=True))
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dissertation not found")
    return updated


@router.patch("/{dissertation_id}/moderate", response_model=DissertationRead)
def moderate_dissertation(
    dissertation_id: int,
    status_value: DissertationStatus,
    db: Session = Depends(get_db_dep),
    _: User = Depends(require_roles(RoleName.MODERATOR, RoleName.ADMIN)),
) -> DissertationRead:
    if status_value not in {DissertationStatus.APPROVED, DissertationStatus.REJECTED, DissertationStatus.PENDING}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported moderation status")

    repo = DissertationRepository(db)
    updated = DissertationService(repo).update(dissertation_id, {"status": status_value})
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dissertation not found")
    return updated


@router.delete("/{dissertation_id}")
def delete_dissertation(
    dissertation_id: int,
    db: Session = Depends(get_db_dep),
    _: User = Depends(require_roles(RoleName.ADMIN)),
) -> dict[str, bool]:
    if not DissertationRepository(db).delete(dissertation_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dissertation not found")
    return {"deleted": True}
