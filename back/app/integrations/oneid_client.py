from dataclasses import dataclass


@dataclass
class OneIDUser:
    username: str
    email: str


class OneIDClient:
    # Placeholder adapter: replace with real OneID OAuth/OpenID calls.
    def exchange_code(self, code: str) -> OneIDUser:
        normalized = code.strip().lower().replace(" ", "-")
        return OneIDUser(username=f"oneid-{normalized}", email=f"{normalized}@oneid.local")
