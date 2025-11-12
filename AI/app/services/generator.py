from typing import Any, Dict, List
import json
from copy import deepcopy

from app.config import settings
from app.providers.openai_provider import OpenAIProvider
from app.providers.gemini_provider import GeminiProvider

# ============================================================
# LLM 모델 호출 관리 모듈 (OpenAI / Gemini 공통 처리)
# ============================================================


def get_provider():
    """
    사용 환경에 따라 LLM 프로바이더를 자동 선택한다.
    - MODEL_PROVIDER 값이 'gemini'면 GeminiProvider 사용
    - 기본은 OpenAIProvider
    - model_name은 .env 또는 기본값("gpt-5")에서 가져옴
    """
    provider_name = settings.model_provider
    model = settings.model_name
    if provider_name == "gemini":
        return GeminiProvider(model=model)
    return OpenAIProvider(model=model)


def _normalize_cover_letter(value) -> str:
    """
    LLM 응답의 cover_letter 값이 반드시 문자열이 되도록 정규화한다.
    - 일부 모델(Gemini)은 dict나 list로 반환할 수 있으므로 방어적 처리 필요.
      예시:
      {"title": "지원 동기", "content": "본문 ..."} → "지원 동기\n\n본문 ..."
      ["문단1", "문단2"] → "문단1\n\n문단2"
    """
    if isinstance(value, dict):
        title = (value.get("title") or "").strip()
        body = (value.get("content") or "").strip()
        if title and body:
            return f"{title}\n\n{body}"
        return (body or title).strip()
    if isinstance(value, list):
        return "\n\n".join(str(x).strip() for x in value).strip()
    return str(value).strip()


def build_cover_letter_messages(payload: Dict[str, Any]) -> List[Dict[str, str]]:
    """
    자소서 생성을 위한 프롬프트 구성 함수.
    System / User 두 개의 메시지를 LLM에 전달한다.

    - system: 모델의 역할, 출력 형식, 작성 톤을 명시
    - user: 지원자 이력서(JSON) + 문항 내용 전달
    """
    essay = payload["essay"]
    data = payload["data"]

    # ====== 시스템 지시문 (모델 행동 및 출력 포맷 정의) ======
    system = (
        f"너는 HR 전문가이자 문체 디자이너다. '{essay['tone']}' 톤으로 "
        f"'{essay['question']}'에 답하는 자소서를 작성한다. 분량은 {essay['length']}자 내외. "
        "불필요한 수사는 배제하고 사실 기반으로 작성. "
        "출력 형식은 반드시 JSON 하나만: "
        "{\"cover_letter\": \"<자소서 전체 본문(문자열)>\"} "
        "그 외 키/배열/객체/설명/주석/마크다운 금지."
    )

    # ====== 사용자 입력 (지원자 정보 + 문항 데이터) ======
    user = (
        "[지원자 프로필]\n" + json.dumps(data.get("profile", {}), ensure_ascii=False, indent=2)
        + "\n\n[경력]\n" + json.dumps(data.get("experience", []), ensure_ascii=False, indent=2)
        + "\n\n[프로젝트]\n" + json.dumps(data.get("projects", []), ensure_ascii=False, indent=2)
        + "\n\n[기술/자격]\n" + json.dumps({
            "skills": data.get("skills", []),
            "certifications": data.get("certifications", []),
            "languages": data.get("languages", [])
        }, ensure_ascii=False, indent=2)
        + "\n\n[문항]\n" + str(essay["question"])
    )

    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]


# ============================================================
# 모델별 JSON Schema 정의
# ============================================================

SCHEMA_OPENAI: Dict[str, Any] = {
    "type": "object",
    "properties": {"cover_letter": {"type": "string", "minLength": 50}},
    "required": ["cover_letter"],
    "additionalProperties": False,
}

# Gemini는 일부 스키마 키(minLength, additionalProperties 등)를 인식하지 못함
SCHEMA_GEMINI: Dict[str, Any] = {
    "type": "object",
    "properties": {"cover_letter": {"type": "string"}},
    "required": ["cover_letter"],
}

def schema_for_provider(provider_name: str) -> Dict[str, Any]:
    """
    LLM 제공자에 따라 호환 가능한 스키마를 반환.
    - OpenAI: 완전한 JSON Schema 검증
    - Gemini: 최소 구조만 유지
    """
    if provider_name == "gemini":
        return deepcopy(SCHEMA_GEMINI)
    return deepcopy(SCHEMA_OPENAI)


def generate_cover_letter(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    자소서 생성 핵심 함수 (서비스 계층의 메인 엔트리포인트)

    실행 순서:
    1. 현재 환경에 맞는 LLM Provider 선택
    2. System/User 프롬프트 생성
    3. Provider에 맞는 스키마 선택
    4. LLM 호출 (Structured Output 요청)
    5. 결과 반환
    """
    provider = get_provider()
    messages = build_cover_letter_messages(payload)
    schema = schema_for_provider(settings.model_provider)
    return provider.generate(messages, schema)
