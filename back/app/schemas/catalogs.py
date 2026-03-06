from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ScientificDirectionBase(BaseModel):
    name: str
    description: str = ""


class ScientificDirectionRead(ScientificDirectionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UniversityBase(BaseModel):
    name: str
    short_name: str = ""


class UniversityRead(UniversityBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RegionBase(BaseModel):
    name: str


class RegionRead(RegionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DistrictBase(BaseModel):
    name: str
    region_id: int


class DistrictRead(DistrictBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
