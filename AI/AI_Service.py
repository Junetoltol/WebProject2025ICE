import os
import json
from typing import Any, Dict, List, Optional, Tuple

#############################################
# 0) 공통: 이력서 JSON 스키마
#############################################
RESUME_JSON_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "properties": {
        "profile": {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "title": {"type": "string"},
                "location": {"type": "string"},
                "email": {"type": "string"},
                "phone": {"type": "string"}
            },
            "required": ["name"]
        },
        "summary": {"type": "string"},
        "skills": {"type": "array", "items": {"type": "string"}, "minItems": 1},
        "experience": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "company": {"type": "string"},
                    "role": {"type": "string"},
                    "start": {"type": "string"},
                    "end": {"type": "string"},
                    "achievements": {"type": "array", "items": {"type": "string"}, "minItems": 1}
                },
                "required": ["company", "role", "achievements"]
            }
        },
        "education": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "school": {"type": "string"},
                    "degree": {"type": "string"},
                    "major": {"type": "string"},
                    "start": {"type": "string"},
                    "end": {"type": "string"}
                },
                "required": ["school"]
            }
        },
        "projects": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "description": {"type": "string"},
                    "tech": {"type": "array", "items": {"type": "string"}},
                    "impact": {"type": "string"}
                },
                "required": ["name", "description"]
            }
        },
        "keywords": {"type": "array", "items": {"type": "string"}}
    },
    "required": ["profile", "summary", "skills", "experience"]
}

#############################################
# 1) Few-shot 예시
#############################################
FEWSHOTS: List[Tuple[str, str]] = [
    (
        """[지원자 정보] 이런식으로 적기(ai 생성, 학생용으로 개조예정)
이름: 김지원
경력: 3년, 백엔드 개발(Spring Boot), 주문/정산 모듈
스킬: Java, Spring, JPA, MySQL, AWS

[지원 회사 정보]
회사명: 무신사
직무: 백엔드 개발자
핵심역량: 대규모 트래픽, 결제/정산, 성능 최적화, 장애 대응
""",
        json.dumps({
            "profile": {"name": "김지원", "title": "Backend Engineer", "location": "", "email": "", "phone": ""},
            "summary": "전자상거래 주문/정산 백엔드 개발 3년. Spring/JPA 기반 도메인 모델링과 쿼리 최적화 경험.",
            "skills": ["Java", "Spring Boot", "JPA", "MySQL", "AWS", "Kafka"],
            "experience": [
                {
                    "company": "OO커머스",
                    "role": "백엔드 개발자",
                    "start": "2022-01",
                    "end": "Present",
                    "achievements": [
                        "정산 배치를 이벤트 스트림으로 전환 → 지연 90% 단축",
                        "주문 API 튜닝 → 응답시간 380ms→140ms 개선"
                    ]
                }
            ],
            "education": [],
            "projects": [],
            "keywords": ["정산", "주문", "성능 최적화", "대규모 트래픽"]
        }, ensure_ascii=False)
    )
]

#############################################
# 2) 프롬프트 빌더
#############################################
SYSTEM_PROMPT: str = (
    "너는 HR/TA 전문가이자 테크 라이터다. 반드시 JSON 스키마에 맞춘 JSON만 출력한다. "
    "성과는 ‘행동→맥락→정량결과’로 1~3줄, 숫자 포함. 허위/개인정보 금지."
)

USER_TEMPLATE: str = """다음 정보를 바탕으로 이력서를 생성해줘.

[지원자 정보]
{user_info}

[지원 회사 정보]
{company_info}
"""

def build_messages(user_info: str, company_info: str, fewshots: Optional[List[Tuple[str, str]]] = None) -> List[Dict[str, str]]:
    msgs = [{"role": "system", "content": SYSTEM_PROMPT}]
    if fewshots:
        for u, a in fewshots:
            msgs.append({"role": "user", "content": u})
            msgs.append({"role": "assistant", "content": a})
    msgs.append({"role": "user", "content": USER_TEMPLATE.format(user_info=user_info, company_info=company_info)})
    return msgs

#############################################
# 3) OpenAI Provider
#############################################
class OpenAIProvider:
    def __init__(self, model: Optional[str] = None):
        from openai import OpenAI
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY 필요")
        self.client = OpenAI(api_key=api_key)
        self.model = model or os.getenv("MODEL_NAME", "gpt-5")

    def _extract(self, resp: Any) -> Dict[str, Any]:
        out = resp.output[0].content[0]
        if hasattr(out, "parsed") and out.parsed:
            return out.parsed
        if hasattr(out, "text") and out.text:
            return json.loads(out.text)
        raise ValueError("응답 파싱 실패")

    def generate(self, messages: List[Dict[str, str]], schema: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        resp = self.client.responses.create(
            model=self.model,
            messages=messages,
            response_format={"type": "json_schema","json_schema": {"name": "resume_schema","schema": schema,"strict": True}},
            temperature=kwargs.get("temperature",0.3),
            top_p=kwargs.get("top_p",0.9),
            max_output_tokens=kwargs.get("max_output_tokens",2000),
        )
        return self._extract(resp)

#############################################
# 4) Gemini Provider (개념 예시, SDK 버전 맞춰 수정 필요)
#############################################
class GeminiProvider:
    def __init__(self, model: Optional[str] = None):
        import google.generativeai as genai
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY 필요")
        genai.configure(api_key=api_key)
        self.genai = genai
        self.model_name = model or os.getenv("MODEL_NAME","gemini-1.5-pro")

    def generate(self, messages: List[Dict[str, str]], schema: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        prompt_text = "\n\n".join([f"[{m['role']}]\n{m['content']}" for m in messages]) + "\n\n반드시 유효한 JSON만 출력"
        model = self.genai.GenerativeModel(self.model_name)
        res = model.generate_content(prompt_text, generation_config={"temperature":0.3})
        text = res.text.strip().strip("`")
        return json.loads(text)

#############################################
# 5) 프로바이더 선택 + 메인 함수
#############################################
def get_provider():
    provider = os.getenv("MODEL_PROVIDER","openai").lower()
    model = os.getenv("MODEL_NAME")
    if provider == "gemini":
        return GeminiProvider(model=model)
    return OpenAIProvider(model=model)

def generate_resume_draft(user_info: str, company_info: str, use_fewshot: bool=True) -> Dict[str, Any]:
    messages = build_messages(user_info, company_info, FEWSHOTS if use_fewshot else None)
    provider = get_provider()
    return provider.generate(messages, RESUME_JSON_SCHEMA)

#############################################
# 6) 실행 예시
#############################################
if __name__ == "__main__":
    os.environ.setdefault("MODEL_PROVIDER","openai")
    os.environ.setdefault("MODEL_NAME","gpt-5")

    user_data = """
이름: 홍길동
경력: 5년, 백엔드 개발(Spring, JPA), 결제/정산
스킬: Java, Spring Boot, JPA, MySQL, AWS
"""
    company_data = """
회사명: 네이버
직무: 백엔드 개발자
핵심역량: 대규모 트래픽, 성능 최적화, 결제 안정성
"""
    result = generate_resume_draft(user_data, company_data)
    print(json.dumps(result, ensure_ascii=False, indent=2))
