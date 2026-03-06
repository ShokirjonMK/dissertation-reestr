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
    status: DissertationStatus = DissertationStatus.DRAFT


class DissertationCreate(DissertationBase):
    pass


class DissertationUpdate(BaseModel):
    title: str | None = None
    scientific_direction_id: int | None = None
    university_id: int | None = None
    supervisor_id: int | None = None
    problem: str | None = None
    proposal: str | None = None
    annotation: str | None = None
    conclusion: str | None = None
    keywords: list[str] | None = None
    defense_date: date | None = None
    status: DissertationStatus | None = None


class DissertationRead(DissertationBase):
    id: int
    author_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DissertationFilter(BaseModel):
    scientific_direction_id: int | None = None
    university_id: int | None = None
    author_id: int | None = None
    supervisor_id: int | None = None
    year: int | None = None
    status: DissertationStatus | None = None
    query: str | None = None
