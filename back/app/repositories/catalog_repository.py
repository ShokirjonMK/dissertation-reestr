from sqlalchemy import select
from sqlalchemy.orm import Session


class CatalogRepository:
    def __init__(self, db: Session, model: type) -> None:
        self.db = db
        self.model = model

    def list(self) -> list:
        return list(self.db.scalars(select(self.model).order_by(self.model.id.desc())).all())

    def get(self, entity_id: int):
        return self.db.get(self.model, entity_id)

    def create(self, payload: dict):
        entity = self.model(**payload)
        self.db.add(entity)
        self.db.commit()
        self.db.refresh(entity)
        return entity

    def update(self, entity_id: int, payload: dict):
        entity = self.get(entity_id)
        if entity is None:
            return None
        for key, value in payload.items():
            setattr(entity, key, value)
        self.db.commit()
        self.db.refresh(entity)
        return entity

    def delete(self, entity_id: int) -> bool:
        entity = self.get(entity_id)
        if entity is None:
            return False
        self.db.delete(entity)
        self.db.commit()
        return True
