"""add implementation proposals

Revision ID: 0010
Revises:
Create Date: 2026-03-23
"""

from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0010"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

proposal_status = postgresql.ENUM(
    "draft",
    "submitted",
    "under_review",
    "approved",
    "rejected",
    "revision_required",
    name="proposal_status_enum",
)
priority_enum = postgresql.ENUM("low", "medium", "high", "critical", name="proposal_priority_enum")


def upgrade() -> None:
    bind = op.get_bind()
    proposal_status.create(bind, checkfirst=True)
    priority_enum.create(bind, checkfirst=True)

    op.create_table(
        "implementation_proposals",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("dissertation_id", sa.Integer(), nullable=False),
        sa.Column("proposed_by", sa.Integer(), nullable=False),
        sa.Column("reviewed_by", sa.Integer(), nullable=True),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("problem_description", sa.Text(), nullable=False),
        sa.Column("proposal_text", sa.Text(), nullable=False),
        sa.Column("expected_result", sa.Text(), nullable=False),
        sa.Column("implementation_area", sa.Text(), nullable=False),
        sa.Column("implementation_org", sa.Text(), nullable=False),
        sa.Column("priority", priority_enum, nullable=False, server_default="medium"),
        sa.Column("source_chapter", sa.Text(), nullable=True),
        sa.Column("source_pages", sa.Text(), nullable=True),
        sa.Column("status", proposal_status, nullable=False, server_default="draft"),
        sa.Column("submitted_at", sa.DateTime(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(), nullable=True),
        sa.Column("deadline", sa.Date(), nullable=True),
        sa.Column("reviewer_comment", sa.Text(), nullable=True),
        sa.Column("revision_notes", sa.Text(), nullable=True),
        sa.Column("internal_notes", sa.Text(), nullable=True),
        sa.Column("attachment_url", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["dissertation_id"], ["dissertations.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["proposed_by"], ["users.id"]),
        sa.ForeignKeyConstraint(["reviewed_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_impl_proposals_dissertation", "implementation_proposals", ["dissertation_id"])
    op.create_index("ix_impl_proposals_proposed_by", "implementation_proposals", ["proposed_by"])
    op.create_index("ix_impl_proposals_status", "implementation_proposals", ["status"])

    op.create_table(
        "proposal_status_history",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("proposal_id", sa.Integer(), nullable=False),
        sa.Column("changed_by", sa.Integer(), nullable=False),
        sa.Column("from_status", proposal_status, nullable=True),
        sa.Column("to_status", proposal_status, nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("changed_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["changed_by"], ["users.id"]),
        sa.ForeignKeyConstraint(["proposal_id"], ["implementation_proposals.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("proposal_status_history")
    op.drop_table("implementation_proposals")
    bind = op.get_bind()
    priority_enum.drop(bind, checkfirst=True)
    proposal_status.drop(bind, checkfirst=True)
