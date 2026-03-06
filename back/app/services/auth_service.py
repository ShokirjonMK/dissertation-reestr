from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.entities import RoleName, User
from app.repositories.user_repository import UserRepository


def authenticate_user(db: Session, username: str, password: str) -> User | None:
    repo = UserRepository(db)
    user = repo.get_by_username(username)
    if user is None or not verify_password(password, user.password_hash):
        return None
    return user


def issue_token_for_user(user: User) -> str:
    return create_access_token(subject=str(user.id))


def register_user(db: Session, *, username: str, email: str, password: str, role_name: RoleName) -> User:
    repo = UserRepository(db)
    role = repo.get_role(role_name)
    if role is None:
        raise ValueError("Role is not configured")

    return repo.create(
        username=username,
        email=email,
        password_hash=hash_password(password),
        role_id=role.id,
    )
