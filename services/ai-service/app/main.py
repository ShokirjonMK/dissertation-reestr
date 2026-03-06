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
