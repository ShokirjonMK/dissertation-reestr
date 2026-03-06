from app.models.entities import Dissertation
from app.repositories.dissertation_repository import DissertationRepository
from app.schemas.dissertation import DissertationFilter
from app.services.search_sync_service import index_dissertation


class DissertationService:
    def __init__(self, repo: DissertationRepository) -> None:
        self.repo = repo

    def create(self, payload: dict) -> Dissertation:
        dissertation = self.repo.create(payload)
        index_dissertation(self.to_index_payload(dissertation))
        return dissertation

    def update(self, dissertation_id: int, payload: dict) -> Dissertation | None:
        dissertation = self.repo.update(dissertation_id, payload)
        if dissertation is not None:
            index_dissertation(self.to_index_payload(dissertation))
        return dissertation

    def list(self, filters: DissertationFilter) -> list[Dissertation]:
        return self.repo.list_with_filters(filters)

    @staticmethod
    def to_index_payload(dissertation: Dissertation) -> dict:
        return {
            "id": dissertation.id,
            "title": dissertation.title,
            "problem": dissertation.problem,
            "proposal": dissertation.proposal,
            "annotation": dissertation.annotation,
            "conclusion": dissertation.conclusion,
            "keywords": dissertation.keywords,
            "status": dissertation.status.value,
            "scientific_direction_id": dissertation.scientific_direction_id,
            "university_id": dissertation.university_id,
            "author_id": dissertation.author_id,
            "supervisor_id": dissertation.supervisor_id,
            "defense_date": dissertation.defense_date.isoformat() if dissertation.defense_date else None,
        }
