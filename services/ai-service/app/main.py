import json

import httpx
from fastapi import FastAPI
from pydantic import BaseModel, Field

from app.config import settings

app = FastAPI(title="AI Service", version="1.0.0")


class AskRequest(BaseModel):
    question: str = Field(min_length=5)
    top_k: int = Field(default=5, ge=1, le=20)


class AskResponse(BaseModel):
    answer: str
    references: list[dict]


class ExtractRequest(BaseModel):
    prompt: str = Field(..., min_length=10)


class ExtractResponse(BaseModel):
    text: str


def synthesize_answer(question: str, references: list[dict]) -> str:
    if not references:
        return "Savol bo'yicha tegishli dissertatsiya topilmadi. So'rovni kengroq yozib qayta urinib ko'ring."

    lines = [
        f"Savol: {question}",
        "Topilgan dissertatsiyalar asosida qisqa javob:",
    ]
    for idx, ref in enumerate(references[:3], start=1):
        src = ref.get("source", {})
        title = src.get("title", "Nomsiz ish")
        conclusion = src.get("conclusion", "Xulosa mavjud emas")
        lines.append(f"{idx}. {title}: {conclusion[:180]}")

    lines.append("Tavsiya: mos ishlarni to'liq ko'rib chiqib, statusi 'approved' bo'lganlarini ustuvor ko'ring.")
    return "\n".join(lines)


@app.get("/health")
def health() -> dict[str, bool]:
    return {"ok": True}


@app.post("/extract", response_model=ExtractResponse)
def extract(payload: ExtractRequest) -> ExtractResponse:
    """LLM ulanmaguncha: muammo/takliflar uchun minimal stub JSON."""
    lowered = payload.prompt.lower()
    problems: list[dict] = []
    proposals: list[dict] = []
    if "muammo" in lowered or "problem" in lowered:
        problems.append({"order": 1, "text": "Stub: matndan aniq ajratish uchun LLM sozlang.", "page": ""})
    if "taklif" in lowered or "proposal" in lowered:
        proposals.append({"order": 1, "text": "Stub: takliflar uchun LLM sozlang.", "page": ""})
    if not problems and not proposals:
        problems.append({"order": 1, "text": "Stub javob: haqiqiy model ulanmagan.", "page": ""})
    payload_out = {"problems": problems, "proposals": proposals}
    return ExtractResponse(text=json.dumps(payload_out, ensure_ascii=False))


@app.post("/ask", response_model=AskResponse)
def ask(payload: AskRequest) -> AskResponse:
    with httpx.Client(timeout=10.0) as client:
        response = client.post(
            f"{settings.search_service_url}/search",
            json={"query": payload.question, "size": payload.top_k},
        )
        response.raise_for_status()
        data = response.json()

    references = data.get("hits", [])
    answer = synthesize_answer(payload.question, references)
    return AskResponse(answer=answer, references=references)
