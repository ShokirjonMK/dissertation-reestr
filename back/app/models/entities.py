import enum
from datetime import date, datetime

from sqlalchemy import (
    JSON,
    Boolean,
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


class RoleName(str, enum.Enum):
    ADMIN = "admin"
    MODERATOR = "moderator"
    DOCTORANT = "doctorant"
    SUPERVISOR = "supervisor"
    EMPLOYEE = "employee"


class DissertationStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    DEFENDED = "defended"


class Role(Base, TimestampMixin):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[RoleName] = mapped_column(Enum(RoleName), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(String(255), default="")

    users: Mapped[list["User"]] = relationship("User", back_populates="role")


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"), nullable=False)

    role: Mapped[Role] = relationship("Role", back_populates="users")
    profile: Mapped["UserProfile"] = relationship("UserProfile", back_populates="user", uselist=False)


class UserProfile(Base, TimestampMixin):
    __tablename__ = "user_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)

    image: Mapped[str | None] = mapped_column(String(255), nullable=True)
    last_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    first_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    middle_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    passport_seria: Mapped[str | None] = mapped_column(String(10), nullable=True)
    passport_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    passport_pin: Mapped[str | None] = mapped_column(String(20), nullable=True)
    passport_given_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    passport_issued_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    passport_given_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    birthday: Mapped[date | None] = mapped_column(Date, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    phone_secondary: Mapped[str | None] = mapped_column(String(30), nullable=True)
    passport_file: Mapped[str | None] = mapped_column(String(255), nullable=True)
    country_id: Mapped[int | None] = mapped_column(ForeignKey("countries.id"), nullable=True)
    is_foreign: Mapped[bool] = mapped_column(Boolean, default=False)
    region_id: Mapped[int | None] = mapped_column(ForeignKey("regions.id"), nullable=True)
    area_id: Mapped[int | None] = mapped_column(ForeignKey("districts.id"), nullable=True)
    address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)

    user: Mapped[User] = relationship("User", back_populates="profile")
    country: Mapped["Country | None"] = relationship("Country")


# ─── Katalog modellari ────────────────────────────────────────────────────────

class Country(Base, TimestampMixin):
    """Mamlakatlar kataloги — ko'p tilli nomlar + ISO kodi"""
    __tablename__ = "countries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name_uz: Mapped[str] = mapped_column(String(255), nullable=False)
    name_ru: Mapped[str] = mapped_column(String(255), nullable=False)
    name_en: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(10), unique=True, nullable=False)

    regions: Mapped[list["Region"]] = relationship("Region", back_populates="country")
    universities: Mapped[list["University"]] = relationship("University", back_populates="country")

    def get_name(self, lang: str = "uz") -> str:
        return getattr(self, f"name_{lang}", self.name_uz)


class ScientificDirection(Base, TimestampMixin):
    """Ilmiy yo'nalishlar katalogi — ko'p tilli"""
    __tablename__ = "scientific_directions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name_uz: Mapped[str] = mapped_column(String(255), nullable=False)
    name_ru: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    name_en: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    code: Mapped[str] = mapped_column(String(20), nullable=True)
    description: Mapped[str] = mapped_column(Text, default="")

    # Orqaga muvofiqlik uchun (legacy)
    @property
    def name(self) -> str:
        return self.name_uz

    def get_name(self, lang: str = "uz") -> str:
        return getattr(self, f"name_{lang}", self.name_uz) or self.name_uz


class University(Base, TimestampMixin):
    """Universitetlar katalogi — ko'p tilli + mamlakat + region"""
    __tablename__ = "universities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name_uz: Mapped[str] = mapped_column(String(255), nullable=False)
    name_ru: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    name_en: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    short_name: Mapped[str] = mapped_column(String(64), default="")
    country_id: Mapped[int | None] = mapped_column(ForeignKey("countries.id"), nullable=True)
    region_id: Mapped[int | None] = mapped_column(ForeignKey("regions.id"), nullable=True)

    country: Mapped["Country | None"] = relationship("Country", back_populates="universities")
    region: Mapped["Region | None"] = relationship("Region")

    # Orqaga muvofiqlik uchun
    @property
    def name(self) -> str:
        return self.name_uz

    def get_name(self, lang: str = "uz") -> str:
        return getattr(self, f"name_{lang}", self.name_uz) or self.name_uz


class Region(Base, TimestampMixin):
    """Regionlar (viloyatlar) katalogi — ko'p tilli + mamlakat"""
    __tablename__ = "regions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name_uz: Mapped[str] = mapped_column(String(120), nullable=False)
    name_ru: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    name_en: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    country_id: Mapped[int | None] = mapped_column(ForeignKey("countries.id"), nullable=True)

    country: Mapped["Country | None"] = relationship("Country", back_populates="regions")
    districts: Mapped[list["District"]] = relationship("District", back_populates="region")

    # Orqaga muvofiqlik
    @property
    def name(self) -> str:
        return self.name_uz

    def get_name(self, lang: str = "uz") -> str:
        return getattr(self, f"name_{lang}", self.name_uz) or self.name_uz


class District(Base, TimestampMixin):
    """Tumanlar katalogi — ko'p tilli"""
    __tablename__ = "districts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name_uz: Mapped[str] = mapped_column(String(120), nullable=False)
    name_ru: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    name_en: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    region_id: Mapped[int] = mapped_column(ForeignKey("regions.id"), nullable=False)

    region: Mapped[Region] = relationship("Region", back_populates="districts")

    @property
    def name(self) -> str:
        return self.name_uz

    def get_name(self, lang: str = "uz") -> str:
        return getattr(self, f"name_{lang}", self.name_uz) or self.name_uz


# ─── Dissertatsiya modeli ─────────────────────────────────────────────────────

class Dissertation(Base, TimestampMixin):
    __tablename__ = "dissertations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    scientific_direction_id: Mapped[int] = mapped_column(ForeignKey("scientific_directions.id"), nullable=False)
    university_id: Mapped[int] = mapped_column(ForeignKey("universities.id"), nullable=False)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    supervisor_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    region_id: Mapped[int | None] = mapped_column(ForeignKey("regions.id"), nullable=True)
    country_id: Mapped[int | None] = mapped_column(ForeignKey("countries.id"), nullable=True)
    problem: Mapped[str] = mapped_column(Text, nullable=False)
    proposal: Mapped[str] = mapped_column(Text, nullable=False)
    annotation: Mapped[str] = mapped_column(Text, nullable=False)
    conclusion: Mapped[str] = mapped_column(Text, nullable=False)
    keywords: Mapped[list[str]] = mapped_column(JSON, default=list)
    defense_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    category: Mapped[str] = mapped_column(String(80), default="general")
    expert_rating: Mapped[float] = mapped_column(Float, default=0.0)
    visibility: Mapped[str] = mapped_column(String(20), default="internal")
    status: Mapped[DissertationStatus] = mapped_column(Enum(DissertationStatus), default=DissertationStatus.DRAFT)

    scientific_direction: Mapped[ScientificDirection] = relationship("ScientificDirection")
    university: Mapped[University] = relationship("University")
    author: Mapped[User] = relationship("User", foreign_keys=[author_id])
    supervisor: Mapped[User | None] = relationship("User", foreign_keys=[supervisor_id])
    region: Mapped[Region | None] = relationship("Region")
    country: Mapped["Country | None"] = relationship("Country")
    document: Mapped["DissertationDocument | None"] = relationship(
        "DissertationDocument",
        back_populates="dissertation",
        uselist=False,
        cascade="all, delete-orphan",
    )
    implementation_proposals: Mapped[list["ImplementationProposal"]] = relationship(
        "ImplementationProposal",
        back_populates="dissertation",
        cascade="all, delete-orphan",
    )
    problems: Mapped[list["DissertationProblem"]] = relationship(
        "DissertationProblem",
        back_populates="dissertation",
        cascade="all, delete-orphan",
        order_by="DissertationProblem.order_num",
    )
    proposal_contents: Mapped[list["DissertationProposalContent"]] = relationship(
        "DissertationProposalContent",
        back_populates="dissertation",
        cascade="all, delete-orphan",
        order_by="DissertationProposalContent.order_num",
    )

    @property
    def author_name(self) -> str:
        if self.author and self.author.profile:
            parts = filter(None, [
                self.author.profile.last_name,
                self.author.profile.first_name,
                self.author.profile.middle_name,
            ])
            full = " ".join(parts)
            return full if full else self.author.username
        return self.author.username if self.author else ""

    @property
    def supervisor_name(self) -> str:
        if self.supervisor and self.supervisor.profile:
            parts = filter(None, [
                self.supervisor.profile.last_name,
                self.supervisor.profile.first_name,
            ])
            full = " ".join(parts)
            return full if full else self.supervisor.username
        return self.supervisor.username if self.supervisor else ""

    @property
    def university_name(self) -> str:
        return self.university.name_uz if self.university else ""

    @property
    def scientific_direction_name(self) -> str:
        return self.scientific_direction.name_uz if self.scientific_direction else ""

    @property
    def autoreferat_text(self) -> str | None:
        return self.document.autoreferat_text if self.document else None

    @property
    def dissertation_word_text(self) -> str | None:
        return self.document.dissertation_word_text if self.document else None

    @property
    def autoreferat_file_name(self) -> str | None:
        return self.document.autoreferat_file_name if self.document else None

    @property
    def dissertation_pdf_file_name(self) -> str | None:
        return self.document.dissertation_pdf_file_name if self.document else None

    @property
    def dissertation_word_file_name(self) -> str | None:
        return self.document.dissertation_word_file_name if self.document else None

    @property
    def has_autoreferat_file(self) -> bool:
        return bool(self.document and self.document.autoreferat_file_path)

    @property
    def has_dissertation_pdf_file(self) -> bool:
        return bool(self.document and self.document.dissertation_pdf_file_path)

    @property
    def has_dissertation_word_file(self) -> bool:
        return bool(self.document and self.document.dissertation_word_file_path)


class DissertationDocument(Base, TimestampMixin):
    __tablename__ = "dissertation_documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    dissertation_id: Mapped[int] = mapped_column(ForeignKey("dissertations.id"), unique=True, nullable=False)
    autoreferat_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    autoreferat_file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    autoreferat_file_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    dissertation_pdf_file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    dissertation_pdf_file_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    dissertation_word_file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    dissertation_word_file_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    dissertation_word_text: Mapped[str | None] = mapped_column(Text, nullable=True)

    dissertation: Mapped[Dissertation] = relationship("Dissertation", back_populates="document")
