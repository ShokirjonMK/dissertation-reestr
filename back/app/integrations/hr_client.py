import httpx

from app.core.config import settings


class HRClient:
    def check_access(self, email: str) -> bool:
        with httpx.Client(timeout=5.0) as client:
            response = client.post(f"{settings.integration_service_url}/hr/check", json={"email": email})
            response.raise_for_status()
            data = response.json()
            return bool(data.get("allowed", False))
