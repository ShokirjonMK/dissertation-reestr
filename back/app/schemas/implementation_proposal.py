from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.implementation_proposal import ProposalPriority, ProposalStatus


class ProposalStatusHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    from_status: ProposalStatus | None
    to_status: ProposalStatus
    comment: str | None
    changed_at: datetime
    changed_by: int


class ImplementationProposalCreate(BaseModel):
    """dissertation_id ixtiyoriy: avvalo muammo/yechim taklifi, tasdiqdan keyin dissertatsiya yaratiladi."""
    dissertation_id: int | None = None
    title: str = Field(..., min_length=5, max_length=500)
    problem_description: str = Field(..., min_length=20)
    proposal_text: str = Field(..., min_length=20)
    expected_result: str = Field(..., min_length=10)
    implementation_area: str
    implementation_org: str
    priority: ProposalPriority = ProposalPriority.medium
    source_chapter: str | None = None
    source_pages: str | None = None


class ImplementationProposalUpdate(BaseModel):
    dissertation_id: int | None = None
    title: str | None = None
    problem_description: str | None = None
    proposal_text: str | None = None
    expected_result: str | None = None
    implementation_area: str | None = None
    implementation_org: str | None = None
    priority: ProposalPriority | None = None
    source_chapter: str | None = None
    source_pages: str | None = None
    deadline: date | None = None
    internal_notes: str | None = None


class ReviewAction(BaseModel):
    comment: str | None = None


class RejectAction(BaseModel):
    comment: str = Field(..., min_length=10)


class RevisionAction(BaseModel):
    revision_notes: str = Field(..., min_length=10)


class ImplementationProposalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    dissertation_id: int | None
    proposed_by: int
    reviewed_by: int | None
    title: str
    problem_description: str
    proposal_text: str
    expected_result: str
    implementation_area: str
    implementation_org: str
    priority: ProposalPriority
    source_chapter: str | None
    source_pages: str | None
    status: ProposalStatus
    submitted_at: datetime | None
    reviewed_at: datetime | None
    deadline: date | None
    reviewer_comment: str | None
    revision_notes: str | None
    attachment_url: str | None
    created_at: datetime
    updated_at: datetime
    status_history: list[ProposalStatusHistoryOut] = []


class ImplementationProposalList(BaseModel):
    items: list[ImplementationProposalOut]
    total: int
    page: int
    size: int
    pages: int
