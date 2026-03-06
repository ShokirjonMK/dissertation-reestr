from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.entities import Role, RoleName, User, UserProfile


class UserRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_username(self, username: str) -> User | None:
        query = select(User).options(selectinload(User.role)).where(User.username == username)
        return self.db.scalar(query)

    def get_by_email(self, email: str) -> User | None:
        query = select(User).options(selectinload(User.role)).where(User.email == email)
        return self.db.scalar(query)

    def get_by_id(self, user_id: int) -> User | None:
        query = select(User).options(selectinload(User.role)).where(User.id == user_id)
        return self.db.scalar(query)

    def list(self) -> list[User]:
        query = select(User).options(selectinload(User.role)).order_by(User.id)
        return list(self.db.scalars(query).all())

    def get_role(self, role_name: RoleName) -> Role | None:
        return self.db.scalar(select(Role).where(Role.name == role_name))

    def create(self, *, username: str, email: str, password_hash: str, role_id: int) -> User:
        user = User(username=username, email=email, password_hash=password_hash, role_id=role_id)
        self.db.add(user)
        self.db.flush()
        profile = UserProfile(user_id=user.id)
        self.db.add(profile)
        self.db.commit()
        return self.get_by_id(user.id) or user

    def upsert_profile(self, user_id: int, payload: dict) -> UserProfile:
        profile = self.db.scalar(select(UserProfile).where(UserProfile.user_id == user_id))
        if profile is None:
            profile = UserProfile(user_id=user_id)
            self.db.add(profile)
            self.db.flush()

        for key, value in payload.items():
            setattr(profile, key, value)

        self.db.commit()
        self.db.refresh(profile)
        return profile

    def update_user(self, user_id: int, payload: dict) -> User | None:
        user = self.db.get(User, user_id)
        if user is None:
            return None

        for key, value in payload.items():
            setattr(user, key, value)

        self.db.commit()
        return self.get_by_id(user_id)

    def delete_user(self, user_id: int) -> bool:
        user = self.db.get(User, user_id)
        if user is None:
            return False

        profile = self.db.scalar(select(UserProfile).where(UserProfile.user_id == user_id))
        if profile is not None:
            self.db.delete(profile)

        self.db.delete(user)
        self.db.commit()
        return True
