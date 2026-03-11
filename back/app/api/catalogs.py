"""
Kataloglar API — CRUD operatsiyalar

Mavjud kataloglar:
  - Countries (Mamlakatlar) — YANGI
  - ScientificDirections (Ilmiy yo'nalishlar)
  - Universities (Universitetlar)
  - Regions (Regionlar/Viloyatlar)
  - Districts (Tumanlar)

Barcha kataloglar ko'p tilli (name_uz, name_ru, name_en) qo'llab-quvvatlaydi.

Ruxsatlar:
  - Ko'rish (list/get): barcha autentifikatsiyalangan foydalanuvchilar
  - Yaratish/tahrirlash/o'chirish: faqat ADMIN
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db_dep, require_roles
from app.models.entities import Country, District, Region, RoleName, ScientificDirection, University, User
from app.repositories.catalog_repository import CatalogRepository
from app.schemas.catalogs import (
    CountryBase,
    CountryRead,
    DistrictBase,
    DistrictRead,
    RegionBase,
    RegionRead,
    ScientificDirectionBase,
    ScientificDirectionRead,
    UniversityBase,
    UniversityRead,
)

router = APIRouter()

_ALL_ROLES = (
    RoleName.ADMIN,
    RoleName.MODERATOR,
    RoleName.EMPLOYEE,
    RoleName.DOCTORANT,
    RoleName.SUPERVISOR,
)


def _crud_routes(path: str, model: type, create_schema, read_schema):
    """
    Har bir katalog uchun standart CRUD marshrutlarini yaratadi:
      GET    {path}           — ro'yxat
      POST   {path}           — yaratish (ADMIN)
      PUT    {path}/{id}      — yangilash (ADMIN)
      DELETE {path}/{id}      — o'chirish (ADMIN)
    """

    @router.get(path, response_model=list[read_schema])
    def list_entities(
        db: Session = Depends(get_db_dep),
        _: User = Depends(require_roles(*_ALL_ROLES)),
    ):
        return CatalogRepository(db, model).list()

    @router.get(f"{path}/{{entity_id}}", response_model=read_schema)
    def get_entity(
        entity_id: int,
        db: Session = Depends(get_db_dep),
        _: User = Depends(require_roles(*_ALL_ROLES)),
    ):
        entity = CatalogRepository(db, model).get(entity_id)
        if entity is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topilmadi")
        return entity

    @router.post(path, response_model=read_schema, status_code=status.HTTP_201_CREATED)
    def create_entity(
        payload: create_schema,
        db: Session = Depends(get_db_dep),
        _: User = Depends(require_roles(RoleName.ADMIN)),
    ):
        return CatalogRepository(db, model).create(payload.model_dump())

    @router.put(f"{path}/{{entity_id}}", response_model=read_schema)
    def update_entity(
        entity_id: int,
        payload: create_schema,
        db: Session = Depends(get_db_dep),
        _: User = Depends(require_roles(RoleName.ADMIN)),
    ):
        entity = CatalogRepository(db, model).update(entity_id, payload.model_dump())
        if entity is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topilmadi")
        return entity

    @router.delete(f"{path}/{{entity_id}}", status_code=status.HTTP_200_OK)
    def delete_entity(
        entity_id: int,
        db: Session = Depends(get_db_dep),
        _: User = Depends(require_roles(RoleName.ADMIN)),
    ):
        if not CatalogRepository(db, model).delete(entity_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topilmadi")
        return {"deleted": True}


# ─── Katalog routelarini ro'yxatdan o'tkazish ─────────────────────────────────

_crud_routes("/countries", Country, CountryBase, CountryRead)
_crud_routes("/scientific-directions", ScientificDirection, ScientificDirectionBase, ScientificDirectionRead)
_crud_routes("/universities", University, UniversityBase, UniversityRead)
_crud_routes("/regions", Region, RegionBase, RegionRead)
_crud_routes("/districts", District, DistrictBase, DistrictRead)
