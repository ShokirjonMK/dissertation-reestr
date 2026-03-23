from __future__ import annotations

from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import and_, func, select, true
from sqlalchemy.orm import Session, selectinload

from app.models.entities import Dissertation
from app.models.implementation_proposal import (
    ImplementationProposal,
    ProposalStatus,
    ProposalStatusHistory,
)
from app.schemas.implementation_proposal import (
    ImplementationProposalCreate,
    ImplementationProposalUpdate,
    RejectAction,
    ReviewAction,
    RevisionAction,
)


class ImplementationProposalService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, data: ImplementationProposalCreate, user_id: int) -> ImplementationProposal:
        diss = self.db.get(Dissertation, data.dissertation_id)
        if diss is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dissertatsiya topilmadi")

        payload = data.model_dump()
        proposal = ImplementationProposal(
            **payload,
            proposed_by=user_id,
            status=ProposalStatus.draft,
        )
        self.db.add(proposal)
        self.db.flush()
        self._add_history(proposal.id, user_id, None, ProposalStatus.draft, "Taklif yaratildi")
        self.db.commit()
        self.db.refresh(proposal)
        return self.get(proposal.id)

    def get(self, proposal_id: int) -> ImplementationProposal:
        stmt = (
            select(ImplementationProposal)
            .options(selectinload(ImplementationProposal.status_history))
            .where(ImplementationProposal.id == proposal_id)
        )
        proposal = self.db.scalars(stmt).first()
        if proposal is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Taklif topilmadi")
        return proposal

    def list(
        self,
        *,
        user_id: int | None = None,
        status_filter: ProposalStatus | None = None,
        dissertation_id: int | None = None,
        page: int = 1,
        size: int = 20,
    ) -> dict:
        filters = []
        if user_id is not None:
            filters.append(ImplementationProposal.proposed_by == user_id)
        if status_filter is not None:
            filters.append(ImplementationProposal.status == status_filter)
        if dissertation_id is not None:
            filters.append(ImplementationProposal.dissertation_id == dissertation_id)

        cond = and_(*filters) if filters else true()

        total = self.db.scalar(select(func.count()).select_from(ImplementationProposal).where(cond)) or 0

        stmt = (
            select(ImplementationProposal)
            .where(cond)
            .order_by(ImplementationProposal.created_at.desc())
            .offset((page - 1) * size)
            .limit(size)
            .options(selectinload(ImplementationProposal.status_history))
        )
        items = list(self.db.scalars(stmt).all())
        pages = (total + size - 1) // size if total else 0
        return {"items": items, "total": total, "page": page, "size": size, "pages": pages}

    def update(self, proposal_id: int, data: ImplementationProposalUpdate, user_id: int) -> ImplementationProposal:
        proposal = self.get(proposal_id)
        if proposal.status not in {ProposalStatus.draft, ProposalStatus.revision_required}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Faqat draft yoki revision_required statusdagi taklifni tahrirlash mumkin",
            )
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(proposal, key, value)
        proposal.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(proposal)
        return self.get(proposal_id)

    def submit(self, proposal_id: int, user_id: int) -> ImplementationProposal:
        proposal = self.get(proposal_id)
        if proposal.status not in {ProposalStatus.draft, ProposalStatus.revision_required}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Faqat draft/revision_required statusdan yuborish mumkin",
            )
        old_status = proposal.status
        proposal.status = ProposalStatus.submitted
        proposal.submitted_at = datetime.utcnow()
        self.db.flush()
        self._add_history(proposal_id, user_id, old_status, ProposalStatus.submitted, "Taklif yuborildi")
        self.db.commit()
        return self.get(proposal_id)

    def start_review(self, proposal_id: int, user_id: int) -> ImplementationProposal:
        proposal = self.get(proposal_id)
        if proposal.status != ProposalStatus.submitted:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Faqat submitted statusdan ko'rib chiqish boshlash mumkin",
            )
        proposal.status = ProposalStatus.under_review
        proposal.reviewed_by = user_id
        self.db.flush()
        self._add_history(
            proposal_id,
            user_id,
            ProposalStatus.submitted,
            ProposalStatus.under_review,
            "Ko'rib chiqish boshlandi",
        )
        self.db.commit()
        return self.get(proposal_id)

    def approve(self, proposal_id: int, user_id: int, data: ReviewAction) -> ImplementationProposal:
        proposal = self.get(proposal_id)
        if proposal.status != ProposalStatus.under_review:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Faqat under_review statusdan tasdiqlash mumkin",
            )
        proposal.status = ProposalStatus.approved
        proposal.reviewer_comment = data.comment
        proposal.reviewed_at = datetime.utcnow()
        self.db.flush()
        self._add_history(
            proposal_id,
            user_id,
            ProposalStatus.under_review,
            ProposalStatus.approved,
            data.comment,
        )
        self.db.commit()
        return self.get(proposal_id)

    def reject(self, proposal_id: int, user_id: int, data: RejectAction) -> ImplementationProposal:
        proposal = self.get(proposal_id)
        if proposal.status != ProposalStatus.under_review:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Faqat under_review statusdan rad etish mumkin",
            )
        proposal.status = ProposalStatus.rejected
        proposal.reviewer_comment = data.comment
        proposal.reviewed_at = datetime.utcnow()
        self.db.flush()
        self._add_history(
            proposal_id,
            user_id,
            ProposalStatus.under_review,
            ProposalStatus.rejected,
            data.comment,
        )
        self.db.commit()
        return self.get(proposal_id)

    def request_revision(self, proposal_id: int, user_id: int, data: RevisionAction) -> ImplementationProposal:
        proposal = self.get(proposal_id)
        if proposal.status != ProposalStatus.under_review:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Faqat under_review statusdan revision so'rash mumkin",
            )
        proposal.status = ProposalStatus.revision_required
        proposal.revision_notes = data.revision_notes
        proposal.reviewed_at = datetime.utcnow()
        self.db.flush()
        self._add_history(
            proposal_id,
            user_id,
            ProposalStatus.under_review,
            ProposalStatus.revision_required,
            data.revision_notes,
        )
        self.db.commit()
        return self.get(proposal_id)

    def _add_history(
        self,
        proposal_id: int,
        user_id: int,
        from_status: ProposalStatus | None,
        to_status: ProposalStatus,
        comment: str | None,
    ) -> None:
        history = ProposalStatusHistory(
            proposal_id=proposal_id,
            changed_by=user_id,
            from_status=from_status,
            to_status=to_status,
            comment=comment,
        )
        self.db.add(history)
