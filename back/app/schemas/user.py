from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class RoleRead(BaseModel):
    id: int
    name: str
    description: str

    model_config = ConfigDict(from_attributes=True)


class UserRead(BaseModel):
    id: int
    username: str
    email: EmailStr
    is_active: bool
    role: RoleRead

    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role_name: str


class UserProfileBase(BaseModel):
    image: str | None = None
    last_name: str | None = None
    first_name: str | None = None
    middle_name: str | None = None
    passport_seria: str | None = None
    passport_number: str | None = None
    passport_pin: str | None = None
    passport_given_date: date | None = None
    passport_issued_date: date | None = None
    passport_given_by: str | None = None
    birthday: date | None = None
    phone: str | None = None
    phone_secondary: str | None = None
    passport_file: str | None = None
    country_id: int | None = None
    is_foreign: bool = False
    region_id: int | None = None
    area_id: int | None = None
    address: str | None = None
    gender: str | None = None


class UserProfileUpdate(UserProfileBase):
    pass


class UserProfileRead(UserProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
