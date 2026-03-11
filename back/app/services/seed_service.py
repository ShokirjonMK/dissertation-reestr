"""
Seed servisi — tizim ishga tushganda standart ma'lumotlarni yaratadi.

Yaratiladi:
  - Rollar (5 ta)
  - Foydalanuvchilar (test uchun)
  - Mamlakatlar (O'zbekiston standart)
  - Ilmiy yo'nalishlar (ko'p tilli)
  - Universitetlar (ko'p tilli, TDYU standart)
  - Regionlar + Tumanlar
  - Namunaviy dissertatsiyalar
"""
from datetime import date

from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.entities import (
    Country,
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
    RoleName.ADMIN: "Tizim administratori",
    RoleName.MODERATOR: "Adliya vazirligi ekspеrti",
    RoleName.DOCTORANT: "Doktorant-tadqiqotchi",
    RoleName.SUPERVISOR: "Ilmiy rahbar",
    RoleName.EMPLOYEE: "Adliya xodimi",
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
    db.add(UserProfile(user_id=user.id, first_name=username.capitalize(), last_name="Foydalanuvchi"))
    db.flush()
    return user


def _ensure_countries(db) -> dict[str, Country]:
    """Mamlakatlarni yaratish — O'zbekiston standart"""
    countries_data = [
        {"code": "UZ", "name_uz": "O'zbekiston", "name_ru": "Узбекистан", "name_en": "Uzbekistan"},
        {"code": "RU", "name_uz": "Rossiya", "name_ru": "Россия", "name_en": "Russia"},
        {"code": "KZ", "name_uz": "Qozog'iston", "name_ru": "Казахстан", "name_en": "Kazakhstan"},
        {"code": "KG", "name_uz": "Qirg'iziston", "name_ru": "Кыргызстан", "name_en": "Kyrgyzstan"},
        {"code": "TJ", "name_uz": "Tojikiston", "name_ru": "Таджикистан", "name_en": "Tajikistan"},
        {"code": "TM", "name_uz": "Turkmaniston", "name_ru": "Туркменистан", "name_en": "Turkmenistan"},
        {"code": "US", "name_uz": "AQSh", "name_ru": "США", "name_en": "United States"},
        {"code": "DE", "name_uz": "Germaniya", "name_ru": "Германия", "name_en": "Germany"},
        {"code": "FR", "name_uz": "Fransiya", "name_ru": "Франция", "name_en": "France"},
        {"code": "CN", "name_uz": "Xitoy", "name_ru": "Китай", "name_en": "China"},
    ]
    result: dict[str, Country] = {}
    for data in countries_data:
        country = db.scalar(select(Country).where(Country.code == data["code"]))
        if country is None:
            country = Country(**data)
            db.add(country)
            db.flush()
        result[data["code"]] = country
    return result


def _ensure_directions(db) -> list[ScientificDirection]:
    """Ilmiy yo'nalishlarni yaratish — ko'p tilli"""
    directions_data = [
        {
            "name_uz": "Konstitutsion huquq",
            "name_ru": "Конституционное право",
            "name_en": "Constitutional Law",
            "code": "KH-01",
            "description": "Konstitutsion huquq va davlat tuzilishi yo'nalishi",
        },
        {
            "name_uz": "Fuqarolik huquqi",
            "name_ru": "Гражданское право",
            "name_en": "Civil Law",
            "code": "FH-02",
            "description": "Fuqarolik-huquqiy munosabatlar yo'nalishi",
        },
        {
            "name_uz": "Jinoyat huquqi",
            "name_ru": "Уголовное право",
            "name_en": "Criminal Law",
            "code": "JH-03",
            "description": "Jinoyat va jinoyat protsessual huquqi",
        },
        {
            "name_uz": "Ma'muriy huquq",
            "name_ru": "Административное право",
            "name_en": "Administrative Law",
            "code": "MH-04",
            "description": "Davlat boshqaruvi va ma'muriy-huquqiy munosabatlar",
        },
        {
            "name_uz": "Xalqaro huquq",
            "name_ru": "Международное право",
            "name_en": "International Law",
            "code": "XH-05",
            "description": "Xalqaro shartnomalar va diplomatiya huquqi",
        },
        {
            "name_uz": "Mehnat huquqi",
            "name_ru": "Трудовое право",
            "name_en": "Labor Law",
            "code": "MeH-06",
            "description": "Mehnat munosabatlari va ijtimoiy himoya",
        },
        {
            "name_uz": "Tijorat huquqi",
            "name_ru": "Коммерческое право",
            "name_en": "Commercial Law",
            "code": "TH-07",
            "description": "Tijorat va tadbirkorlik faoliyati huquqi",
        },
    ]
    result: list[ScientificDirection] = []
    for data in directions_data:
        item = db.scalar(select(ScientificDirection).where(ScientificDirection.name_uz == data["name_uz"]))
        if item is None:
            item = ScientificDirection(**data)
            db.add(item)
            db.flush()
        result.append(item)
    return result


def _ensure_universities(db, countries: dict[str, Country]) -> list[University]:
    """Universitetlarni yaratish — ko'p tilli, TDYU standart"""
    uz_country = countries.get("UZ")
    universities_data = [
        {
            "name_uz": "Toshkent Davlat Yuridik Universiteti",
            "name_ru": "Ташкентский государственный юридический университет",
            "name_en": "Tashkent State University of Law",
            "short_name": "TDYU",
            "country_id": uz_country.id if uz_country else None,
        },
        {
            "name_uz": "O'zbekiston Milliy Universiteti",
            "name_ru": "Национальный университет Узбекистана",
            "name_en": "National University of Uzbekistan",
            "short_name": "OMU",
            "country_id": uz_country.id if uz_country else None,
        },
        {
            "name_uz": "O'zbekiston Respublikasi IIV Akademiyasi",
            "name_ru": "Академия МВД Республики Узбекистан",
            "name_en": "Academy of the MIA of Uzbekistan",
            "short_name": "IIV Akademiya",
            "country_id": uz_country.id if uz_country else None,
        },
        {
            "name_uz": "Samarqand Davlat Universiteti",
            "name_ru": "Самаркандский государственный университет",
            "name_en": "Samarkand State University",
            "short_name": "SamDU",
            "country_id": uz_country.id if uz_country else None,
        },
    ]
    result: list[University] = []
    for data in universities_data:
        item = db.scalar(select(University).where(University.name_uz == data["name_uz"]))
        if item is None:
            item = University(**data)
            db.add(item)
            db.flush()
        result.append(item)
    return result


def _ensure_regions_and_districts(db, countries: dict[str, Country]) -> tuple[list[Region], list[District]]:
    """Regionlar va tumanlarni yaratish — ko'p tilli"""
    uz_country = countries.get("UZ")
    uz_id = uz_country.id if uz_country else None

    regions_data = [
        {"name_uz": "Toshkent shahri", "name_ru": "город Ташкент", "name_en": "Tashkent city", "country_id": uz_id},
        {"name_uz": "Toshkent viloyati", "name_ru": "Ташкентская область", "name_en": "Tashkent region", "country_id": uz_id},
        {"name_uz": "Samarqand viloyati", "name_ru": "Самаркандская область", "name_en": "Samarkand region", "country_id": uz_id},
        {"name_uz": "Farg'ona viloyati", "name_ru": "Ферганская область", "name_en": "Fergana region", "country_id": uz_id},
        {"name_uz": "Andijon viloyati", "name_ru": "Андижанская область", "name_en": "Andijan region", "country_id": uz_id},
        {"name_uz": "Namangan viloyati", "name_ru": "Наманганская область", "name_en": "Namangan region", "country_id": uz_id},
        {"name_uz": "Buxoro viloyati", "name_ru": "Бухарская область", "name_en": "Bukhara region", "country_id": uz_id},
        {"name_uz": "Qashqadaryo viloyati", "name_ru": "Кашкадарьинская область", "name_en": "Kashkadarya region", "country_id": uz_id},
        {"name_uz": "Surxondaryo viloyati", "name_ru": "Сурхандарьинская область", "name_en": "Surkhandarya region", "country_id": uz_id},
        {"name_uz": "Xorazm viloyati", "name_ru": "Хорезмская область", "name_en": "Khorezm region", "country_id": uz_id},
        {"name_uz": "Navoiy viloyati", "name_ru": "Навоийская область", "name_en": "Navoi region", "country_id": uz_id},
        {"name_uz": "Jizzax viloyati", "name_ru": "Джизакская область", "name_en": "Jizzakh region", "country_id": uz_id},
        {"name_uz": "Sirdaryo viloyati", "name_ru": "Сырдарьинская область", "name_en": "Sirdarya region", "country_id": uz_id},
        {
            "name_uz": "Qoraqalpog'iston Respublikasi",
            "name_ru": "Республика Каракалпакстан",
            "name_en": "Republic of Karakalpakstan",
            "country_id": uz_id,
        },
    ]
    regions: list[Region] = []
    for data in regions_data:
        region = db.scalar(select(Region).where(Region.name_uz == data["name_uz"]))
        if region is None:
            region = Region(**data)
            db.add(region)
            db.flush()
        regions.append(region)

    districts_data = [
        {"name_uz": "Yunusobod tumani", "name_ru": "Юнусабадский район", "name_en": "Yunusabad district", "region_id": regions[0].id},
        {"name_uz": "Chilonzor tumani", "name_ru": "Чиланзарский район", "name_en": "Chilanzar district", "region_id": regions[0].id},
        {"name_uz": "Mirzo Ulug'bek tumani", "name_ru": "Мирзо-Улугбекский район", "name_en": "Mirzo-Ulugbek district", "region_id": regions[0].id},
        {"name_uz": "Samarqand tumani", "name_ru": "Самаркандский район", "name_en": "Samarkand district", "region_id": regions[2].id},
        {"name_uz": "Marg'ilon tumani", "name_ru": "Маргиланский район", "name_en": "Margilan district", "region_id": regions[3].id},
    ]
    districts: list[District] = []
    for data in districts_data:
        district = db.scalar(
            select(District).where(District.name_uz == data["name_uz"], District.region_id == data["region_id"])
        )
        if district is None:
            district = District(**data)
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
    countries: dict[str, Country],
) -> None:
    existing = db.scalar(select(Dissertation.id).limit(1))
    if existing is not None:
        return

    uz_id = countries["UZ"].id if "UZ" in countries else None

    samples = [
        {
            "title": "Sud-huquq tizimida raqamli protsesslarni joriy etish",
            "problem": "Sud hujjatlarini qayta ishlashda ortiqcha byurokratik kechikishlar mavjud.",
            "proposal": "Elektron ish yuritish platformasini kengaytirish va yagona standart joriy qilish.",
            "annotation": "Raqamli transformatsiya orqali protsesslarni tezlashtirish modeli.",
            "conclusion": "Elektron platforma bilan ish ko'rish muddati sezilarli qisqaradi.",
            "keywords": ["sud", "raqamlashtirish", "protsess", "elektron ish yuritish"],
            "status": DissertationStatus.PENDING,
            "category": "administrative",
            "expert_rating": 72.0,
            "visibility": "internal",
            "region_id": regions[0].id,
            "country_id": uz_id,
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
            "keywords": ["mediatsiya", "fuqarolik", "nizo", "alternativ"],
            "status": DissertationStatus.APPROVED,
            "category": "civil",
            "expert_rating": 86.0,
            "visibility": "internal",
            "region_id": regions[2].id,
            "country_id": uz_id,
            "defense_date": date(2026, 7, 1),
            "scientific_direction_id": directions[1].id,
            "university_id": universities[1].id,
        },
        {
            "title": "Raqamli meros huquqi: muammo va yechimlar",
            "problem": "Raqamli aktivlar (kripto, NFT, online akkauntlar) vorislik huquqida tartibga solinmagan.",
            "proposal": "Fuqarolik kodeksiga raqamli meros bo'yicha alohida bo'lim qo'shish.",
            "annotation": "Raqamli aktivlarning huquqiy tabiati va vorislik mexanizmlari tahlili.",
            "conclusion": "Qonunchilikka raqamli meros institutini joriy etish zarur.",
            "keywords": ["raqamli meros", "blockchain", "kripto", "fuqarolik kodeksi"],
            "status": DissertationStatus.DRAFT,
            "category": "civil",
            "expert_rating": 0.0,
            "visibility": "internal",
            "region_id": regions[0].id,
            "country_id": uz_id,
            "defense_date": None,
            "scientific_direction_id": directions[1].id,
            "university_id": universities[0].id,
        },
    ]

    for sample in samples:
        db.add(Dissertation(author_id=doctorant.id, supervisor_id=supervisor.id, **sample))


def bootstrap_defaults() -> None:
    """
    Tizim ishga tushganda bir martalik seed ma'lumotlarini yaratadi.
    Idempotent — bir necha marta chaqirilsa ham xavfsiz.
    """
    db = SessionLocal()
    try:
        roles = {role_name: _ensure_role(db, role_name) for role_name in ROLE_DESCRIPTIONS}
        db.flush()

        admin = _ensure_user(db, username="admin", email="admin@registry.uz", password="admin12345", role=roles[RoleName.ADMIN])
        _ = admin
        moderator = _ensure_user(db, username="moderator", email="moderator@adliya.uz", password="moderator123", role=roles[RoleName.MODERATOR])
        doctorant = _ensure_user(db, username="doctorant", email="doctorant@registry.uz", password="doctorant123", role=roles[RoleName.DOCTORANT])
        supervisor = _ensure_user(db, username="supervisor", email="supervisor@registry.uz", password="supervisor123", role=roles[RoleName.SUPERVISOR])
        _ensure_user(db, username="employee", email="employee@adliya.uz", password="employee123", role=roles[RoleName.EMPLOYEE])
        _ = moderator

        countries = _ensure_countries(db)
        directions = _ensure_directions(db)
        universities = _ensure_universities(db, countries)
        regions, _ = _ensure_regions_and_districts(db, countries)
        _ensure_sample_dissertations(db, doctorant, supervisor, directions, universities, regions, countries)

        db.commit()
    finally:
        db.close()
