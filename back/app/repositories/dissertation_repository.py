from datetime import date

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.entities import Dissertation
from app.schemas.dissertation import DissertationFilter


class DissertationRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, payload: dict) -> Dissertation:
        obj = Dissertation(**payload)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def get(self, dissertation_id: int) -> Dissertation | None:
        return self.db.get(Dissertation, dissertation_id)

    def update(self, dissertation_id: int, payload: dict) -> Dissertation | None:
        obj = self.get(dissertation_id)
        if obj is None:
            return None
        for key, value in payload.items():
            setattr(obj, key, value)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, dissertation_id: int) -> bool:
        obj = self.get(dissertation_id)
        if obj is None:
            return False
        self.db.delete(obj)
        self.db.commit()
        return True

    def list_with_filters(self, filters: DissertationFilter) -> list[Dissertation]:
        query = select(Dissertation)

        if filters.scientific_direction_id is not None:
            query = query.where(Dissertation.scientific_direction_id == filters.scientific_direction_id)
        if filters.university_id is not None:
            query = query.where(Dissertation.university_id == filters.university_id)
        if filters.author_id is not None:
            query = query.where(Dissertation.author_id == filters.author_id)
        if filters.supervisor_id is not None:
            query = query.where(Dissertation.supervisor_id == filters.supervisor_id)
        if filters.status is not None:
            query = query.where(Dissertation.status == filters.status)
        if filters.year is not None:
            start = date(filters.year, 1, 1)
            end = date(filters.year, 12, 31)
            query = query.where(Dissertation.defense_date.is_not(None))
            query = query.where(Dissertation.defense_date.between(start, end))
        if filters.query:
            token = f"%{filters.query.strip()}%"
            query = query.where(
                or_(
                    Dissertation.title.ilike(token),
                    Dissertation.problem.ilike(token),
                    Dissertation.proposal.ilike(token),
                    Dissertation.annotation.ilike(token),
                    Dissertation.conclusion.ilike(token),
                )
            )

        query = query.order_by(Dissertation.id.desc())
        return list(self.db.scalars(query).all())
