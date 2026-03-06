from pathlib import Path

from fastapi import UploadFile

from app.core.config import settings
from app.models.entities import Dissertation
from app.repositories.dissertation_repository import DissertationRepository
from app.schemas.dissertation import DissertationFilter
from app.services.dissertation_document_service import DissertationDocumentService
from app.services.search_sync_service import index_dissertation


class DissertationService:
    def __init__(self, repo: DissertationRepository) -> None:
        self.repo = repo
        self.document_service = DissertationDocumentService(Path(settings.file_storage_path))

    def create(self, payload: dict) -> Dissertation:
        dissertation = self.repo.create(payload)
        dissertation = self.repo.get(dissertation.id) or dissertation
        index_dissertation(self.to_index_payload(dissertation))
        return dissertation

    def create_with_documents(
        self,
        payload: dict,
        *,
        autoreferat_text: str | None = None,
        autoreferat_file: UploadFile | None = None,
        dissertation_pdf_file: UploadFile | None = None,
        dissertation_word_file: UploadFile | None = None,
    ) -> Dissertation:
        dissertation = self.repo.create(payload)
        try:
            updates = self.document_service.save_documents(
                dissertation.id,
                autoreferat_text=autoreferat_text,
                autoreferat_file=autoreferat_file,
                dissertation_pdf_file=dissertation_pdf_file,
                dissertation_word_file=dissertation_word_file,
            )
            if updates:
                self.repo.upsert_document(dissertation.id, updates)
        except Exception:
            self.document_service.cleanup_dissertation_files(dissertation.id)
            self.repo.delete(dissertation.id)
            raise

        hydrated = self.repo.get(dissertation.id) or dissertation
        index_dissertation(self.to_index_payload(hydrated))
        return hydrated

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
            "autoreferat_text": dissertation.autoreferat_text,
            "dissertation_word_text": dissertation.dissertation_word_text,
            "status": dissertation.status.value,
            "scientific_direction_id": dissertation.scientific_direction_id,
            "scientific_direction_name": dissertation.scientific_direction_name,
            "university_id": dissertation.university_id,
            "university_name": dissertation.university_name,
            "author_id": dissertation.author_id,
            "author_name": dissertation.author_name,
            "supervisor_id": dissertation.supervisor_id,
            "supervisor_name": dissertation.supervisor_name,
            "defense_date": dissertation.defense_date.isoformat() if dissertation.defense_date else None,
            "category": dissertation.category,
            "expert_rating": dissertation.expert_rating,
            "region_id": dissertation.region_id,
            "visibility": dissertation.visibility,
        }
