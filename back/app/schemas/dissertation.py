from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.entities import DissertationStatus


class DissertationBase(BaseModel):
    title: str
    scientific_direction_id: int
    university_id: int
    supervisor_id: int | None = None
    problem: str
    proposal: str
    annotation: str
    conclusion: str
    keywords: list[str] = Field(default_factory=list)
    defense_date: date | None = None
    category: str = "general"
    expert_rating: float = 0.0
    region_id: int | None = None
    visibility: str = "internal"
    status: DissertationStatus = DissertationStatus.DRAFT


class DissertationCreate(DissertationBase):
    author_id: int | None = None


class DissertationUpdate(BaseModel):
    title: str | None = None
    scientific_direction_id: int | None = None
    university_id: int | None = None
    author_id: int | None = None
    supervisor_id: int | None = None
    problem: str | None = None
    proposal: str | None = None
    annotation: str | None = None
    conclusion: str | None = None
    keywords: list[str] | None = None
    defense_date: date | None = None
    category: str | None = None
    expert_rating: float | None = None
    region_id: int | None = None
    visibility: str | None = None
    status: DissertationStatus | None = None


class DissertationRead(DissertationBase):
    id: int
    author_id: int
    author_name: str | None = None
    supervisor_name: str | None = None
    university_name: str | None = None
    scientific_direction_name: str | None = None
    autoreferat_file_name: str | None = None
    dissertation_pdf_file_name: str | None = None
    dissertation_word_file_name: str | None = None
    has_autoreferat_file: bool = False
    has_dissertation_pdf_file: bool = False
    has_dissertation_word_file: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DissertationDetailRead(DissertationRead):
    autoreferat_text: str | None = None
    dissertation_word_text: str | None = None


class DissertationFilter(BaseModel):
    scientific_direction_id: int | None = None
    university_id: int | None = None
    author_id: int | None = None
    supervisor_id: int | None = None
    year: int | None = None
    status: DissertationStatus | None = None
    query: str | None = None

    title: str | None = None
    problem: str | None = None
    proposal: str | None = None
    annotation: str | None = None
    conclusion: str | None = None
    keywords: str | None = None
    author: str | None = None
    supervisor: str | None = None
    category: str | None = None
    expert_rating_min: float | None = None
    region_id: int | None = None
    visibility: str | None = None
