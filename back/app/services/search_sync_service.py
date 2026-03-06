import logging

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


def index_dissertation(payload: dict) -> None:
    try:
        with httpx.Client(timeout=5.0) as client:
            client.post(f"{settings.search_service_url}/index/dissertation", json=payload)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Failed to index dissertation: %s", exc)


def query_search(payload: dict) -> dict:
    with httpx.Client(timeout=10.0) as client:
        response = client.post(f"{settings.search_service_url}/search", json=payload)
        response.raise_for_status()
        return response.json()


def ask_ai(payload: dict) -> dict:
    with httpx.Client(timeout=20.0) as client:
        response = client.post(f"{settings.ai_service_url}/ask", json=payload)
        response.raise_for_status()
        return response.json()
