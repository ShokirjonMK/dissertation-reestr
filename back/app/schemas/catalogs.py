"""
Katalog sxemalari — Ko'p tilli (uz, ru, en) qo'llab-quvvatlash bilan

Har bir katalog uchun:
  - Base   : create/update uchun kiritish sxemasi
  - Read   : API javobida qaytariladigan sxema
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator


# ─── Country ─────────────────────────────────────────────────────────────────

class CountryBase(BaseModel):
    name_uz: str
    name_ru: str = ""
    name_en: str = ""
    code: str

    @field_validator("name_uz")
    @classmethod
    def name_uz_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("name_uz bo'sh bo'lishi mumkin emas")
        return v.strip()

    @field_validator("code")
    @classmethod
    def code_upper(cls, v: str) -> str:
        return v.strip().upper()


class CountryRead(CountryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ─── ScientificDirection ─────────────────────────────────────────────────────

class ScientificDirectionBase(BaseModel):
    name_uz: str
    name_ru: str = ""
    name_en: str = ""
    code: Optional[str] = None
    description: str = ""

    @field_validator("name_uz")
    @classmethod
    def name_uz_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("name_uz bo'sh bo'lishi mumkin emas")
        return v.strip()


class ScientificDirectionRead(ScientificDirectionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ─── University ──────────────────────────────────────────────────────────────

class UniversityBase(BaseModel):
    name_uz: str
    name_ru: str = ""
    name_en: str = ""
    short_name: str = ""
    country_id: Optional[int] = None
    region_id: Optional[int] = None

    @field_validator("name_uz")
    @classmethod
    def name_uz_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("name_uz bo'sh bo'lishi mumkin emas")
        return v.strip()


class UniversityRead(UniversityBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UniversityReadFull(UniversityRead):
    """Mamlakat va region ma'lumotlari bilan to'liq javob"""
    country: Optional[CountryRead] = None


# ─── Region ──────────────────────────────────────────────────────────────────

class RegionBase(BaseModel):
    name_uz: str
    name_ru: str = ""
    name_en: str = ""
    country_id: Optional[int] = None

    @field_validator("name_uz")
    @classmethod
    def name_uz_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("name_uz bo'sh bo'lishi mumkin emas")
        return v.strip()


class RegionRead(RegionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ─── District ────────────────────────────────────────────────────────────────

class DistrictBase(BaseModel):
    name_uz: str
    name_ru: str = ""
    name_en: str = ""
    region_id: int

    @field_validator("name_uz")
    @classmethod
    def name_uz_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("name_uz bo'sh bo'lishi mumkin emas")
        return v.strip()


class DistrictRead(DistrictBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
