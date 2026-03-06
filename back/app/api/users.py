from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db_dep, require_roles
from app.integrations.hr_client import HRClient
from app.integrations.passport_client import PassportClient
from app.models.entities import RoleName, User, UserProfile
from app.schemas.user import UserCreate, UserProfileRead, UserProfileUpdate, UserRead
from app.services.auth_service import register_user

router = APIRouter()


@router.post("/", response_model=UserRead)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db_dep),
    _: User = Depends(require_roles(RoleName.ADMIN)),
) -> UserRead:
    if payload.role_name not in {role.value for role in RoleName}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown role")

    hr_allowed = HRClient().check_access(payload.email)
    if not hr_allowed and payload.role_name in {RoleName.MODERATOR.value, RoleName.EMPLOYEE.value}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is not allowed by HR integration")

    user = register_user(
        db,
        username=payload.username,
        email=payload.email,
        password=payload.password,
        role_name=RoleName(payload.role_name),
    )
    return user


@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)) -> UserRead:
    return current_user


@router.get("/me/profile", response_model=UserProfileRead)
def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db_dep)) -> UserProfileRead:
    profile = db.scalar(select(UserProfile).where(UserProfile.user_id == current_user.id))
    if profile is None:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.put("/me/profile", response_model=UserProfileRead)
def update_my_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_dep),
) -> UserProfileRead:
    data = payload.model_dump(exclude_unset=True)

    seria = data.get("passport_seria")
    number = data.get("passport_number")
    pin = data.get("passport_pin")
    if seria and number and pin:
        if not PassportClient().verify(seria, number, pin):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Passport verification failed")

    profile = db.scalar(select(UserProfile).where(UserProfile.user_id == current_user.id))
    if profile is None:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        db.flush()

    for key, value in data.items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return profile
