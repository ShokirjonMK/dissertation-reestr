from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.entities import Role, RoleName, User, UserProfile


class UserRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_username(self, username: str) -> User | None:
        return self.db.scalar(select(User).where(User.username == username))

    def get_by_id(self, user_id: int) -> User | None:
        return self.db.scalar(select(User).where(User.id == user_id))

    def get_role(self, role_name: RoleName) -> Role | None:
        return self.db.scalar(select(Role).where(Role.name == role_name))

    def create(self, *, username: str, email: str, password_hash: str, role_id: int) -> User:
        user = User(username=username, email=email, password_hash=password_hash, role_id=role_id)
        self.db.add(user)
        self.db.flush()
        profile = UserProfile(user_id=user.id)
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(user)
        return user

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
