import re
import shutil
from pathlib import Path
from uuid import uuid4

from docx import Document
from fastapi import UploadFile


class DissertationDocumentService:
    def __init__(self, storage_root: Path) -> None:
        self.storage_root = storage_root
        (self.storage_root / "dissertations").mkdir(parents=True, exist_ok=True)

    def save_documents(
        self,
        dissertation_id: int,
        *,
        autoreferat_text: str | None = None,
        autoreferat_file: UploadFile | None = None,
        dissertation_pdf_file: UploadFile | None = None,
        dissertation_word_file: UploadFile | None = None,
    ) -> dict:
        updates: dict[str, str | None] = {}
        dissertation_dir = self._dissertation_dir(dissertation_id)
        dissertation_dir.mkdir(parents=True, exist_ok=True)

        if autoreferat_text is not None:
            normalized = autoreferat_text.strip()
            updates["autoreferat_text"] = normalized or None

        if autoreferat_file is not None:
            path, original_name = self._store_upload(
                dissertation_dir=dissertation_dir,
                upload=autoreferat_file,
                file_prefix="autoreferat",
                allowed_suffixes={".pdf", ".doc", ".docx", ".txt"},
            )
            updates["autoreferat_file_path"] = str(path)
            updates["autoreferat_file_name"] = original_name

        if dissertation_pdf_file is not None:
            path, original_name = self._store_upload(
                dissertation_dir=dissertation_dir,
                upload=dissertation_pdf_file,
                file_prefix="dissertation_pdf",
                allowed_suffixes={".pdf"},
            )
            updates["dissertation_pdf_file_path"] = str(path)
            updates["dissertation_pdf_file_name"] = original_name

        if dissertation_word_file is not None:
            path, original_name = self._store_upload(
                dissertation_dir=dissertation_dir,
                upload=dissertation_word_file,
                file_prefix="dissertation_word",
                allowed_suffixes={".doc", ".docx"},
            )
            updates["dissertation_word_file_path"] = str(path)
            updates["dissertation_word_file_name"] = original_name
            updates["dissertation_word_text"] = self._extract_word_text(path)

        return updates

    def cleanup_dissertation_files(self, dissertation_id: int) -> None:
        directory = self._dissertation_dir(dissertation_id)
        if directory.exists():
            shutil.rmtree(directory, ignore_errors=True)

    def resolve_file(self, raw_path: str | None) -> Path | None:
        if not raw_path:
            return None
        candidate = Path(raw_path)
        if not candidate.is_absolute():
            candidate = self.storage_root / candidate

        resolved = candidate.resolve()
        root = self.storage_root.resolve()
        if not resolved.is_relative_to(root):
            return None
        if not resolved.exists():
            return None
        return resolved

    def _dissertation_dir(self, dissertation_id: int) -> Path:
        return self.storage_root / "dissertations" / str(dissertation_id)

    def _store_upload(
        self,
        *,
        dissertation_dir: Path,
        upload: UploadFile,
        file_prefix: str,
        allowed_suffixes: set[str],
    ) -> tuple[Path, str]:
        original_name = upload.filename or ""
        suffix = Path(original_name).suffix.lower()
        if suffix not in allowed_suffixes:
            allowed = ", ".join(sorted(allowed_suffixes))
            raise ValueError(f"Invalid file type for {file_prefix}. Allowed: {allowed}")

        safe_stem = re.sub(r"[^A-Za-z0-9._-]+", "_", Path(original_name).stem) or file_prefix
        target_name = f"{file_prefix}_{safe_stem}_{uuid4().hex}{suffix}"
        target_path = dissertation_dir / target_name

        with target_path.open("wb") as target:
            shutil.copyfileobj(upload.file, target)
        upload.file.seek(0)
        return target_path, original_name

    def _extract_word_text(self, file_path: Path) -> str:
        suffix = file_path.suffix.lower()
        if suffix == ".docx":
            try:
                document = Document(file_path)
            except Exception as exc:  # noqa: BLE001
                raise ValueError("Uploaded DOCX file could not be parsed") from exc
            chunks = [paragraph.text.strip() for paragraph in document.paragraphs if paragraph.text.strip()]
            return "\n".join(chunks).strip()

        raw = file_path.read_bytes()
        return self._normalize_doc_text(raw)

    @staticmethod
    def _normalize_doc_text(raw: bytes) -> str:
        candidates = [
            raw.decode("utf-8", errors="ignore"),
            raw.decode("cp1251", errors="ignore"),
            raw.decode("latin1", errors="ignore"),
        ]

        for text in candidates:
            filtered = re.sub(r"[^\n\r\t\x20-\x7E\u0400-\u04FF]+", " ", text)
            filtered = re.sub(r"[ \t]{2,}", " ", filtered)
            filtered = re.sub(r"\n{3,}", "\n\n", filtered).strip()
            if len(filtered) >= 120:
                return filtered

        return re.sub(r"[^\n\r\t\x20-\x7E]+", " ", candidates[-1]).strip()
