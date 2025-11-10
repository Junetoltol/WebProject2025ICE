# app/services/generator.py
from typing import Any, Dict, List
import json
from copy import deepcopy

from app.config import settings
from app.providers.openai_provider import OpenAIProvider
from app.providers.gemini_provider import GeminiProvider


# ===== 프로바이더 선택 =====
def get_provider():
    provider_name = settings.model_provider
    model = settings.model_name
    if provider_name == "gemini":
        return GeminiProvider(model=model)
    return OpenAIProvider(model=model)


# ===== 정규화 유틸 =====
def _normalize_cover_letter(value) -> str:
    """
    LLM이 cover_letter를 문자열 대신 dict/list로 줄 때를 대비해
    항상 문자열로 변환한다.
    - dict: content > title 순으로 사용, 둘 다 있으면 title + 본문
    - list: 항목을 줄바꿈으로 연결
    - 기타: str()로 캐스팅
    """
    if isinstance(value, dict):
        title = (value.get("title") or "").strip()
        body = (value.get("content") or "").strip()
        if title and body:
            return f"{title}\n\n{body}"
        return (body or title).strip()
    if isinstance(value, list):
        return "\n\n".join(map(lambda x: str(x).strip(), value)).strip()
    return str(value).strip()


# ===== 프롬프트 빌더 =====
def build_cover_letter_messages(payload: Dict[str, Any]) -> List[Dict[str, str]]:
    essay = payload["essay"]
    data = payload["data"]

    system = (
        f"너는 HR 전문가이자 문체 디자이너다. '{essay['tone']}' 톤으로 "
        f"'{essay['question']}'에 답하는 자소서를 작성한다. 분량은 {essay['length']}자 내외. "
        "불필요한 수사는 배제하고 사실 기반으로 작성. "
        "출력 형식은 반드시 JSON 하나만: "
        "{\"cover_letter\": \"<자소서 전체 본문(문자열)>\"} "
        "그 외 키/배열/객체/설명/주석/마크다운 금지."
    )

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


# ===== 스키마 (제공자별 호환) =====
SCHEMA_OPENAI: Dict[str, Any] = {
    "type": "object",
    "properties": {"cover_letter": {"type": "string", "minLength": 50}},
    "required": ["cover_letter"],
    "additionalProperties": False,
}

# Gemini는 엄격한 JSON-Schema 키가 문제될 수 있어 최소 형태만
SCHEMA_GEMINI: Dict[str, Any] = {
    "type": "object",
    "properties": {"cover_letter": {"type": "string"}},
    "required": ["cover_letter"],
}

def schema_for_provider(provider_name: str) -> Dict[str, Any]:
    if provider_name == "gemini":
        return deepcopy(SCHEMA_GEMINI)
    return deepcopy(SCHEMA_OPENAI)


# ===== 단 하나의 호출 래퍼 =====
def generate_cover_letter(payload: Dict[str, Any]) -> Dict[str, Any]:
    provider = get_provider()
    messages = build_cover_letter_messages(payload)
    schema = schema_for_provider(settings.model_provider)
    return provider.generate(messages, schema)
