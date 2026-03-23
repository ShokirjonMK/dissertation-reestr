# CURSOR SUPER PROMPT
## Dissertatsiya Reestri — v2.0 To'liq Implementatsiya

---

## KONTEKST

Sen mavjud **Dissertatsiya Reestri** loyihasiga 2 ta yangi funksional blok qo'shyapsan. Loyiha monorepo: `front/` (Next.js), `back/` (FastAPI), `services/search-service/` (Elasticsearch), `services/ai-service/`. Barcha o'zgarishlar mavjud arxitektura bilan mos bo'lishi shart.

Texnik topshiriq to'liq: `TZ_QOSHIMCHA_TALABLAR.md` faylida.

---

## QOIDA: Har bir qadam oxirida tekshir

Har bir fayl yozgandan so'ng:
1. Import yo'llari to'g'riligini tekshir
2. Mavjud modellar bilan konflikt yo'qligini tekshir
3. `__init__.py` larga yangi modullar qo'shilganini tekshir

---

## QADAM 1 — DATABASE MIGRATSIYALARI

### 1.1 `back/alembic/versions/0010_add_implementation_proposals.py`

```python
"""add implementation proposals

Revision ID: 0010
Revises: 0009
Create Date: 2026-03-23
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, ENUM
import uuid

revision = '0010'
down_revision = '0009'  # mavjud oxirgi migration ID ga o'zgartir

proposal_status = ENUM(
    'draft', 'submitted', 'under_review', 
    'approved', 'rejected', 'revision_required',
    name='proposal_status_enum'
)

priority_enum = ENUM('low', 'medium', 'high', 'critical', name='proposal_priority_enum')

def upgrade():
    proposal_status.create(op.get_bind(), checkfirst=True)
    priority_enum.create(op.get_bind(), checkfirst=True)
    
    op.create_table('implementation_proposals',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('dissertation_id', UUID(as_uuid=True), sa.ForeignKey('dissertations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('proposed_by', UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('reviewed_by', UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('title', sa.Text, nullable=False),
        sa.Column('problem_description', sa.Text, nullable=False),
        sa.Column('proposal_text', sa.Text, nullable=False),
        sa.Column('expected_result', sa.Text, nullable=False),
        sa.Column('implementation_area', sa.Text, nullable=False),
        sa.Column('implementation_org', sa.Text, nullable=False),
        sa.Column('priority', priority_enum, default='medium', nullable=False),
        sa.Column('source_chapter', sa.Text, nullable=True),
        sa.Column('source_pages', sa.Text, nullable=True),
        sa.Column('status', proposal_status, default='draft', nullable=False),
        sa.Column('submitted_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('reviewed_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('deadline', sa.Date, nullable=True),
        sa.Column('reviewer_comment', sa.Text, nullable=True),
        sa.Column('revision_notes', sa.Text, nullable=True),
        sa.Column('internal_notes', sa.Text, nullable=True),
        sa.Column('attachment_url', sa.Text, nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    
    op.create_table('proposal_status_history',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('proposal_id', UUID(as_uuid=True), sa.ForeignKey('implementation_proposals.id', ondelete='CASCADE'), nullable=False),
        sa.Column('changed_by', UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('from_status', proposal_status, nullable=True),
        sa.Column('to_status', proposal_status, nullable=False),
        sa.Column('comment', sa.Text, nullable=True),
        sa.Column('changed_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
    )
    
    op.create_index('ix_impl_proposals_dissertation', 'implementation_proposals', ['dissertation_id'])
    op.create_index('ix_impl_proposals_proposed_by', 'implementation_proposals', ['proposed_by'])
    op.create_index('ix_impl_proposals_status', 'implementation_proposals', ['status'])

def downgrade():
    op.drop_table('proposal_status_history')
    op.drop_table('implementation_proposals')
    proposal_status.drop(op.get_bind())
    priority_enum.drop(op.get_bind())
```

### 1.2 `back/alembic/versions/0011_add_dissertation_problems_proposals.py`

```python
"""add dissertation problems and proposals

Revision ID: 0011
Revises: 0010
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
import uuid

revision = '0011'
down_revision = '0010'

def upgrade():
    op.create_table('dissertation_problems',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('dissertation_id', UUID(as_uuid=True), sa.ForeignKey('dissertations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('order_num', sa.Integer, nullable=False, default=1),
        sa.Column('problem_text', sa.Text, nullable=False),
        sa.Column('problem_category', sa.Text, nullable=True),
        sa.Column('source_page', sa.Text, nullable=True),
        sa.Column('is_auto_extracted', sa.Boolean, default=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
    )
    
    op.create_table('dissertation_proposals',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('dissertation_id', UUID(as_uuid=True), sa.ForeignKey('dissertations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('order_num', sa.Integer, nullable=False, default=1),
        sa.Column('proposal_text', sa.Text, nullable=False),
        sa.Column('proposal_category', sa.Text, nullable=True),
        sa.Column('source_page', sa.Text, nullable=True),
        sa.Column('is_auto_extracted', sa.Boolean, default=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
    )
    
    op.create_index('ix_dis_problems_dissertation', 'dissertation_problems', ['dissertation_id'])
    op.create_index('ix_dis_proposals_dissertation', 'dissertation_proposals', ['dissertation_id'])

def downgrade():
    op.drop_table('dissertation_proposals')
    op.drop_table('dissertation_problems')
```

---

## QADAM 2 — BACKEND MODELS

### 2.1 `back/app/models/implementation_proposal.py`

```python
import uuid
from datetime import datetime
from sqlalchemy import Column, Text, ForeignKey, TIMESTAMP, Date, Boolean, Integer, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum

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
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dissertation_id = Column(UUID(as_uuid=True), ForeignKey("dissertations.id", ondelete="CASCADE"), nullable=False)
    proposed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    title = Column(Text, nullable=False)
    problem_description = Column(Text, nullable=False)
    proposal_text = Column(Text, nullable=False)
    expected_result = Column(Text, nullable=False)
    implementation_area = Column(Text, nullable=False)
    implementation_org = Column(Text, nullable=False)
    priority = Column(SAEnum(ProposalPriority), default=ProposalPriority.medium, nullable=False)
    source_chapter = Column(Text, nullable=True)
    source_pages = Column(Text, nullable=True)
    
    status = Column(SAEnum(ProposalStatus), default=ProposalStatus.draft, nullable=False)
    submitted_at = Column(TIMESTAMP(timezone=True), nullable=True)
    reviewed_at = Column(TIMESTAMP(timezone=True), nullable=True)
    deadline = Column(Date, nullable=True)
    
    reviewer_comment = Column(Text, nullable=True)
    revision_notes = Column(Text, nullable=True)
    internal_notes = Column(Text, nullable=True)
    attachment_url = Column(Text, nullable=True)
    
    created_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    updated_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    dissertation = relationship("Dissertation", back_populates="implementation_proposals")
    proposer = relationship("User", foreign_keys=[proposed_by])
    reviewer = relationship("User", foreign_keys=[reviewed_by])
    status_history = relationship("ProposalStatusHistory", back_populates="proposal", cascade="all, delete-orphan", order_by="ProposalStatusHistory.changed_at")

class ProposalStatusHistory(Base):
    __tablename__ = "proposal_status_history"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    proposal_id = Column(UUID(as_uuid=True), ForeignKey("implementation_proposals.id", ondelete="CASCADE"), nullable=False)
    changed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    from_status = Column(SAEnum(ProposalStatus), nullable=True)
    to_status = Column(SAEnum(ProposalStatus), nullable=False)
    comment = Column(Text, nullable=True)
    changed_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    
    proposal = relationship("ImplementationProposal", back_populates="status_history")
    user = relationship("User")
```

### 2.2 `back/app/models/dissertation_content.py`

```python
import uuid
from datetime import datetime
from sqlalchemy import Column, Text, ForeignKey, TIMESTAMP, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

class DissertationProblem(Base):
    __tablename__ = "dissertation_problems"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dissertation_id = Column(UUID(as_uuid=True), ForeignKey("dissertations.id", ondelete="CASCADE"), nullable=False)
    order_num = Column(Integer, nullable=False, default=1)
    problem_text = Column(Text, nullable=False)
    problem_category = Column(Text, nullable=True)
    source_page = Column(Text, nullable=True)
    is_auto_extracted = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    
    dissertation = relationship("Dissertation", back_populates="problems")

class DissertationProposalContent(Base):
    __tablename__ = "dissertation_proposals"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dissertation_id = Column(UUID(as_uuid=True), ForeignKey("dissertations.id", ondelete="CASCADE"), nullable=False)
    order_num = Column(Integer, nullable=False, default=1)
    proposal_text = Column(Text, nullable=False)
    proposal_category = Column(Text, nullable=True)
    source_page = Column(Text, nullable=True)
    is_auto_extracted = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    
    dissertation = relationship("Dissertation", back_populates="proposal_contents")
```

**MUHIM:** `back/app/models/dissertation.py` faylida `Dissertation` modeliga qo'sh:
```python
implementation_proposals = relationship("ImplementationProposal", back_populates="dissertation", cascade="all, delete-orphan")
problems = relationship("DissertationProblem", back_populates="dissertation", cascade="all, delete-orphan", order_by="DissertationProblem.order_num")
proposal_contents = relationship("DissertationProposalContent", back_populates="dissertation", cascade="all, delete-orphan", order_by="DissertationProposalContent.order_num")
```

---

## QADAM 3 — BACKEND SCHEMAS

### 3.1 `back/app/schemas/implementation_proposal.py`

```python
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID
from app.models.implementation_proposal import ProposalStatus, ProposalPriority

class ProposalStatusHistoryOut(BaseModel):
    id: UUID
    from_status: Optional[ProposalStatus]
    to_status: ProposalStatus
    comment: Optional[str]
    changed_at: datetime
    changed_by: UUID
    class Config:
        from_attributes = True

class ImplementationProposalCreate(BaseModel):
    dissertation_id: UUID
    title: str = Field(..., min_length=5, max_length=500)
    problem_description: str = Field(..., min_length=20)
    proposal_text: str = Field(..., min_length=20)
    expected_result: str = Field(..., min_length=10)
    implementation_area: str
    implementation_org: str
    priority: ProposalPriority = ProposalPriority.medium
    source_chapter: Optional[str] = None
    source_pages: Optional[str] = None

class ImplementationProposalUpdate(BaseModel):
    title: Optional[str] = None
    problem_description: Optional[str] = None
    proposal_text: Optional[str] = None
    expected_result: Optional[str] = None
    implementation_area: Optional[str] = None
    implementation_org: Optional[str] = None
    priority: Optional[ProposalPriority] = None
    source_chapter: Optional[str] = None
    source_pages: Optional[str] = None
    deadline: Optional[date] = None
    internal_notes: Optional[str] = None

class ReviewAction(BaseModel):
    comment: Optional[str] = None

class RejectAction(BaseModel):
    comment: str = Field(..., min_length=10)

class RevisionAction(BaseModel):
    revision_notes: str = Field(..., min_length=10)

class ImplementationProposalOut(BaseModel):
    id: UUID
    dissertation_id: UUID
    proposed_by: UUID
    reviewed_by: Optional[UUID]
    title: str
    problem_description: str
    proposal_text: str
    expected_result: str
    implementation_area: str
    implementation_org: str
    priority: ProposalPriority
    source_chapter: Optional[str]
    source_pages: Optional[str]
    status: ProposalStatus
    submitted_at: Optional[datetime]
    reviewed_at: Optional[datetime]
    deadline: Optional[date]
    reviewer_comment: Optional[str]
    revision_notes: Optional[str]
    attachment_url: Optional[str]
    created_at: datetime
    updated_at: datetime
    status_history: List[ProposalStatusHistoryOut] = []
    class Config:
        from_attributes = True

class ImplementationProposalList(BaseModel):
    items: List[ImplementationProposalOut]
    total: int
    page: int
    size: int
    pages: int
```

### 3.2 `back/app/schemas/dissertation_content.py`

```python
from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID

class ProblemCreate(BaseModel):
    problem_text: str = Field(..., min_length=5)
    problem_category: Optional[str] = None
    source_page: Optional[str] = None
    order_num: Optional[int] = 1

class ProblemOut(BaseModel):
    id: UUID
    order_num: int
    problem_text: str
    problem_category: Optional[str]
    source_page: Optional[str]
    is_auto_extracted: bool
    class Config:
        from_attributes = True

class ProposalContentCreate(BaseModel):
    proposal_text: str = Field(..., min_length=5)
    proposal_category: Optional[str] = None
    source_page: Optional[str] = None
    order_num: Optional[int] = 1

class ProposalContentOut(BaseModel):
    id: UUID
    order_num: int
    proposal_text: str
    proposal_category: Optional[str]
    source_page: Optional[str]
    is_auto_extracted: bool
    class Config:
        from_attributes = True

class BulkProblemsCreate(BaseModel):
    problems: List[ProblemCreate]
    replace_existing: bool = False

class BulkProposalsCreate(BaseModel):
    proposals: List[ProposalContentCreate]
    replace_existing: bool = False

class ExtractedContent(BaseModel):
    problems: List[ProblemCreate]
    proposals: List[ProposalContentCreate]
```

---

## QADAM 4 — BACKEND SERVICES

### 4.1 `back/app/services/implementation_proposal_service.py`

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from fastapi import HTTPException, status

from app.models.implementation_proposal import (
    ImplementationProposal, ProposalStatusHistory, 
    ProposalStatus, ProposalPriority
)
from app.schemas.implementation_proposal import (
    ImplementationProposalCreate, ImplementationProposalUpdate,
    ReviewAction, RejectAction, RevisionAction
)

class ImplementationProposalService:
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, data: ImplementationProposalCreate, user_id: UUID) -> ImplementationProposal:
        proposal = ImplementationProposal(
            **data.model_dump(),
            proposed_by=user_id,
            status=ProposalStatus.draft
        )
        self.db.add(proposal)
        await self.db.flush()
        await self._add_history(proposal.id, user_id, None, ProposalStatus.draft, "Taklif yaratildi")
        await self.db.commit()
        await self.db.refresh(proposal)
        return proposal
    
    async def get(self, proposal_id: UUID) -> ImplementationProposal:
        result = await self.db.execute(
            select(ImplementationProposal)
            .options(selectinload(ImplementationProposal.status_history))
            .where(ImplementationProposal.id == proposal_id)
        )
        proposal = result.scalar_one_or_none()
        if not proposal:
            raise HTTPException(status_code=404, detail="Taklif topilmadi")
        return proposal
    
    async def list(
        self, 
        user_id: Optional[UUID] = None,
        status: Optional[ProposalStatus] = None,
        dissertation_id: Optional[UUID] = None,
        page: int = 1,
        size: int = 20
    ):
        q = select(ImplementationProposal)
        filters = []
        if user_id:
            filters.append(ImplementationProposal.proposed_by == user_id)
        if status:
            filters.append(ImplementationProposal.status == status)
        if dissertation_id:
            filters.append(ImplementationProposal.dissertation_id == dissertation_id)
        if filters:
            q = q.where(and_(*filters))
        
        total_q = select(func.count()).select_from(q.subquery())
        total = (await self.db.execute(total_q)).scalar()
        
        q = q.offset((page - 1) * size).limit(size).order_by(ImplementationProposal.created_at.desc())
        result = await self.db.execute(q.options(selectinload(ImplementationProposal.status_history)))
        items = result.scalars().all()
        
        return {"items": items, "total": total, "page": page, "size": size, "pages": (total + size - 1) // size}
    
    async def update(self, proposal_id: UUID, data: ImplementationProposalUpdate, user_id: UUID) -> ImplementationProposal:
        proposal = await self.get(proposal_id)
        if proposal.status not in [ProposalStatus.draft, ProposalStatus.revision_required]:
            raise HTTPException(status_code=400, detail="Faqat draft yoki revision_required statusdagi taklifni tahrirlash mumkin")
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(proposal, key, value)
        proposal.updated_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(proposal)
        return proposal
    
    async def submit(self, proposal_id: UUID, user_id: UUID) -> ImplementationProposal:
        proposal = await self.get(proposal_id)
        if proposal.status not in [ProposalStatus.draft, ProposalStatus.revision_required]:
            raise HTTPException(status_code=400, detail="Faqat draft/revision_required statusdan yuborish mumkin")
        old_status = proposal.status
        proposal.status = ProposalStatus.submitted
        proposal.submitted_at = datetime.utcnow()
        await self.db.flush()
        await self._add_history(proposal_id, user_id, old_status, ProposalStatus.submitted, "Taklif yuborildi")
        await self.db.commit()
        return proposal
    
    async def start_review(self, proposal_id: UUID, user_id: UUID) -> ImplementationProposal:
        proposal = await self.get(proposal_id)
        if proposal.status != ProposalStatus.submitted:
            raise HTTPException(status_code=400, detail="Faqat submitted statusdan ko'rib chiqish boshlash mumkin")
        proposal.status = ProposalStatus.under_review
        proposal.reviewed_by = user_id
        await self.db.flush()
        await self._add_history(proposal_id, user_id, ProposalStatus.submitted, ProposalStatus.under_review, "Ko'rib chiqish boshlandi")
        await self.db.commit()
        return proposal
    
    async def approve(self, proposal_id: UUID, user_id: UUID, data: ReviewAction) -> ImplementationProposal:
        proposal = await self.get(proposal_id)
        if proposal.status != ProposalStatus.under_review:
            raise HTTPException(status_code=400, detail="Faqat under_review statusdan tasdiqlash mumkin")
        proposal.status = ProposalStatus.approved
        proposal.reviewer_comment = data.comment
        proposal.reviewed_at = datetime.utcnow()
        await self.db.flush()
        await self._add_history(proposal_id, user_id, ProposalStatus.under_review, ProposalStatus.approved, data.comment)
        await self.db.commit()
        return proposal
    
    async def reject(self, proposal_id: UUID, user_id: UUID, data: RejectAction) -> ImplementationProposal:
        proposal = await self.get(proposal_id)
        if proposal.status != ProposalStatus.under_review:
            raise HTTPException(status_code=400, detail="Faqat under_review statusdan rad etish mumkin")
        proposal.status = ProposalStatus.rejected
        proposal.reviewer_comment = data.comment
        proposal.reviewed_at = datetime.utcnow()
        await self.db.flush()
        await self._add_history(proposal_id, user_id, ProposalStatus.under_review, ProposalStatus.rejected, data.comment)
        await self.db.commit()
        return proposal
    
    async def request_revision(self, proposal_id: UUID, user_id: UUID, data: RevisionAction) -> ImplementationProposal:
        proposal = await self.get(proposal_id)
        if proposal.status != ProposalStatus.under_review:
            raise HTTPException(status_code=400, detail="Faqat under_review statusdan revision so'rash mumkin")
        proposal.status = ProposalStatus.revision_required
        proposal.revision_notes = data.revision_notes
        proposal.reviewed_at = datetime.utcnow()
        await self.db.flush()
        await self._add_history(proposal_id, user_id, ProposalStatus.under_review, ProposalStatus.revision_required, data.revision_notes)
        await self.db.commit()
        return proposal
    
    async def _add_history(self, proposal_id, user_id, from_status, to_status, comment):
        history = ProposalStatusHistory(
            proposal_id=proposal_id,
            changed_by=user_id,
            from_status=from_status,
            to_status=to_status,
            comment=comment
        )
        self.db.add(history)
```

### 4.2 `back/app/services/dissertation_content_service.py`

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from uuid import UUID
from typing import List
import json

from app.models.dissertation_content import DissertationProblem, DissertationProposalContent
from app.schemas.dissertation_content import (
    ProblemCreate, ProposalContentCreate,
    BulkProblemsCreate, BulkProposalsCreate
)

class DissertationContentService:
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def add_problem(self, dissertation_id: UUID, data: ProblemCreate) -> DissertationProblem:
        problem = DissertationProblem(dissertation_id=dissertation_id, **data.model_dump())
        self.db.add(problem)
        await self.db.commit()
        await self.db.refresh(problem)
        return problem
    
    async def get_problems(self, dissertation_id: UUID) -> List[DissertationProblem]:
        result = await self.db.execute(
            select(DissertationProblem)
            .where(DissertationProblem.dissertation_id == dissertation_id)
            .order_by(DissertationProblem.order_num)
        )
        return result.scalars().all()
    
    async def bulk_create_problems(self, dissertation_id: UUID, data: BulkProblemsCreate, is_auto: bool = False):
        if data.replace_existing:
            await self.db.execute(delete(DissertationProblem).where(DissertationProblem.dissertation_id == dissertation_id))
        for i, p in enumerate(data.problems, start=1):
            problem = DissertationProblem(
                dissertation_id=dissertation_id,
                order_num=p.order_num or i,
                problem_text=p.problem_text,
                problem_category=p.problem_category,
                source_page=p.source_page,
                is_auto_extracted=is_auto
            )
            self.db.add(problem)
        await self.db.commit()
    
    async def delete_problem(self, dissertation_id: UUID, problem_id: UUID):
        await self.db.execute(
            delete(DissertationProblem).where(
                DissertationProblem.id == problem_id,
                DissertationProblem.dissertation_id == dissertation_id
            )
        )
        await self.db.commit()
    
    # Xuddi shunday proposals uchun ham (mirrored methods)
    async def add_proposal(self, dissertation_id: UUID, data: ProposalContentCreate) -> DissertationProposalContent:
        proposal = DissertationProposalContent(dissertation_id=dissertation_id, **data.model_dump())
        self.db.add(proposal)
        await self.db.commit()
        await self.db.refresh(proposal)
        return proposal
    
    async def get_proposals(self, dissertation_id: UUID) -> List[DissertationProposalContent]:
        result = await self.db.execute(
            select(DissertationProposalContent)
            .where(DissertationProposalContent.dissertation_id == dissertation_id)
            .order_by(DissertationProposalContent.order_num)
        )
        return result.scalars().all()
    
    async def bulk_create_proposals(self, dissertation_id: UUID, data: BulkProposalsCreate, is_auto: bool = False):
        if data.replace_existing:
            await self.db.execute(delete(DissertationProposalContent).where(DissertationProposalContent.dissertation_id == dissertation_id))
        for i, p in enumerate(data.proposals, start=1):
            proposal = DissertationProposalContent(
                dissertation_id=dissertation_id,
                order_num=p.order_num or i,
                proposal_text=p.proposal_text,
                proposal_category=p.proposal_category,
                source_page=p.source_page,
                is_auto_extracted=is_auto
            )
            self.db.add(proposal)
        await self.db.commit()
    
    async def delete_proposal(self, dissertation_id: UUID, proposal_id: UUID):
        await self.db.execute(
            delete(DissertationProposalContent).where(
                DissertationProposalContent.id == proposal_id,
                DissertationProposalContent.dissertation_id == dissertation_id
            )
        )
        await self.db.commit()
```

---

## QADAM 5 — BACKEND ROUTERS

### 5.1 `back/app/routers/implementation_proposals.py`

```python
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional

from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.implementation_proposal import ProposalStatus
from app.services.implementation_proposal_service import ImplementationProposalService
from app.schemas.implementation_proposal import (
    ImplementationProposalCreate, ImplementationProposalUpdate,
    ImplementationProposalOut, ImplementationProposalList,
    ReviewAction, RejectAction, RevisionAction
)

router = APIRouter(prefix="/proposals", tags=["Implementation Proposals"])

def get_service(db: AsyncSession = Depends(get_db)):
    return ImplementationProposalService(db)

@router.post("/", response_model=ImplementationProposalOut, status_code=201)
async def create_proposal(
    data: ImplementationProposalCreate,
    current_user: User = Depends(get_current_user),
    service: ImplementationProposalService = Depends(get_service)
):
    if current_user.role not in [UserRole.admin, UserRole.moderator, UserRole.employee]:
        raise HTTPException(403, "Ruxsat yo'q")
    return await service.create(data, current_user.id)

@router.get("/my", response_model=ImplementationProposalList)
async def my_proposals(
    status: Optional[ProposalStatus] = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    service: ImplementationProposalService = Depends(get_service)
):
    return await service.list(user_id=current_user.id, status=status, page=page, size=size)

@router.get("/pending", response_model=ImplementationProposalList)
async def pending_proposals(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    service: ImplementationProposalService = Depends(get_service)
):
    if current_user.role not in [UserRole.admin, UserRole.moderator]:
        raise HTTPException(403, "Ruxsat yo'q")
    return await service.list(status=ProposalStatus.submitted, page=page, size=size)

@router.get("/", response_model=ImplementationProposalList)
async def list_proposals(
    status: Optional[ProposalStatus] = None,
    dissertation_id: Optional[UUID] = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    service: ImplementationProposalService = Depends(get_service)
):
    if current_user.role not in [UserRole.admin, UserRole.moderator]:
        raise HTTPException(403, "Ruxsat yo'q")
    return await service.list(status=status, dissertation_id=dissertation_id, page=page, size=size)

@router.get("/{proposal_id}", response_model=ImplementationProposalOut)
async def get_proposal(
    proposal_id: UUID,
    current_user: User = Depends(get_current_user),
    service: ImplementationProposalService = Depends(get_service)
):
    proposal = await service.get(proposal_id)
    if current_user.role not in [UserRole.admin, UserRole.moderator]:
        if proposal.proposed_by != current_user.id:
            raise HTTPException(403, "Ruxsat yo'q")
    return proposal

@router.put("/{proposal_id}", response_model=ImplementationProposalOut)
async def update_proposal(
    proposal_id: UUID,
    data: ImplementationProposalUpdate,
    current_user: User = Depends(get_current_user),
    service: ImplementationProposalService = Depends(get_service)
):
    proposal = await service.get(proposal_id)
    if current_user.role not in [UserRole.admin, UserRole.moderator]:
        if proposal.proposed_by != current_user.id:
            raise HTTPException(403, "Ruxsat yo'q")
    return await service.update(proposal_id, data, current_user.id)

@router.post("/{proposal_id}/submit", response_model=ImplementationProposalOut)
async def submit_proposal(
    proposal_id: UUID,
    current_user: User = Depends(get_current_user),
    service: ImplementationProposalService = Depends(get_service)
):
    proposal = await service.get(proposal_id)
    if current_user.role not in [UserRole.admin, UserRole.moderator]:
        if proposal.proposed_by != current_user.id:
            raise HTTPException(403, "Ruxsat yo'q")
    return await service.submit(proposal_id, current_user.id)

@router.post("/{proposal_id}/start-review", response_model=ImplementationProposalOut)
async def start_review(
    proposal_id: UUID,
    current_user: User = Depends(get_current_user),
    service: ImplementationProposalService = Depends(get_service)
):
    if current_user.role not in [UserRole.admin, UserRole.moderator]:
        raise HTTPException(403, "Ruxsat yo'q")
    return await service.start_review(proposal_id, current_user.id)

@router.post("/{proposal_id}/approve", response_model=ImplementationProposalOut)
async def approve_proposal(
    proposal_id: UUID,
    data: ReviewAction,
    current_user: User = Depends(get_current_user),
    service: ImplementationProposalService = Depends(get_service)
):
    if current_user.role not in [UserRole.admin, UserRole.moderator]:
        raise HTTPException(403, "Ruxsat yo'q")
    return await service.approve(proposal_id, current_user.id, data)

@router.post("/{proposal_id}/reject", response_model=ImplementationProposalOut)
async def reject_proposal(
    proposal_id: UUID,
    data: RejectAction,
    current_user: User = Depends(get_current_user),
    service: ImplementationProposalService = Depends(get_service)
):
    if current_user.role not in [UserRole.admin, UserRole.moderator]:
        raise HTTPException(403, "Ruxsat yo'q")
    return await service.reject(proposal_id, current_user.id, data)

@router.post("/{proposal_id}/request-revision", response_model=ImplementationProposalOut)
async def request_revision(
    proposal_id: UUID,
    data: RevisionAction,
    current_user: User = Depends(get_current_user),
    service: ImplementationProposalService = Depends(get_service)
):
    if current_user.role not in [UserRole.admin, UserRole.moderator]:
        raise HTTPException(403, "Ruxsat yo'q")
    return await service.request_revision(proposal_id, current_user.id, data)

@router.post("/{proposal_id}/resubmit", response_model=ImplementationProposalOut)
async def resubmit_proposal(
    proposal_id: UUID,
    current_user: User = Depends(get_current_user),
    service: ImplementationProposalService = Depends(get_service)
):
    proposal = await service.get(proposal_id)
    if proposal.proposed_by != current_user.id and current_user.role not in [UserRole.admin]:
        raise HTTPException(403, "Ruxsat yo'q")
    return await service.submit(proposal_id, current_user.id)
```

### 5.2 `back/app/routers/problems_proposals.py`

```python
from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List

from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.dissertation_content_service import DissertationContentService
from app.schemas.dissertation_content import (
    ProblemCreate, ProblemOut, ProposalContentCreate, ProposalContentOut,
    BulkProblemsCreate, BulkProposalsCreate
)
from app.ai.extractor import extract_problems_proposals_from_file

router = APIRouter(prefix="/dissertations", tags=["Problems & Proposals"])

def get_service(db: AsyncSession = Depends(get_db)):
    return DissertationContentService(db)

# --- PROBLEMS ---

@router.post("/{dissertation_id}/problems", response_model=ProblemOut, status_code=201)
async def add_problem(dissertation_id: UUID, data: ProblemCreate, service = Depends(get_service), current_user: User = Depends(get_current_user)):
    return await service.add_problem(dissertation_id, data)

@router.get("/{dissertation_id}/problems", response_model=List[ProblemOut])
async def get_problems(dissertation_id: UUID, service = Depends(get_service), current_user: User = Depends(get_current_user)):
    return await service.get_problems(dissertation_id)

@router.post("/{dissertation_id}/problems/bulk", status_code=201)
async def bulk_problems(dissertation_id: UUID, data: BulkProblemsCreate, service = Depends(get_service), current_user: User = Depends(get_current_user)):
    await service.bulk_create_problems(dissertation_id, data)
    return {"message": "Saqlandi"}

@router.delete("/{dissertation_id}/problems/{problem_id}", status_code=204)
async def delete_problem(dissertation_id: UUID, problem_id: UUID, service = Depends(get_service), current_user: User = Depends(get_current_user)):
    await service.delete_problem(dissertation_id, problem_id)

# --- PROPOSAL CONTENTS ---

@router.post("/{dissertation_id}/proposal-contents", response_model=ProposalContentOut, status_code=201)
async def add_proposal_content(dissertation_id: UUID, data: ProposalContentCreate, service = Depends(get_service), current_user: User = Depends(get_current_user)):
    return await service.add_proposal(dissertation_id, data)

@router.get("/{dissertation_id}/proposal-contents", response_model=List[ProposalContentOut])
async def get_proposal_contents(dissertation_id: UUID, service = Depends(get_service), current_user: User = Depends(get_current_user)):
    return await service.get_proposals(dissertation_id)

@router.post("/{dissertation_id}/proposal-contents/bulk", status_code=201)
async def bulk_proposals(dissertation_id: UUID, data: BulkProposalsCreate, service = Depends(get_service), current_user: User = Depends(get_current_user)):
    await service.bulk_create_proposals(dissertation_id, data)
    return {"message": "Saqlandi"}

@router.delete("/{dissertation_id}/proposal-contents/{proposal_id}", status_code=204)
async def delete_proposal_content(dissertation_id: UUID, proposal_id: UUID, service = Depends(get_service), current_user: User = Depends(get_current_user)):
    await service.delete_proposal(dissertation_id, proposal_id)

# --- AI EXTRACTION ---

@router.post("/{dissertation_id}/extract-problems-proposals")
async def extract_content(
    dissertation_id: UUID,
    file: UploadFile = File(...),
    service = Depends(get_service),
    current_user: User = Depends(get_current_user)
):
    """PDF yoki Word fayldan muammo va takliflarni AI yordamida ajratib olish"""
    content = await file.read()
    result = await extract_problems_proposals_from_file(content, file.filename)
    return result
```

### 5.3 `back/app/routers/search_problems.py`

```python
from fastapi import APIRouter, Query, Depends
from typing import Optional
from app.core.security import get_current_user

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("/problems-proposals")
async def search_problems_proposals(
    q: str = Query(..., min_length=2, description="Qidiruv so'zi"),
    type: str = Query("both", regex="^(problems|proposals|both)$"),
    field: Optional[str] = None,
    year_from: Optional[int] = None,
    year_to: Optional[int] = None,
    degree: Optional[str] = None,
    university_id: Optional[str] = None,
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=50),
    current_user = Depends(get_current_user)
):
    """Muammo va takliflar bo'yicha sodda qidiruv"""
    import httpx
    
    params = {
        "q": q, "type": type, "page": page, "size": size
    }
    if field: params["field"] = field
    if year_from: params["year_from"] = year_from
    if year_to: params["year_to"] = year_to
    if degree: params["degree"] = degree
    if university_id: params["university_id"] = university_id
    
    async with httpx.AsyncClient() as client:
        resp = await client.get("http://search-service:8001/search/problems-proposals", params=params)
        return resp.json()
```

---

## QADAM 6 — AI EXTRACTOR

### 6.1 `back/app/ai/extractor.py`

```python
import json
import re
from typing import Optional
import httpx

async def extract_text_from_file(content: bytes, filename: str) -> str:
    """PDF yoki Word dan matn ajratish"""
    if filename.lower().endswith('.pdf'):
        try:
            import pdfplumber
            import io
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                text = "\n".join(page.extract_text() or "" for page in pdf.pages[:50])
            return text
        except Exception:
            return ""
    elif filename.lower().endswith(('.docx', '.doc')):
        try:
            import docx
            import io
            doc = docx.Document(io.BytesIO(content))
            text = "\n".join(p.text for p in doc.paragraphs)
            return text
        except Exception:
            return ""
    return ""

async def extract_problems_proposals_from_file(content: bytes, filename: str) -> dict:
    """AI yordamida muammo va takliflarni ajratish"""
    text = await extract_text_from_file(content, filename)
    
    if not text.strip():
        return {"problems": [], "proposals": [], "error": "Fayldan matn ajratib bo'lmadi"}
    
    # Matnni qisqartir (token limit uchun)
    text_chunk = text[:8000]
    
    prompt = f"""Quyidagi dissertatsiya matnidan FAQAT muammolar va takliflarni ajratib ber.

Matn:
{text_chunk}

Natijani FAQAT JSON formatida qaytargin (boshqa hech narsa yozma):
{{
  "problems": [
    {{"order": 1, "text": "muammo matni...", "page": "sahifa (agar ma'lum bo'lsa)"}},
    ...
  ],
  "proposals": [
    {{"order": 1, "text": "taklif matni...", "page": "sahifa (agar ma'lum bo'lsa)"}},
    ...
  ]
}}

Agar muammo yoki taklif topilmasa, bo'sh array qaytargin."""

    try:
        # AI servisga yuborish
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                "http://ai-service:8002/extract",
                json={"prompt": prompt}
            )
            if resp.status_code == 200:
                result = resp.json()
                raw = result.get("text", "")
            else:
                raise Exception("AI servis xatosi")
        
        # JSON ajratish
        clean = re.sub(r'```json|```', '', raw).strip()
        data = json.loads(clean)
        return {
            "problems": [
                {"order": p.get("order", i+1), "problem_text": p.get("text", ""), "source_page": p.get("page")}
                for i, p in enumerate(data.get("problems", []))
            ],
            "proposals": [
                {"order": p.get("order", i+1), "proposal_text": p.get("text", ""), "source_page": p.get("page")}
                for i, p in enumerate(data.get("proposals", []))
            ]
        }
    except Exception as e:
        return {"problems": [], "proposals": [], "error": f"Ajratib bo'lmadi: {str(e)}"}
```

---

## QADAM 7 — SEARCH SERVICE

### 7.1 `services/search-service/app/routers/search_problems.py`

```python
from fastapi import APIRouter, Query
from typing import Optional
from app.elasticsearch_client import get_es_client

router = APIRouter()

@router.get("/search/problems-proposals")
async def search(
    q: str,
    type: str = "both",
    field: Optional[str] = None,
    year_from: Optional[int] = None,
    year_to: Optional[int] = None,
    degree: Optional[str] = None,
    university_id: Optional[str] = None,
    page: int = 1,
    size: int = 10
):
    es = get_es_client()
    
    should_clauses = []
    
    if type in ["problems", "both"]:
        should_clauses.append({
            "nested": {
                "path": "problems",
                "query": {"multi_match": {"query": q, "fields": ["problems.problem_text^2"], "fuzziness": "AUTO"}},
                "inner_hits": {"size": 3, "highlight": {"fields": {"problems.problem_text": {}}}}
            }
        })
    
    if type in ["proposals", "both"]:
        should_clauses.append({
            "nested": {
                "path": "proposal_contents",
                "query": {"multi_match": {"query": q, "fields": ["proposal_contents.proposal_text^2"], "fuzziness": "AUTO"}},
                "inner_hits": {"size": 3, "highlight": {"fields": {"proposal_contents.proposal_text": {}}}}
            }
        })
    
    filters = []
    if field: filters.append({"term": {"scientific_field": field}})
    if year_from: filters.append({"range": {"defense_year": {"gte": year_from}}})
    if year_to: filters.append({"range": {"defense_year": {"lte": year_to}}})
    if degree: filters.append({"term": {"degree": degree}})
    if university_id: filters.append({"term": {"university_id": university_id}})
    
    query = {
        "from": (page - 1) * size,
        "size": size,
        "query": {
            "bool": {
                "should": should_clauses,
                "minimum_should_match": 1,
                "filter": filters
            }
        }
    }
    
    result = await es.search(index="dissertations", body=query)
    
    hits = result["hits"]["hits"]
    total = result["hits"]["total"]["value"]
    
    items = []
    for hit in hits:
        src = hit["_source"]
        item = {
            "id": hit["_id"],
            "title": src.get("title"),
            "author": src.get("author_full_name"),
            "university": src.get("university_name"),
            "year": src.get("defense_year"),
            "degree": src.get("degree"),
            "matched_problems": [],
            "matched_proposals": []
        }
        
        inner = hit.get("inner_hits", {})
        
        if "problems" in inner:
            for ph in inner["problems"]["hits"]["hits"]:
                highlight = ph.get("highlight", {})
                hl_text = highlight.get("problems.problem_text", [ph["_source"].get("problem_text", "")])[0]
                item["matched_problems"].append({"text": hl_text, "page": ph["_source"].get("source_page")})
        
        if "proposal_contents" in inner:
            for ph in inner["proposal_contents"]["hits"]["hits"]:
                highlight = ph.get("highlight", {})
                hl_text = highlight.get("proposal_contents.proposal_text", [ph["_source"].get("proposal_text", "")])[0]
                item["matched_proposals"].append({"text": hl_text, "page": ph["_source"].get("source_page")})
        
        items.append(item)
    
    return {"items": items, "total": total, "page": page, "size": size, "pages": (total + size - 1) // size, "query": q}
```

---

## QADAM 8 — FRONTEND

### 8.1 `front/src/types/implementation-proposal.ts`

```typescript
export type ProposalStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'revision_required'
export type ProposalPriority = 'low' | 'medium' | 'high' | 'critical'

export interface StatusHistory {
  id: string
  from_status: ProposalStatus | null
  to_status: ProposalStatus
  comment: string | null
  changed_at: string
  changed_by: string
}

export interface ImplementationProposal {
  id: string
  dissertation_id: string
  proposed_by: string
  reviewed_by: string | null
  title: string
  problem_description: string
  proposal_text: string
  expected_result: string
  implementation_area: string
  implementation_org: string
  priority: ProposalPriority
  source_chapter: string | null
  source_pages: string | null
  status: ProposalStatus
  submitted_at: string | null
  reviewed_at: string | null
  deadline: string | null
  reviewer_comment: string | null
  revision_notes: string | null
  attachment_url: string | null
  created_at: string
  updated_at: string
  status_history: StatusHistory[]
}

export const STATUS_LABELS: Record<ProposalStatus, string> = {
  draft: 'Qoralama',
  submitted: 'Yuborildi',
  under_review: "Ko'rib chiqilmoqda",
  approved: 'Tasdiqlandi',
  rejected: 'Rad etildi',
  revision_required: 'Qayta ishlash kerak'
}

export const STATUS_COLORS: Record<ProposalStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  revision_required: 'bg-orange-100 text-orange-700'
}

export const PRIORITY_LABELS: Record<ProposalPriority, string> = {
  low: 'Past', medium: "O'rta", high: 'Yuqori', critical: 'Kritik'
}

export interface ProblemItem { id?: string; order_num: number; problem_text: string; source_page?: string }
export interface ProposalItem { id?: string; order_num: number; proposal_text: string; source_page?: string }

export interface SearchResult {
  id: string; title: string; author: string; university: string
  year: number; degree: string
  matched_problems: { text: string; page?: string }[]
  matched_proposals: { text: string; page?: string }[]
}
```

### 8.2 `front/src/components/proposals/ProposalStatusBadge.tsx`

```tsx
import { ProposalStatus, STATUS_LABELS, STATUS_COLORS } from '@/types/implementation-proposal'

export function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
```

### 8.3 `front/src/components/proposals/StatusHistoryTimeline.tsx`

```tsx
import { StatusHistory } from '@/types/implementation-proposal'
import { STATUS_LABELS } from '@/types/implementation-proposal'
import { format } from 'date-fns'

export function StatusHistoryTimeline({ history }: { history: StatusHistory[] }) {
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((item, idx) => (
          <li key={item.id}>
            <div className="relative pb-8">
              {idx !== history.length - 1 && (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
              )}
              <div className="relative flex space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white text-xs">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1 pt-1.5">
                  <div className="text-sm text-gray-900">
                    <span className="font-medium">{STATUS_LABELS[item.to_status]}</span>
                    {item.from_status && (
                      <span className="text-gray-500"> ← {STATUS_LABELS[item.from_status]}</span>
                    )}
                  </div>
                  {item.comment && <p className="mt-1 text-sm text-gray-600">{item.comment}</p>}
                  <p className="mt-0.5 text-xs text-gray-400">
                    {format(new Date(item.changed_at), 'dd.MM.yyyy HH:mm')}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### 8.4 `front/src/components/problems-proposals/ProblemsProposalsEditor.tsx`

```tsx
'use client'
import { useState } from 'react'
import { ProblemItem, ProposalItem } from '@/types/implementation-proposal'
import { Plus, Trash2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

interface Props {
  dissertationId: string
  initialProblems?: ProblemItem[]
  initialProposals?: ProposalItem[]
  onSave?: (problems: ProblemItem[], proposals: ProposalItem[]) => void
}

export function ProblemsProposalsEditor({ dissertationId, initialProblems = [], initialProposals = [], onSave }: Props) {
  const [problems, setProblems] = useState<ProblemItem[]>(initialProblems)
  const [proposals, setProposals] = useState<ProposalItem[]>(initialProposals)
  const [showPages, setShowPages] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [saving, setSaving] = useState(false)

  const addProblem = () => setProblems(p => [...p, { order_num: p.length + 1, problem_text: '' }])
  const addProposal = () => setProposals(p => [...p, { order_num: p.length + 1, proposal_text: '' }])
  
  const updateProblem = (idx: number, text: string) => setProblems(p => p.map((item, i) => i === idx ? { ...item, problem_text: text } : item))
  const updateProposal = (idx: number, text: string) => setProposals(p => p.map((item, i) => i === idx ? { ...item, proposal_text: text } : item))
  const updateProblemPage = (idx: number, page: string) => setProblems(p => p.map((item, i) => i === idx ? { ...item, source_page: page } : item))
  const updateProposalPage = (idx: number, page: string) => setProposals(p => p.map((item, i) => i === idx ? { ...item, source_page: page } : item))
  
  const removeProblem = (idx: number) => setProblems(p => p.filter((_, i) => i !== idx).map((item, i) => ({ ...item, order_num: i + 1 })))
  const removeProposal = (idx: number) => setProposals(p => p.filter((_, i) => i !== idx).map((item, i) => ({ ...item, order_num: i + 1 })))

  const handleExtract = async (file: File) => {
    setExtracting(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch(`/api/v1/dissertations/${dissertationId}/extract-problems-proposals`, { method: 'POST', body: formData })
      const data = await res.json()
      if (data.problems) setProblems(data.problems.map((p: any, i: number) => ({ order_num: i + 1, problem_text: p.problem_text, source_page: p.source_page })))
      if (data.proposals) setProposals(data.proposals.map((p: any, i: number) => ({ order_num: i + 1, proposal_text: p.proposal_text, source_page: p.source_page })))
    } catch(e) { alert('Ajratishda xato') } 
    finally { setExtracting(false) }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch(`/api/v1/dissertations/${dissertationId}/problems/bulk`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problems: problems.filter(p => p.problem_text.trim()), replace_existing: true })
      })
      await fetch(`/api/v1/dissertations/${dissertationId}/proposal-contents/bulk`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposals: proposals.filter(p => p.proposal_text.trim()), replace_existing: true })
      })
      onSave?.(problems, proposals)
    } catch(e) { alert('Saqlashda xato') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      {/* AI Extract */}
      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <Sparkles className="text-blue-500 shrink-0" size={20} />
        <div className="flex-1 text-sm text-blue-700">
          PDF yoki Word yuklasangiz, AI avtomatik ajratadi
        </div>
        <label className="cursor-pointer">
          <input type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={e => e.target.files?.[0] && handleExtract(e.target.files[0])} />
          <Button variant="outline" size="sm" disabled={extracting} asChild>
            <span>{extracting ? 'Ajratyapti...' : 'Fayl yuklash'}</span>
          </Button>
        </label>
      </div>

      {/* Pages toggle */}
      <button type="button" onClick={() => setShowPages(s => !s)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        {showPages ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        Sahifalarni {showPages ? 'yashirish' : 'ko\'rsatish'}
      </button>

      {/* MUAMMOLAR */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
          Muammolar
        </h3>
        <div className="space-y-2">
          {problems.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <span className="mt-2.5 text-sm text-gray-400 w-6 shrink-0">{idx + 1}.</span>
              <div className="flex-1 space-y-1">
                <Textarea
                  value={item.problem_text}
                  onChange={e => updateProblem(idx, e.target.value)}
                  placeholder="Muammo matnini kiriting..."
                  className="min-h-[80px] resize-none"
                />
                {showPages && (
                  <Input value={item.source_page || ''} onChange={e => updateProblemPage(idx, e.target.value)} placeholder="Sahifa (masalan: 45)" className="h-8 text-sm" />
                )}
              </div>
              <button onClick={() => removeProblem(idx)} className="mt-2.5 text-gray-300 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button onClick={addProblem} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-1">
            <Plus size={14} /> Muammo qo'shish
          </button>
        </div>
      </div>

      {/* TAKLIFLAR */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
          Takliflar
        </h3>
        <div className="space-y-2">
          {proposals.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <span className="mt-2.5 text-sm text-gray-400 w-6 shrink-0">{idx + 1}.</span>
              <div className="flex-1 space-y-1">
                <Textarea
                  value={item.proposal_text}
                  onChange={e => updateProposal(idx, e.target.value)}
                  placeholder="Taklif matnini kiriting..."
                  className="min-h-[80px] resize-none"
                />
                {showPages && (
                  <Input value={item.source_page || ''} onChange={e => updateProposalPage(idx, e.target.value)} placeholder="Sahifa (masalan: 89)" className="h-8 text-sm" />
                )}
              </div>
              <button onClick={() => removeProposal(idx)} className="mt-2.5 text-gray-300 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button onClick={addProposal} className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 mt-1">
            <Plus size={14} /> Taklif qo'shish
          </button>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? 'Saqlanmoqda...' : 'Saqlash'}
      </Button>
    </div>
  )
}
```

### 8.5 `front/src/components/search/SimpleProblemSearch.tsx`

```tsx
'use client'
import { useState } from 'react'
import { Search, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SearchResult } from '@/types/implementation-proposal'

export function SimpleProblemSearch() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState<'both' | 'problems' | 'proposals'>('both')
  const [showFilters, setShowFilters] = useState(false)
  const [yearFrom, setYearFrom] = useState('')
  const [yearTo, setYearTo] = useState('')
  const [field, setField] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const params = new URLSearchParams({ q: query, type })
      if (yearFrom) params.append('year_from', yearFrom)
      if (yearTo) params.append('year_to', yearTo)
      if (field) params.append('field', field)
      const res = await fetch(`/api/v1/search/problems-proposals?${params}`)
      const data = await res.json()
      setResults(data.items || [])
      setTotal(data.total || 0)
    } catch(e) { setResults([]) }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Muammo va Takliflar Qidiruvi</h1>
        <p className="text-gray-500 text-sm">Dissertatsiyalardagi muammo va takliflar bo'yicha qidiring</p>
      </div>

      <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Qidiruv so'zini kiriting..."
              className="pl-10 h-12 text-base"
              autoFocus
            />
          </div>
          <Button type="submit" size="lg" disabled={loading} className="px-8">
            {loading ? 'Qidirmoqda...' : 'Qidirish'}
          </Button>
        </div>

        {/* Type selector */}
        <div className="flex gap-4 text-sm">
          {([['both', 'Ikkalasi'], ['problems', 'Muammolar'], ['proposals', 'Takliflar']] as const).map(([val, label]) => (
            <label key={val} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value={val} checked={type === val} onChange={() => setType(val)} className="text-blue-600" />
              <span className={type === val ? 'text-blue-600 font-medium' : 'text-gray-600'}>{label}</span>
            </label>
          ))}
        </div>

        {/* Advanced filters */}
        <div>
          <button type="button" onClick={() => setShowFilters(s => !s)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Qo'shimcha filtrlar
          </button>
          {showFilters && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Yildan</label>
                <Input type="number" value={yearFrom} onChange={e => setYearFrom(e.target.value)} placeholder="2015" min="1990" max="2030" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Yilgacha</label>
                <Input type="number" value={yearTo} onChange={e => setYearTo(e.target.value)} placeholder="2026" min="1990" max="2030" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Ilmiy soha</label>
                <Input value={field} onChange={e => setField(e.target.value)} placeholder="Huquq, iqtisodiyot..." />
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Results */}
      {searched && (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            {loading ? 'Qidirmoqda...' : `${total} ta natija topildi`}
          </p>
          <div className="space-y-4">
            {results.map(result => (
              <SearchResultCard key={result.id} result={result} query={query} />
            ))}
            {!loading && searched && results.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <BookOpen size={40} className="mx-auto mb-3 opacity-50" />
                <p>Natija topilmadi. Boshqa so'z bilan qidiring.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SearchResultCard({ result, query }: { result: SearchResult; query: string }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{result.title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{result.author} · {result.university} · {result.year}</p>
        </div>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full shrink-0 ml-3">{result.degree}</span>
      </div>
      
      {result.matched_problems.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-red-600 mb-1.5 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Muammolar
          </p>
          {result.matched_problems.map((p, i) => (
            <p key={i} className="text-sm text-gray-700 bg-red-50 rounded px-3 py-2 mb-1" 
               dangerouslySetInnerHTML={{ __html: p.text }} />
          ))}
        </div>
      )}
      
      {result.matched_proposals.length > 0 && (
        <div>
          <p className="text-xs font-medium text-green-600 mb-1.5 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Takliflar
          </p>
          {result.matched_proposals.map((p, i) => (
            <p key={i} className="text-sm text-gray-700 bg-green-50 rounded px-3 py-2 mb-1"
               dangerouslySetInnerHTML={{ __html: p.text }} />
          ))}
        </div>
      )}
      
      <div className="mt-3 flex gap-2">
        <a href={`/dissertations/${result.id}`} className="text-xs text-blue-600 hover:underline">Batafsil →</a>
      </div>
    </div>
  )
}
```

---

## QADAM 9 — ROUTER ULASH

### 9.1 `back/app/main.py` ga qo'sh:

```python
from app.routers import implementation_proposals, problems_proposals, search_problems

app.include_router(implementation_proposals.router, prefix="/api/v1")
app.include_router(problems_proposals.router, prefix="/api/v1")
app.include_router(search_problems.router, prefix="/api/v1")
```

### 9.2 Search service `main.py` ga qo'sh:

```python
from app.routers.search_problems import router as problems_search_router
app.include_router(problems_search_router)
```

---

## QADAM 10 — FRONTEND SAHIFALAR

### 10.1 `front/src/app/(dashboard)/proposals/page.tsx`

My proposals page — `ProposalCard` komponentlari bilan jadval ko'rinishi. `useEffect` bilan `/api/v1/proposals/my` dan ma'lumot olish. Filter: `ProposalStatus` bo'yicha.

### 10.2 `front/src/app/(dashboard)/proposals/new/page.tsx`

`react-hook-form` + `zod` bilan taklif shakli. Barcha maydonlar. "Qoralama saqlash" va "Yuborish" tugmalari.

### 10.3 `front/src/app/(dashboard)/search/problems/page.tsx`

```tsx
import { SimpleProblemSearch } from '@/components/search/SimpleProblemSearch'
export default function ProblemsSearchPage() {
  return <div className="container py-8"><SimpleProblemSearch /></div>
}
```

### 10.4 `front/src/app/(dashboard)/admin/proposals/page.tsx`

Admin uchun barcha takliflar jadval ko'rinishida. Filtrlar. Badge lar. Ko'rib chiqish havolalari.

### 10.5 Sidebar ga qo'sh:

```tsx
// Mavjud sidebar komponentiga:
{ label: "Takliflar", href: "/proposals", icon: FileCheck, roles: ['employee', 'moderator', 'admin'] },
{ label: "M&T Qidiruv", href: "/search/problems", icon: Search, roles: ['all'] },
{ label: "Takliflar (Admin)", href: "/admin/proposals", icon: ClipboardCheck, roles: ['admin', 'moderator'] },
```

---

## QADAM 11 — REQUIREMENTS.TXT YANGILASH

`back/requirements.txt` ga qo'sh:
```
pdfplumber>=0.9.0
python-docx>=1.0.0
httpx>=0.25.0
```

---

## YAKUNIY TEKSHIRISH RO'YXATI

Hammasini tugatgach:

```bash
# 1. Backend migratsiyalar
cd back && alembic upgrade head

# 2. Backend ishga tushirish
docker compose up -d --build

# 3. API tekshirish
curl http://localhost:8000/docs
# implementation_proposals va problems_proposals routerlari ko'rinishi kerak

# 4. Qidiruv tekshirish
curl "http://localhost:8000/api/v1/search/problems-proposals?q=test"

# 5. Frontend
cd front && npm run build
# Build xatosiz tugashi kerak
```

**MUHIM ESLATMALAR:**

1. `back/app/models/__init__.py` ga yangi modellarni import qil
2. `back/app/routers/__init__.py` yangilang
3. Elasticsearch `dissertations` indeksiga `problems` va `proposal_contents` nested mappinglarni qo'sh
4. Mavjud `dissertation` model `Dissertation` ga yangi relationship lar qo'shilganini tekshir
5. Har bir yangi fayl yaratganda `back/app/core/config.py` yoki `env` ga tegadigan narsa bo'lsa, `.env.example` ni ham yangilang
6. AI servis ulanmagan bo'lsa, `extractor.py` graceful fallback qaytaradi — bu OK

---

*Cursor Super Prompt | Dissertatsiya Reestri v2.0 | 2026-03-23*
