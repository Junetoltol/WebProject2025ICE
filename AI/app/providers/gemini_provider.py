# app/providers/gemini_provider.py

import json
from typing import Any, Dict, List
from .base import Provider
from app.config import settings

class GeminiProvider(Provider):
    def __init__(self, model: str | None = None):
        import google.generativeai as genai
        if not settings.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY 필요")
        genai.configure(api_key=settings.gemini_api_key)
        self.model_name = model or settings.model_name or "gemini-1.5-pro"
        self.genai = genai

    def generate(self, messages: List[Dict[str, str]], schema: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        """
        NOTE: Gemini는 표준 JSON Schema의 'additionalProperties', 'minLength' 등을 그대로 지원하지 않음.
        따라서 여기서는 response_schema를 전달하지 않고, JSON MIME만 강제한다.
        """
        system_instruction = messages[0]["content"] if messages and messages[0]["role"] == "system" else ""
        user_turns = [m["content"] for m in messages if m["role"] == "user"]

        model = self.genai.GenerativeModel(
            model_name=self.model_name,
            system_instruction=system_instruction,
        )

        res = model.generate_content(
            user_turns,
            generation_config=self.genai.types.GenerationConfig(
                temperature=kwargs.get("temperature", settings.temperature),
                # 스키마는 넘기지 않는다: response_schema=<omit>
                response_mime_type="application/json",
            ),
        )

        # 안전 파싱 (res.text 없을 때 대비)
        text = getattr(res, "text", None)
        if not text:
            # candidates → content → parts 순서로 폴백
            try:
                cand = res.candidates[0]
                parts = cand.content.parts
                text = "".join(getattr(p, "text", "") for p in parts)
            except Exception:
                raise ValueError("Gemini 응답 파싱 실패(res.text 비어있음)")

        return json.loads(text)
