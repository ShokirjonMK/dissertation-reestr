from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.entities import Dissertation


class DissertationProblem(Base):
    __tablename__ = "dissertation_problems"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    dissertation_id: Mapped[int] = mapped_column(
        ForeignKey("dissertations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    order_num: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    problem_text: Mapped[str] = mapped_column(Text, nullable=False)
    problem_category: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_page: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_auto_extracted: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    dissertation: Mapped[Dissertation] = relationship("Dissertation", back_populates="problems")


class DissertationProposalContent(Base):
    """Dissertatsiya ichidagi strukturalangan takliflar ro'yxati (jadvallar nomi: dissertation_proposals)."""

    __tablename__ = "dissertation_proposals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    dissertation_id: Mapped[int] = mapped_column(
        ForeignKey("dissertations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    order_num: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    proposal_text: Mapped[str] = mapped_column(Text, nullable=False)
    proposal_category: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_page: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_auto_extracted: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    dissertation: Mapped[Dissertation] = relationship("Dissertation", back_populates="proposal_contents")
