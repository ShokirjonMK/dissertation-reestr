from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.entities import Dissertation
from app.repositories.dissertation_repository import DissertationRepository
from app.services.dissertation_service import DissertationService
from app.services.search_sync_service import index_dissertation


def sync_dissertations_to_search() -> None:
    db = SessionLocal()
    try:
        repo = DissertationRepository(db)
        dissertations = list(db.scalars(select(Dissertation).order_by(Dissertation.id)).all())
        for dissertation in dissertations:
            hydrated = repo.get(dissertation.id) or dissertation
            index_dissertation(DissertationService.to_index_payload(hydrated))
    finally:
        db.close()
