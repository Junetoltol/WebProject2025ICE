# app/main.py
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from app.schemas import CoverLetterRequest, CoverLetterResponse
from app.services.generator import generate_cover_letter, _normalize_cover_letter
from app.services.exporter import export_docx, export_pdf
from app.utils.validators import clamp_length

app = FastAPI(title="AI Resume/CoverLetter Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {"ok": True}

@app.post("/api/coverletter/generate", response_model=CoverLetterResponse)
async def coverletter_generate(req: CoverLetterRequest):
    """
    자소서 생성 엔드포인트:
    - 요청 바디(CoverLetterRequest)를 검증
    - 생성 로직 호출
    - 결과 정규화(항상 문자열) + 분량 보정 후 반환
    """
    try:
        result = generate_cover_letter(req.model_dump())
        raw = result.get("cover_letter", "")
        text = _normalize_cover_letter(raw)
        text = clamp_length(text, req.essay.length)
        return CoverLetterResponse(cover_letter=text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/coverletter/export")
async def coverletter_export(
    fmt: str = Query("docx", pattern="^(docx|pdf)$"),
    filename: str = "cover_letter",
):
    """
    샘플 내보내기 엔드포인트:
    - 실제 서비스에선 세션/DB에서 내용 조회 후 DOCX/PDF로 내보내기를 수행
    """
    sample_text = "샘플 내용입니다. 실제로는 세션 저장소에서 가져옵니다."
    if fmt == "docx":
        path = export_docx(sample_text, f"{filename}.docx")
    else:
        path = export_pdf(sample_text, f"{filename}.pdf")
    return FileResponse(path, filename=path.split("/")[-1])
