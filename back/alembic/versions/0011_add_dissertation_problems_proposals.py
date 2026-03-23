"""add dissertation problems and structured proposals

Revision ID: 0011
Revises: 0010
Create Date: 2026-03-23
"""

from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0011"
down_revision: Union[str, None] = "0010"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "dissertation_problems",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("dissertation_id", sa.Integer(), nullable=False),
        sa.Column("order_num", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("problem_text", sa.Text(), nullable=False),
        sa.Column("problem_category", sa.Text(), nullable=True),
        sa.Column("source_page", sa.Text(), nullable=True),
        sa.Column("is_auto_extracted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["dissertation_id"], ["dissertations.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_dis_problems_dissertation", "dissertation_problems", ["dissertation_id"])

    op.create_table(
        "dissertation_proposals",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("dissertation_id", sa.Integer(), nullable=False),
        sa.Column("order_num", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("proposal_text", sa.Text(), nullable=False),
        sa.Column("proposal_category", sa.Text(), nullable=True),
        sa.Column("source_page", sa.Text(), nullable=True),
        sa.Column("is_auto_extracted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["dissertation_id"], ["dissertations.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_dis_proposals_dissertation", "dissertation_proposals", ["dissertation_id"])


def downgrade() -> None:
    op.drop_table("dissertation_proposals")
    op.drop_table("dissertation_problems")
