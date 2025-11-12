from typing import Any, Dict, List, Protocol


# ============================================================
# Provider Protocol (공통 AI 모델 프로바이더 인터페이스)
# ------------------------------------------------------------
# - OpenAIProvider, GeminiProvider 등의 공통 인터페이스 정의
# - 각 모델별 구현체는 이 프로토콜을 준수해야 함
# - FastAPI 서비스의 generator.py에서 provider를 교체해도
#   동일한 방식으로 호출할 수 있도록 일관성 보장
# ============================================================
class Provider(Protocol):
    def generate(
        self,
        messages: List[Dict[str, str]],
        schema: Dict[str, Any],
        **kwargs
    ) -> Dict[str, Any]:
        """
        모든 AI 모델 프로바이더가 구현해야 하는 필수 메서드.

        매개변수:
            messages (List[Dict[str, str]]):
                LLM에 전달할 대화 메시지 (system, user 역할 포함)
                예시:
                    [
                        {"role": "system", "content": "..."},
                        {"role": "user", "content": "..."}
                    ]

            schema (Dict[str, Any]):
                모델이 생성할 응답의 JSON 구조를 정의한 스키마
                (예: {"type": "object", "properties": {"cover_letter": {"type": "string"}}})

            **kwargs:
                temperature, max_tokens 등 모델별 추가 파라미터

        반환값:
            Dict[str, Any]:
                모델이 생성한 구조화된 JSON 응답.
                예: {"cover_letter": "<생성된 자소서 본문>"}

        구현 시 주의:
            - OpenAIProvider / GeminiProvider에서 각각 구체적으로 구현
            - FastAPI의 generator.py → generate_cover_letter()에서 호출됨
        """
        ...
