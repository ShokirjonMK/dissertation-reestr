from __future__ import annotations

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.dissertation_content import DissertationProblem, DissertationProposalContent
from app.models.entities import Dissertation
from app.repositories.dissertation_repository import DissertationRepository
from app.schemas.dissertation_content import (
    BulkProblemsCreate,
    BulkProposalsCreate,
    ProblemCreate,
    ProposalContentCreate,
)
from app.services.dissertation_service import DissertationService
from app.services.search_sync_service import index_dissertation


class DissertationContentService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def require_dissertation(self, dissertation_id: int) -> Dissertation:
        obj = self.db.get(Dissertation, dissertation_id)
        if obj is None:
            from fastapi import HTTPException, status

            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dissertatsiya topilmadi")
        return obj

    def _reindex(self, dissertation_id: int) -> None:
        repo = DissertationRepository(self.db)
        hydrated = repo.get(dissertation_id)
        if hydrated is not None:
            index_dissertation(DissertationService.to_index_payload(hydrated))

    def add_problem(self, dissertation_id: int, data: ProblemCreate) -> DissertationProblem:
        self.require_dissertation(dissertation_id)
        payload = data.model_dump()
        problem = DissertationProblem(dissertation_id=dissertation_id, **payload)
        self.db.add(problem)
        self.db.commit()
        self.db.refresh(problem)
        self._reindex(dissertation_id)
        return problem

    def get_problems(self, dissertation_id: int) -> list[DissertationProblem]:
        self.require_dissertation(dissertation_id)
        stmt = (
            select(DissertationProblem)
            .where(DissertationProblem.dissertation_id == dissertation_id)
            .order_by(DissertationProblem.order_num)
        )
        return list(self.db.scalars(stmt).all())

    def bulk_create_problems(self, dissertation_id: int, data: BulkProblemsCreate, *, is_auto: bool = False) -> None:
        self.require_dissertation(dissertation_id)
        if data.replace_existing:
            self.db.execute(delete(DissertationProblem).where(DissertationProblem.dissertation_id == dissertation_id))
        for i, p in enumerate(data.problems, start=1):
            problem = DissertationProblem(
                dissertation_id=dissertation_id,
                order_num=p.order_num or i,
                problem_text=p.problem_text,
                problem_category=p.problem_category,
                source_page=p.source_page,
                is_auto_extracted=is_auto,
            )
            self.db.add(problem)
        self.db.commit()
        self._reindex(dissertation_id)

    def delete_problem(self, dissertation_id: int, problem_id: int) -> None:
        self.require_dissertation(dissertation_id)
        self.db.execute(
            delete(DissertationProblem).where(
                DissertationProblem.id == problem_id,
                DissertationProblem.dissertation_id == dissertation_id,
            )
        )
        self.db.commit()
        self._reindex(dissertation_id)

    def add_proposal(self, dissertation_id: int, data: ProposalContentCreate) -> DissertationProposalContent:
        self.require_dissertation(dissertation_id)
        payload = data.model_dump()
        proposal = DissertationProposalContent(dissertation_id=dissertation_id, **payload)
        self.db.add(proposal)
        self.db.commit()
        self.db.refresh(proposal)
        self._reindex(dissertation_id)
        return proposal

    def get_proposals(self, dissertation_id: int) -> list[DissertationProposalContent]:
        self.require_dissertation(dissertation_id)
        stmt = (
            select(DissertationProposalContent)
            .where(DissertationProposalContent.dissertation_id == dissertation_id)
            .order_by(DissertationProposalContent.order_num)
        )
        return list(self.db.scalars(stmt).all())

    def bulk_create_proposals(self, dissertation_id: int, data: BulkProposalsCreate, *, is_auto: bool = False) -> None:
        self.require_dissertation(dissertation_id)
        if data.replace_existing:
            self.db.execute(
                delete(DissertationProposalContent).where(
                    DissertationProposalContent.dissertation_id == dissertation_id
                )
            )
        for i, p in enumerate(data.proposals, start=1):
            proposal = DissertationProposalContent(
                dissertation_id=dissertation_id,
                order_num=p.order_num or i,
                proposal_text=p.proposal_text,
                proposal_category=p.proposal_category,
                source_page=p.source_page,
                is_auto_extracted=is_auto,
            )
            self.db.add(proposal)
        self.db.commit()
        self._reindex(dissertation_id)

    def delete_proposal(self, dissertation_id: int, proposal_id: int) -> None:
        self.require_dissertation(dissertation_id)
        self.db.execute(
            delete(DissertationProposalContent).where(
                DissertationProposalContent.id == proposal_id,
                DissertationProposalContent.dissertation_id == dissertation_id,
            )
        )
        self.db.commit()
        self._reindex(dissertation_id)
