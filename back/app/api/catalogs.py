from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db_dep, require_roles
from app.models.entities import District, Region, RoleName, ScientificDirection, University, User
from app.repositories.catalog_repository import CatalogRepository
from app.schemas.catalogs import (
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


def _crud_routes(path: str, model: type, create_schema, read_schema):
    repo_factory = lambda db: CatalogRepository(db, model)

    @router.get(path, response_model=list[read_schema])
    def list_entities(
        db: Session = Depends(get_db_dep),
        _: User = Depends(require_roles(RoleName.ADMIN, RoleName.MODERATOR, RoleName.EMPLOYEE, RoleName.DOCTORANT, RoleName.SUPERVISOR)),
    ):
        return repo_factory(db).list()

    @router.post(path, response_model=read_schema)
    def create_entity(
        payload: create_schema,
        db: Session = Depends(get_db_dep),
        _: User = Depends(require_roles(RoleName.ADMIN)),
    ):
        return repo_factory(db).create(payload.model_dump())

    @router.put(f"{path}/{{entity_id}}", response_model=read_schema)
    def update_entity(
        entity_id: int,
        payload: create_schema,
        db: Session = Depends(get_db_dep),
        _: User = Depends(require_roles(RoleName.ADMIN)),
    ):
        entity = repo_factory(db).update(entity_id, payload.model_dump())
        if entity is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entity not found")
        return entity

    @router.delete(f"{path}/{{entity_id}}")
    def delete_entity(
        entity_id: int,
        db: Session = Depends(get_db_dep),
        _: User = Depends(require_roles(RoleName.ADMIN)),
    ):
        if not repo_factory(db).delete(entity_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entity not found")
        return {"deleted": True}


_crud_routes("/scientific-directions", ScientificDirection, ScientificDirectionBase, ScientificDirectionRead)
_crud_routes("/universities", University, UniversityBase, UniversityRead)
_crud_routes("/regions", Region, RegionBase, RegionRead)
_crud_routes("/districts", District, DistrictBase, DistrictRead)
