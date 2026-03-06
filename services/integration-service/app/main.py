import re

from fastapi import FastAPI
from pydantic import BaseModel, EmailStr

app = FastAPI(title="Integration Service", version="1.0.0")


class PassportVerifyRequest(BaseModel):
    passport_seria: str
    passport_number: str
    passport_pin: str


class HRCheckRequest(BaseModel):
    email: EmailStr


@app.get("/health")
def health() -> dict[str, bool]:
    return {"ok": True}


@app.post("/passport/verify")
def verify_passport(payload: PassportVerifyRequest) -> dict[str, bool]:
    seria_ok = bool(re.fullmatch(r"[A-Z]{2}", payload.passport_seria.upper()))
    number_ok = bool(re.fullmatch(r"\d{7}", payload.passport_number))
    pin_ok = bool(re.fullmatch(r"\d{14}", payload.passport_pin))
    return {"valid": seria_ok and number_ok and pin_ok}


@app.post("/hr/check")
def check_hr(payload: HRCheckRequest) -> dict[str, bool]:
    allowed_domains = ("@adliya.uz", "@minjust.uz")
    allowed = payload.email.lower().endswith(allowed_domains)
    return {"allowed": allowed}
