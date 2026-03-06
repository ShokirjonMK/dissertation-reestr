from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.entities import Role, RoleName, User, UserProfile


ROLE_DESCRIPTIONS = {
    RoleName.ADMIN: "System administrator",
    RoleName.MODERATOR: "Justice ministry expert",
    RoleName.DOCTORANT: "Doctoral researcher",
    RoleName.SUPERVISOR: "Scientific supervisor",
    RoleName.EMPLOYEE: "Justice employee",
}


def bootstrap_defaults() -> None:
    db = SessionLocal()
    try:
        for role_name, description in ROLE_DESCRIPTIONS.items():
            existing = db.scalar(select(Role).where(Role.name == role_name))
            if existing is None:
                db.add(Role(name=role_name, description=description))
        db.commit()

        admin = db.scalar(select(User).where(User.username == "admin"))
        if admin is None:
            admin_role = db.scalar(select(Role).where(Role.name == RoleName.ADMIN))
            if admin_role is None:
                return
            admin = User(
                username="admin",
                email="admin@registry.local",
                password_hash=hash_password("admin12345"),
                role_id=admin_role.id,
            )
            db.add(admin)
            db.flush()
            db.add(UserProfile(user_id=admin.id, first_name="System", last_name="Admin"))
            db.commit()
    finally:
        db.close()
