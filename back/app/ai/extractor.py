from __future__ import annotations

import json
import logging
import re
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


def extract_text_from_file(content: bytes, filename: str) -> str:
    name = filename.lower()
    if name.endswith(".pdf"):
        try:
            import io

            import pdfplumber

            with pdfplumber.open(io.BytesIO(content)) as pdf:
                return "\n".join(page.extract_text() or "" for page in pdf.pages[:50])
        except Exception as exc:  # noqa: BLE001
            logger.warning("PDF extract failed: %s", exc)
            return ""
    if name.endswith((".docx", ".doc")):
        try:
            import io

            import docx

            document = docx.Document(io.BytesIO(content))
            return "\n".join(p.text for p in document.paragraphs)
        except Exception as exc:  # noqa: BLE001
            logger.warning("DOCX extract failed: %s", exc)
            return ""
    return ""


def extract_problems_proposals_from_file(content: bytes, filename: str) -> dict[str, Any]:
    text = extract_text_from_file(content, filename)
    if not text.strip():
        return {"problems": [], "proposals": [], "error": "Fayldan matn ajratib bo'lmadi"}

    text_chunk = text[:8000]
    prompt = f"""Quyidagi dissertatsiya matnidan FAQAT muammolar va takliflarni ajratib ber.

Matn:
{text_chunk}

Natijani FAQAT JSON formatida qaytargin (boshqa hech narsa yozma):
{{
  "problems": [
    {{"order": 1, "text": "muammo matni...", "page": "sahifa (agar ma'lum bo'lsa)"}},
    ...
  ],
  "proposals": [
    {{"order": 1, "text": "taklif matni...", "page": "sahifa (agar ma'lum bo'lsa)"}},
    ...
  ]
}}

Agar muammo yoki taklif topilmasa, bo'sh array qaytargin."""

    try:
        with httpx.Client(timeout=60.0) as client:
            resp = client.post(f"{settings.ai_service_url}/extract", json={"prompt": prompt})
            resp.raise_for_status()
            result = resp.json()
            raw = result.get("text", "")
        clean = re.sub(r"```json|```", "", str(raw)).strip()
        data = json.loads(clean)
        return {
            "problems": [
                {
                    "order": p.get("order", i + 1),
                    "problem_text": p.get("text", ""),
                    "source_page": p.get("page"),
                }
                for i, p in enumerate(data.get("problems", []))
            ],
            "proposals": [
                {
                    "order": p.get("order", i + 1),
                    "proposal_text": p.get("text", ""),
                    "source_page": p.get("page"),
                }
                for i, p in enumerate(data.get("proposals", []))
            ],
        }
    except Exception as exc:  # noqa: BLE001
        logger.warning("AI extract failed: %s", exc)
        return {"problems": [], "proposals": [], "error": f"Ajratib bo'lmadi: {exc!s}"}
