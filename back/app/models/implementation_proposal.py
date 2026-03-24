from __future__ import annotations

import enum
from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.entities import Dissertation, User


class ProposalStatus(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    under_review = "under_review"
    approved = "approved"
    rejected = "rejected"
    revision_required = "revision_required"


class ProposalPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class ImplementationProposal(Base):
    __tablename__ = "implementation_proposals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    dissertation_id: Mapped[int | None] = mapped_column(
        ForeignKey("dissertations.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    proposed_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    reviewed_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)

    title: Mapped[str] = mapped_column(Text, nullable=False)
    problem_description: Mapped[str] = mapped_column(Text, nullable=False)
    proposal_text: Mapped[str] = mapped_column(Text, nullable=False)
    expected_result: Mapped[str] = mapped_column(Text, nullable=False)
    implementation_area: Mapped[str] = mapped_column(Text, nullable=False)
    implementation_org: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[ProposalPriority] = mapped_column(
        Enum(ProposalPriority, name="proposal_priority_enum"),
        default=ProposalPriority.medium,
        nullable=False,
    )
    source_chapter: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_pages: Mapped[str | None] = mapped_column(Text, nullable=True)

    status: Mapped[ProposalStatus] = mapped_column(
        Enum(ProposalStatus, name="proposal_status_enum"),
        default=ProposalStatus.draft,
        nullable=False,
        index=True,
    )
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    deadline: Mapped[date | None] = mapped_column(Date, nullable=True)

    reviewer_comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    revision_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    internal_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    attachment_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    dissertation: Mapped[Dissertation] = relationship("Dissertation", back_populates="implementation_proposals")
    proposer: Mapped[User] = relationship("User", foreign_keys=[proposed_by])
    reviewer: Mapped[User | None] = relationship("User", foreign_keys=[reviewed_by])
    status_history: Mapped[list[ProposalStatusHistory]] = relationship(
        "ProposalStatusHistory",
        back_populates="proposal",
        cascade="all, delete-orphan",
        order_by="ProposalStatusHistory.changed_at",
    )


class ProposalStatusHistory(Base):
    __tablename__ = "proposal_status_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    proposal_id: Mapped[int] = mapped_column(
        ForeignKey("implementation_proposals.id", ondelete="CASCADE"),
        nullable=False,
    )
    changed_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    from_status: Mapped[ProposalStatus | None] = mapped_column(
        Enum(ProposalStatus, name="proposal_status_enum"),
        nullable=True,
    )
    to_status: Mapped[ProposalStatus] = mapped_column(
        Enum(ProposalStatus, name="proposal_status_enum"),
        nullable=False,
    )
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    changed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    proposal: Mapped[ImplementationProposal] = relationship("ImplementationProposal", back_populates="status_history")
    changed_by_user: Mapped[User] = relationship("User", foreign_keys=[changed_by])
