# app/schemas.py
# ------------------------------------------------------------
# 🔥 422 피하려고 "아주 느슨한" 버전
#    - data: dict 아무거나
#    - essay: question/tone/length만 검사
# ------------------------------------------------------------
from typing import Optional, Dict, Any
from pydantic import BaseModel


# ===================== 자소서 설정 ======================

class EssayConfig(BaseModel):
    """
    자소서 문항 설정
    - question: 자유 문자열 (없어도 됨)
    - tone: 아무 문자열
    - length: 숫자
    """
    question: Optional[str] = None
    tone: str = "진솔한"
    length: int = 1000


# ===================== 요청 모델 ======================

class CoverLetterRequest(BaseModel):
    """
    자소서 생성 요청
    - data: 이력서 전체 데이터 (지금은 그냥 dict로 받음)
    - essay: 위 EssayConfig
    """
    data: Optional[Dict[str, Any]] = None   # ← 뭐가 와도 통과
    essay: EssayConfig                      # ← 이건 필수 (tone/length 때문에)


# ===================== 응답 모델 ======================

class CoverLetterResponse(BaseModel):
    """자소서 생성 결과"""
    cover_letter: str
