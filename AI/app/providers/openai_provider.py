import time
import json
from typing import Any, Dict, List
from .base import Provider
from app.config import settings


class OpenAIProvider(Provider):
    def __init__(self, model: str | None = None):
        from openai import OpenAI
        if not settings.openai_api_key:
            raise RuntimeError("OPENAI_API_KEY 필요")
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = model or settings.model_name

    def _extract(self, resp: Any) -> Dict[str, Any]:
        # 1) 구조화 출력 우선
        if hasattr(resp, "output_parsed") and resp.output_parsed:
            return resp.output_parsed
        # 2) 폴백: 텍스트에서 파싱
        if hasattr(resp, "output_text") and resp.output_text:
            return json.loads(resp.output_text)
        # 3) 최후 폴백(권장 X): 노드 접근
        node = resp.output[0].content[0]
        if hasattr(node, "text") and node.text:
            return json.loads(node.text)
        raise ValueError("응답 파싱 실패")

    def generate(self, messages: List[Dict[str, str]], schema: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        retries = kwargs.get("retries", 3)
        backoff = 2
        for attempt in range(retries):
            try:
                resp = self.client.responses.create(
                    model=self.model,
                    messages=messages,
                    response_format={
                        "type": "json_schema",
                        "json_schema": {"name": "structured_output", "schema": schema, "strict": True},
                    },
                    temperature=kwargs.get("temperature", settings.temperature),
                    top_p=kwargs.get("top_p", settings.top_p),
                    max_output_tokens=kwargs.get("max_output_tokens", settings.max_output_tokens),
                    timeout=kwargs.get("timeout", 45),
                )
                return self._extract(resp)
            except Exception as e:
                if attempt == retries - 1:
                    raise
                time.sleep(backoff ** attempt)
