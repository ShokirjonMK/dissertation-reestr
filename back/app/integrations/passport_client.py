import httpx

from app.core.config import settings


class PassportClient:
    def verify(self, seria: str, number: str, pin: str) -> bool:
        with httpx.Client(timeout=5.0) as client:
            response = client.post(
                f"{settings.integration_service_url}/passport/verify",
                json={
                    "passport_seria": seria,
                    "passport_number": number,
                    "passport_pin": pin,
                },
            )
            response.raise_for_status()
            data = response.json()
            return bool(data.get("valid", False))
