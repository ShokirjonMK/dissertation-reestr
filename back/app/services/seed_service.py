from datetime import date

from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.entities import (
    Dissertation,
    DissertationStatus,
    District,
    Region,
    Role,
    RoleName,
    ScientificDirection,
    University,
    User,
    UserProfile,
)


ROLE_DESCRIPTIONS = {
    RoleName.ADMIN: "System administrator",
    RoleName.MODERATOR: "Justice ministry expert",
    RoleName.DOCTORANT: "Doctoral researcher",
    RoleName.SUPERVISOR: "Scientific supervisor",
    RoleName.EMPLOYEE: "Justice employee",
}


def _ensure_role(db, role_name: RoleName) -> Role:
    role = db.scalar(select(Role).where(Role.name == role_name))
    if role is not None:
        return role
    role = Role(name=role_name, description=ROLE_DESCRIPTIONS[role_name])
    db.add(role)
    db.flush()
    return role


def _ensure_user(db, *, username: str, email: str, password: str, role: Role) -> User:
    user = db.scalar(select(User).where(User.username == username))
    if user is not None:
        # Keep legacy seeded accounts compatible with strict EmailStr validation.
        if user.email.endswith(".local") and user.email != email:
            user.email = email
            db.flush()
        return user
    user = User(
        username=username,
        email=email,
        password_hash=hash_password(password),
        role_id=role.id,
    )
    db.add(user)
    db.flush()
    db.add(UserProfile(user_id=user.id, first_name=username.capitalize(), last_name="User"))
    db.flush()
    return user


def _ensure_directions(db) -> list[ScientificDirection]:
    names = [
        ("Constitutional Law", "Konstitutsion huquq yo'nalishi"),
        ("Civil Law", "Fuqarolik huquqi yo'nalishi"),
        ("Criminal Law", "Jinoyat huquqi yo'nalishi"),
    ]
    result: list[ScientificDirection] = []
    for name, description in names:
        item = db.scalar(select(ScientificDirection).where(ScientificDirection.name == name))
        if item is None:
            item = ScientificDirection(name=name, description=description)
            db.add(item)
            db.flush()
        result.append(item)
    return result


def _ensure_universities(db) -> list[University]:
    names = [
        ("Tashkent State University of Law", "TSUL"),
        ("National University of Uzbekistan", "NUUz"),
    ]
    result: list[University] = []
    for name, short in names:
        item = db.scalar(select(University).where(University.name == name))
        if item is None:
            item = University(name=name, short_name=short)
            db.add(item)
            db.flush()
        result.append(item)
    return result


def _ensure_regions_and_districts(db) -> tuple[list[Region], list[District]]:
    region_names = ["Toshkent shahri", "Samarqand viloyati", "Farg'ona viloyati"]
    regions: list[Region] = []
    for region_name in region_names:
        region = db.scalar(select(Region).where(Region.name == region_name))
        if region is None:
            region = Region(name=region_name)
            db.add(region)
            db.flush()
        regions.append(region)

    districts: list[District] = []
    district_seed = [
        ("Yunusobod", regions[0].id),
        ("Samarqand tumani", regions[1].id),
        ("Marg'ilon", regions[2].id),
    ]
    for name, region_id in district_seed:
        district = db.scalar(select(District).where(District.name == name, District.region_id == region_id))
        if district is None:
            district = District(name=name, region_id=region_id)
            db.add(district)
            db.flush()
        districts.append(district)
    return regions, districts


def _ensure_sample_dissertations(
    db,
    doctorant: User,
    supervisor: User,
    directions: list[ScientificDirection],
    universities: list[University],
    regions: list[Region],
) -> None:
    existing = db.scalar(select(Dissertation.id).limit(1))
    if existing is not None:
        return

    samples = [
        {
            "title": "Sud-huquq tizimida raqamli protsesslarni joriy etish",
            "problem": "Sud hujjatlarini qayta ishlashda ortiqcha byurokratik kechikishlar mavjud.",
            "proposal": "Elektron ish yuritish platformasini kengaytirish va yagona standart joriy qilish.",
            "annotation": "Raqamli transformatsiya orqali protsesslarni tezlashtirish modeli.",
            "conclusion": "Elektron platforma bilan ish ko'rish muddati sezilarli qisqaradi.",
            "keywords": ["sud", "raqamlashtirish", "protsess"],
            "status": DissertationStatus.PENDING,
            "category": "administrative",
            "expert_rating": 72.0,
            "visibility": "internal",
            "region_id": regions[0].id,
            "defense_date": date(2026, 5, 12),
            "scientific_direction_id": directions[0].id,
            "university_id": universities[0].id,
        },
        {
            "title": "Fuqarolik nizolarini mediatsiya orqali hal etish samaradorligi",
            "problem": "Sudga murojaatlar ko'payishi natijasida ishlar cho'zilmoqda.",
            "proposal": "Majburiy pre-mediatsiya bosqichini ayrim toifalarga tatbiq etish.",
            "annotation": "Mediatsiya instituti bo'yicha amaliy takliflar.",
            "conclusion": "Nizolarni sudgacha hal etish ulushi ortishi kutiladi.",
            "keywords": ["mediatsiya", "fuqarolik", "nizo"],
            "status": DissertationStatus.APPROVED,
            "category": "civil",
            "expert_rating": 86.0,
            "visibility": "internal",
            "region_id": regions[1].id,
            "defense_date": date(2026, 7, 1),
            "scientific_direction_id": directions[1].id,
            "university_id": universities[1].id,
        },
    ]

    for sample in samples:
        db.add(
            Dissertation(
                author_id=doctorant.id,
                supervisor_id=supervisor.id,
                **sample,
            )
        )


def bootstrap_defaults() -> None:
    db = SessionLocal()
    try:
        roles = {role_name: _ensure_role(db, role_name) for role_name in ROLE_DESCRIPTIONS}
        db.flush()

        admin = _ensure_user(
            db,
            username="admin",
            email="admin@registry.uz",
            password="admin12345",
            role=roles[RoleName.ADMIN],
        )
        _ = admin
        moderator = _ensure_user(
            db,
            username="moderator",
            email="moderator@adliya.uz",
            password="moderator123",
            role=roles[RoleName.MODERATOR],
        )
        doctorant = _ensure_user(
            db,
            username="doctorant",
            email="doctorant@registry.uz",
            password="doctorant123",
            role=roles[RoleName.DOCTORANT],
        )
        supervisor = _ensure_user(
            db,
            username="supervisor",
            email="supervisor@registry.uz",
            password="supervisor123",
            role=roles[RoleName.SUPERVISOR],
        )
        _ensure_user(
            db,
            username="employee",
            email="employee@adliya.uz",
            password="employee123",
            role=roles[RoleName.EMPLOYEE],
        )

        directions = _ensure_directions(db)
        universities = _ensure_universities(db)
        regions, _ = _ensure_regions_and_districts(db)
        _ensure_sample_dissertations(db, doctorant, supervisor, directions, universities, regions)

        db.commit()
    finally:
        db.close()
