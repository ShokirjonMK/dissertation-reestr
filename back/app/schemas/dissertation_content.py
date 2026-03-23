from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class ProblemCreate(BaseModel):
    problem_text: str = Field(..., min_length=5)
    problem_category: str | None = None
    source_page: str | None = None
    order_num: int | None = 1


class ProblemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_num: int
    problem_text: str
    problem_category: str | None
    source_page: str | None
    is_auto_extracted: bool


class ProposalContentCreate(BaseModel):
    proposal_text: str = Field(..., min_length=5)
    proposal_category: str | None = None
    source_page: str | None = None
    order_num: int | None = 1


class ProposalContentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_num: int
    proposal_text: str
    proposal_category: str | None
    source_page: str | None
    is_auto_extracted: bool


class BulkProblemsCreate(BaseModel):
    problems: list[ProblemCreate]
    replace_existing: bool = False


class BulkProposalsCreate(BaseModel):
    proposals: list[ProposalContentCreate]
    replace_existing: bool = False


class ExtractedContent(BaseModel):
    problems: list[ProblemCreate]
    proposals: list[ProposalContentCreate]
