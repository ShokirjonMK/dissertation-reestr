from __future__ import annotations

from fastapi import APIRouter, Depends, File, Response, UploadFile, status
from sqlalchemy.orm import Session

from app.ai.extractor import extract_problems_proposals_from_file
from app.api.deps import get_current_user, get_db_dep
from app.models.entities import User
from app.schemas.dissertation_content import (
    BulkProblemsCreate,
    BulkProposalsCreate,
    ProblemCreate,
    ProblemOut,
    ProposalContentCreate,
    ProposalContentOut,
)
from app.services.dissertation_content_service import DissertationContentService

router = APIRouter()


def get_service(db: Session = Depends(get_db_dep)) -> DissertationContentService:
    return DissertationContentService(db)


@router.post("/{dissertation_id}/problems", response_model=ProblemOut, status_code=status.HTTP_201_CREATED)
def add_problem(
    dissertation_id: int,
    data: ProblemCreate,
    service: DissertationContentService = Depends(get_service),
    _: User = Depends(get_current_user),
) -> ProblemOut:
    return service.add_problem(dissertation_id, data)


@router.get("/{dissertation_id}/problems", response_model=list[ProblemOut])
def get_problems(
    dissertation_id: int,
    service: DissertationContentService = Depends(get_service),
    _: User = Depends(get_current_user),
) -> list[ProblemOut]:
    return service.get_problems(dissertation_id)


@router.post("/{dissertation_id}/problems/bulk", status_code=status.HTTP_201_CREATED)
def bulk_problems(
    dissertation_id: int,
    data: BulkProblemsCreate,
    service: DissertationContentService = Depends(get_service),
    _: User = Depends(get_current_user),
) -> dict[str, str]:
    service.bulk_create_problems(dissertation_id, data)
    return {"message": "Saqlandi"}


@router.delete("/{dissertation_id}/problems/{problem_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_problem(
    dissertation_id: int,
    problem_id: int,
    service: DissertationContentService = Depends(get_service),
    _: User = Depends(get_current_user),
) -> Response:
    service.delete_problem(dissertation_id, problem_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/{dissertation_id}/proposal-contents",
    response_model=ProposalContentOut,
    status_code=status.HTTP_201_CREATED,
)
def add_proposal_content(
    dissertation_id: int,
    data: ProposalContentCreate,
    service: DissertationContentService = Depends(get_service),
    _: User = Depends(get_current_user),
) -> ProposalContentOut:
    return service.add_proposal(dissertation_id, data)


@router.get("/{dissertation_id}/proposal-contents", response_model=list[ProposalContentOut])
def get_proposal_contents(
    dissertation_id: int,
    service: DissertationContentService = Depends(get_service),
    _: User = Depends(get_current_user),
) -> list[ProposalContentOut]:
    return service.get_proposals(dissertation_id)


@router.post("/{dissertation_id}/proposal-contents/bulk", status_code=status.HTTP_201_CREATED)
def bulk_proposals(
    dissertation_id: int,
    data: BulkProposalsCreate,
    service: DissertationContentService = Depends(get_service),
    _: User = Depends(get_current_user),
) -> dict[str, str]:
    service.bulk_create_proposals(dissertation_id, data)
    return {"message": "Saqlandi"}


@router.delete("/{dissertation_id}/proposal-contents/{proposal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_proposal_content(
    dissertation_id: int,
    proposal_id: int,
    service: DissertationContentService = Depends(get_service),
    _: User = Depends(get_current_user),
) -> Response:
    service.delete_proposal(dissertation_id, proposal_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{dissertation_id}/extract-problems-proposals")
def extract_content(
    dissertation_id: int,
    file: UploadFile = File(...),
    service: DissertationContentService = Depends(get_service),
    _: User = Depends(get_current_user),
) -> dict:
    service.require_dissertation(dissertation_id)
    content = file.file.read()
    return extract_problems_proposals_from_file(content, file.filename or "")
