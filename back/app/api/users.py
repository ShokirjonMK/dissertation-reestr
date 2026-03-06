from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db_dep, require_roles
from app.core.security import hash_password
from app.integrations.hr_client import HRClient
from app.integrations.passport_client import PassportClient
from app.models.entities import Dissertation, RoleName, User, UserProfile
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserLookupRead, UserProfileRead, UserProfileUpdate, UserRead, UserUpdate
from app.services.auth_service import register_user

router = APIRouter()


def _validate_role_name(value: str) -> RoleName:
    if value not in {role.value for role in RoleName}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown role")
    return RoleName(value)


@router.get("/", response_model=list[UserRead])
def list_users(
    db: Session = Depends(get_db_dep),
    _: User = Depends(require_roles(RoleName.ADMIN)),
) -> list[UserRead]:
    return UserRepository(db).list()


@router.get("/lookup", response_model=list[UserLookupRead])
def lookup_users(
    role: RoleName | None = None,
    db: Session = Depends(get_db_dep),
    _: User = Depends(get_current_user),
) -> list[UserLookupRead]:
    users = UserRepository(db).list()
    if role is not None:
        users = [item for item in users if item.role.name == role]
    return [UserLookupRead(id=item.id, username=item.username, role_name=item.role.name.value) for item in users]


@router.post("/", response_model=UserRead)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db_dep),
    _: User = Depends(require_roles(RoleName.ADMIN)),
) -> UserRead:
    role_name = _validate_role_name(payload.role_name)
    repo = UserRepository(db)

    if repo.get_by_username(payload.username):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
    if repo.get_by_email(payload.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

    hr_allowed = HRClient().check_access(payload.email)
    if not hr_allowed and role_name in {RoleName.MODERATOR, RoleName.EMPLOYEE}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is not allowed by HR integration")

    try:
        user = register_user(
            db,
            username=payload.username,
            email=payload.email,
            password=payload.password,
            role_name=role_name,
        )
    except IntegrityError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User could not be created") from exc
    return user


@router.get("/{user_id}", response_model=UserRead)
def get_user(
    user_id: int,
    db: Session = Depends(get_db_dep),
    _: User = Depends(require_roles(RoleName.ADMIN)),
) -> UserRead:
    user = UserRepository(db).get_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db_dep),
    _: User = Depends(require_roles(RoleName.ADMIN)),
) -> UserRead:
    repo = UserRepository(db)
    user = repo.get_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    data = payload.model_dump(exclude_unset=True)

    if "username" in data:
        existing = repo.get_by_username(data["username"])
        if existing and existing.id != user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")

    if "email" in data:
        existing = repo.get_by_email(data["email"])
        if existing and existing.id != user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

    requested_role_name = user.role.name
    if "role_name" in data and data["role_name"] is not None:
        requested_role_name = _validate_role_name(data["role_name"])
        role = repo.get_role(requested_role_name)
        if role is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role is not configured")
        data["role_id"] = role.id
    data.pop("role_name", None)

    if "email" in data and requested_role_name in {RoleName.MODERATOR, RoleName.EMPLOYEE}:
        if not HRClient().check_access(data["email"]):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is not allowed by HR integration")

    if "password" in data and data["password"]:
        data["password_hash"] = hash_password(data.pop("password"))
    else:
        data.pop("password", None)

    updated = repo.update_user(user_id, data)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return updated


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(require_roles(RoleName.ADMIN)),
    db: Session = Depends(get_db_dep),
) -> dict[str, bool]:
    if current_user.id == user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admin cannot delete own account")

    linked = db.scalar(
        select(Dissertation.id)
        .where(or_(Dissertation.author_id == user_id, Dissertation.supervisor_id == user_id))
        .limit(1)
    )
    if linked is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User is linked to dissertations and cannot be deleted",
        )

    if not UserRepository(db).delete_user(user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"deleted": True}


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
