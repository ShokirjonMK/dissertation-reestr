from datetime import date

from sqlalchemy import String, cast, or_, select
from sqlalchemy.orm import Session, aliased, selectinload

from app.models.entities import Dissertation, DissertationDocument, ScientificDirection, University, User
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
        query = (
            select(Dissertation)
            .options(
                selectinload(Dissertation.author),
                selectinload(Dissertation.supervisor),
                selectinload(Dissertation.scientific_direction),
                selectinload(Dissertation.university),
                selectinload(Dissertation.region),
                selectinload(Dissertation.document),
            )
            .where(Dissertation.id == dissertation_id)
        )
        return self.db.scalar(query)

    def update(self, dissertation_id: int, payload: dict) -> Dissertation | None:
        obj = self.get(dissertation_id)
        if obj is None:
            return None
        for key, value in payload.items():
            setattr(obj, key, value)
        self.db.commit()
        self.db.refresh(obj)
        return self.get(obj.id)

    def delete(self, dissertation_id: int) -> bool:
        obj = self.db.get(Dissertation, dissertation_id)
        if obj is None:
            return False
        self.db.delete(obj)
        self.db.commit()
        return True

    def list_with_filters(self, filters: DissertationFilter) -> list[Dissertation]:
        author_alias = aliased(User)
        supervisor_alias = aliased(User)

        query = (
            select(Dissertation)
            .options(
                selectinload(Dissertation.author),
                selectinload(Dissertation.supervisor),
                selectinload(Dissertation.scientific_direction),
                selectinload(Dissertation.university),
                selectinload(Dissertation.region),
                selectinload(Dissertation.document),
            )
            .join(ScientificDirection, Dissertation.scientific_direction_id == ScientificDirection.id)
            .join(University, Dissertation.university_id == University.id)
            .join(author_alias, Dissertation.author_id == author_alias.id)
            .outerjoin(supervisor_alias, Dissertation.supervisor_id == supervisor_alias.id)
        )

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
        if filters.category:
            query = query.where(Dissertation.category.ilike(filters.category.strip()))
        if filters.expert_rating_min is not None:
            query = query.where(Dissertation.expert_rating >= filters.expert_rating_min)
        if filters.region_id is not None:
            query = query.where(Dissertation.region_id == filters.region_id)
        if filters.visibility:
            query = query.where(Dissertation.visibility.ilike(filters.visibility.strip()))

        def ilike(value: str | None):
            if not value:
                return None
            return f"%{value.strip()}%"

        if token := ilike(filters.title):
            query = query.where(Dissertation.title.ilike(token))
        if token := ilike(filters.problem):
            query = query.where(Dissertation.problem.ilike(token))
        if token := ilike(filters.proposal):
            query = query.where(Dissertation.proposal.ilike(token))
        if token := ilike(filters.annotation):
            query = query.where(Dissertation.annotation.ilike(token))
        if token := ilike(filters.conclusion):
            query = query.where(Dissertation.conclusion.ilike(token))
        if token := ilike(filters.author):
            query = query.where(author_alias.username.ilike(token))
        if token := ilike(filters.supervisor):
            query = query.where(supervisor_alias.username.ilike(token))

        if filters.keywords:
            keyword_tokens = [token.strip() for token in filters.keywords.split(",") if token.strip()]
            for keyword in keyword_tokens:
                query = query.where(cast(Dissertation.keywords, String).ilike(f"%{keyword}%"))

        if filters.query:
            token = ilike(filters.query)
            query = query.where(
                or_(
                    Dissertation.title.ilike(token),
                    Dissertation.problem.ilike(token),
                    Dissertation.proposal.ilike(token),
                    Dissertation.annotation.ilike(token),
                    Dissertation.conclusion.ilike(token),
                    cast(Dissertation.keywords, String).ilike(token),
                    author_alias.username.ilike(token),
                    supervisor_alias.username.ilike(token),
                    University.name.ilike(token),
                    ScientificDirection.name.ilike(token),
                )
            )

        query = query.order_by(Dissertation.id.desc())
        return list(self.db.scalars(query).all())

    def get_document(self, dissertation_id: int) -> DissertationDocument | None:
        return self.db.scalar(select(DissertationDocument).where(DissertationDocument.dissertation_id == dissertation_id))

    def upsert_document(self, dissertation_id: int, payload: dict) -> DissertationDocument:
        document = self.get_document(dissertation_id)
        if document is None:
            document = DissertationDocument(dissertation_id=dissertation_id)
            self.db.add(document)
            self.db.flush()

        for key, value in payload.items():
            setattr(document, key, value)

        self.db.commit()
        self.db.refresh(document)
        return document
