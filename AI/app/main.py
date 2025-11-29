# app/main.py
# ------------------------------------------------------------
# FastAPI 기반 AI Cover Letter 생성 서비스의 메인 엔트리포인트.
# - /api/coverletter/generate : 자소서 생성
# - /api/coverletter/export   : DOCX/PDF 내보내기 (샘플)
# - /api/health               : 서버 상태 확인
# ------------------------------------------------------------

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

# 내부 모듈 임포트 (서비스 구조)
from app.schemas import CoverLetterRequest, CoverLetterResponse
from app.services.generator import generate_cover_letter, _normalize_cover_letter
from app.services.exporter import export_docx, export_pdf
from app.utils.validators import clamp_length

# ------------------------------------------------------------
# FastAPI 애플리케이션 인스턴스 생성
# title 은 Swagger 문서(/docs)에 표시됨
# ------------------------------------------------------------
app = FastAPI(title="AI Resume/CoverLetter Service")

# ------------------------------------------------------------
# CORS 설정 (Cross-Origin Resource Sharing)
# - allow_origins=["*"] : 모든 출처에서 접근 허용
# - 프론트엔드(React 등)에서 API 호출 시 필수
# ------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------
# [GET] /api/health
# - 서버 상태 확인용 엔드포인트 (헬스체크)
# ------------------------------------------------------------
@app.get("/api/health")
def health():
    return {"ok": True}

# ------------------------------------------------------------
# [POST] /api/coverletter/generate
# - 자소서 생성 메인 엔드포인트
# - 요청 바디를 CoverLetterRequest 모델로 검증
# - AI 모델을 통해 자소서 텍스트 생성
# - 결과를 문자열로 정규화 및 길이 보정 후 반환
# ------------------------------------------------------------
@app.post("/api/coverletter/generate")
async def coverletter_generate(req: CoverLetterRequest):
    try:
        result = generate_cover_letter(req.model_dump())
        raw = result.get("cover_letter", "")
        text = _normalize_cover_letter(raw)
        text = clamp_length(text, req.essay.length)

        print(">>> [AI SERVER] cover_letter:", text)

        # 🔴 중요: 자바가 기대하는 키 이름 그대로!
        return {"cover_letter": text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------------------------------------------------
# [GET] /api/coverletter/export
# - 샘플 자소서를 DOCX 또는 PDF로 내보내기
# - 실제 서비스에서는 세션/DB 저장 내용을 바탕으로 동작
# ------------------------------------------------------------
@app.get("/api/coverletter/export")
async def coverletter_export(
    fmt: str = Query("docx", pattern="^(docx|pdf)$"),  # 파일 포맷: docx 또는 pdf
    filename: str = "cover_letter",                   # 기본 파일명
):
    """
    샘플 내보내기 엔드포인트:
    - 실제 서비스에서는 세션/DB에서 자소서 내용을 가져와 문서화
    - 현재는 '샘플 내용'을 파일로 변환하는 데모용
    """
    # 샘플 텍스트 (실제에선 DB나 세션 데이터로 대체)
    sample_text = "샘플 내용입니다. 실제로는 세션 저장소에서 가져옵니다."

    # 포맷에 따라 DOCX 또는 PDF 파일 생성
    if fmt == "docx":
        path = export_docx(sample_text, f"{filename}.docx")
    else:
        path = export_pdf(sample_text, f"{filename}.pdf")

    # 생성된 파일을 FileResponse로 전송
    return FileResponse(path, filename=path.split("/")[-1])

@app.post("/api/coverletter/generate", response_model=CoverLetterResponse)
async def generate_cover_letter(req: CoverLetterRequest):
    print("=== [AI SERVER] 받은 요청 ===")
    print(req.model_dump())                    # 생성된 자소서 본문 텍스트

