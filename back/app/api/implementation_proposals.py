from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db_dep, require_roles
from app.models.entities import RoleName, User
from app.models.implementation_proposal import ProposalStatus
from app.schemas.implementation_proposal import (
    ImplementationProposalCreate,
    ImplementationProposalList,
    ImplementationProposalOut,
    ImplementationProposalUpdate,
    RejectAction,
    ReviewAction,
    RevisionAction,
)
from app.services.implementation_proposal_service import ImplementationProposalService

router = APIRouter(prefix="/proposals")


def get_service(db: Session = Depends(get_db_dep)) -> ImplementationProposalService:
    return ImplementationProposalService(db)


@router.post("/", response_model=ImplementationProposalOut, status_code=status.HTTP_201_CREATED)
def create_proposal(
    data: ImplementationProposalCreate,
    current_user: User = Depends(get_current_user),
    service: ImplementationProposalService = Depends(get_service),
) -> ImplementationProposalOut:
    if current_user.role.name not in {
        RoleName.ADMIN,
        RoleName.MODERATOR,
        RoleName.EMPLOYEE,
        RoleName.DOCTORANT,
        RoleName.SUPERVISOR,
    }:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Ruxsat yo'q")
    return service.create(data, current_user.id)


@router.get("/my", response_model=ImplementationProposalList)
def my_proposals(
    status_filter: ProposalStatus | None = Query(default=None, alias="status"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    service: ImplementationProposalService = Depends(get_service),
) -> ImplementationProposalList:
    data = service.list(user_id=current_user.id, status_filter=status_filter, page=page, size=size)
    return ImplementationProposalList(**data)


@router.get("/pending", response_model=ImplementationProposalList)
def pending_proposals(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_roles(RoleName.ADMIN, RoleName.MODERATOR, RoleName.EMPLOYEE)),
    service: ImplementationProposalService = Depends(get_service),
) -> ImplementationProposalList:
    data = service.list(status_filter=ProposalStatus.submitted, page=page, size=size)
    return ImplementationProposalList(**data)


@router.get("/", response_model=ImplementationProposalList)
def list_proposals(
    status_filter: ProposalStatus | None = Query(default=None, alias="status"),
    dissertation_id: int | None = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_roles(RoleName.ADMIN, RoleName.MODERATOR, RoleName.EMPLOYEE)),
    service: ImplementationProposalService = Depends(get_service),
) -> ImplementationProposalList:
    data = service.list(
        status_filter=status_filter,
        dissertation_id=dissertation_id,
        page=page,
        size=size,
    )
    return ImplementationProposalList(**data)


@router.get("/{proposal_id}", response_model=ImplementationProposalOut)
def get_proposal(
    proposal_id: int,
    current_user: User = Depends(get_current_user),
    service: ImplementationProposalService = Depends(get_service),
) -> ImplementationProposalOut:
    proposal = service.get(proposal_id)
    if current_user.role.name not in {RoleName.ADMIN, RoleName.MODERATOR, RoleName.EMPLOYEE}:
        if proposal.proposed_by != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Ruxsat yo'q")
    return proposal


@router.put("/{proposal_id}", response_model=ImplementationProposalOut)
def update_proposal(
    proposal_id: int,
    data: ImplementationProposalUpdate,
    current_user: User = Depends(get_current_user),
    service: ImplementationProposalService = Depends(get_service),
) -> ImplementationProposalOut:
    proposal = service.get(proposal_id)
    if current_user.role.name not in {RoleName.ADMIN, RoleName.MODERATOR}:
        if proposal.proposed_by != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Ruxsat yo'q")
    return service.update(proposal_id, data, current_user.id)


@router.post("/{proposal_id}/submit", response_model=ImplementationProposalOut)
def submit_proposal(
    proposal_id: int,
    current_user: User = Depends(get_current_user),
    service: ImplementationProposalService = Depends(get_service),
) -> ImplementationProposalOut:
    proposal = service.get(proposal_id)
    if current_user.role.name not in {RoleName.ADMIN, RoleName.MODERATOR}:
        if proposal.proposed_by != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Ruxsat yo'q")
    return service.submit(proposal_id, current_user.id)


@router.post("/{proposal_id}/start-review", response_model=ImplementationProposalOut)
def start_review(
    proposal_id: int,
    current_user: User = Depends(require_roles(RoleName.ADMIN, RoleName.MODERATOR, RoleName.EMPLOYEE)),
    service: ImplementationProposalService = Depends(get_service),
) -> ImplementationProposalOut:
    return service.start_review(proposal_id, current_user.id)


@router.post("/{proposal_id}/approve", response_model=ImplementationProposalOut)
def approve_proposal(
    proposal_id: int,
    data: ReviewAction,
    current_user: User = Depends(require_roles(RoleName.ADMIN, RoleName.MODERATOR, RoleName.EMPLOYEE)),
    service: ImplementationProposalService = Depends(get_service),
) -> ImplementationProposalOut:
    return service.approve(proposal_id, current_user.id, data)


@router.post("/{proposal_id}/reject", response_model=ImplementationProposalOut)
def reject_proposal(
    proposal_id: int,
    data: RejectAction,
    current_user: User = Depends(require_roles(RoleName.ADMIN, RoleName.MODERATOR, RoleName.EMPLOYEE)),
    service: ImplementationProposalService = Depends(get_service),
) -> ImplementationProposalOut:
    return service.reject(proposal_id, current_user.id, data)


@router.post("/{proposal_id}/request-revision", response_model=ImplementationProposalOut)
def request_revision(
    proposal_id: int,
    data: RevisionAction,
    current_user: User = Depends(require_roles(RoleName.ADMIN, RoleName.MODERATOR, RoleName.EMPLOYEE)),
    service: ImplementationProposalService = Depends(get_service),
) -> ImplementationProposalOut:
    return service.request_revision(proposal_id, current_user.id, data)


@router.post("/{proposal_id}/resubmit", response_model=ImplementationProposalOut)
def resubmit_proposal(
    proposal_id: int,
    current_user: User = Depends(get_current_user),
    service: ImplementationProposalService = Depends(get_service),
) -> ImplementationProposalOut:
    proposal = service.get(proposal_id)
    if proposal.proposed_by != current_user.id and current_user.role.name != RoleName.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Ruxsat yo'q")
    return service.submit(proposal_id, current_user.id)
