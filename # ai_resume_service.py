# -----------------------------
# 0) 기본 세팅 및 의존성 임포트
# -----------------------------
import os  # 환경변수에서 API 키를 읽기 위해 사용
import json  # 텍스트로 온 JSON을 파싱하기 위해 사용
from typing import Any, Dict, Optional  # 타입 힌트를 위해 사용
from openai import OpenAI  # OpenAI Python SDK의 클라이언트

# -----------------------------
# 1) OpenAI 클라이언트 생성 함수
# -----------------------------
def get_client() -> OpenAI:
    """
    OpenAI SDK 클라이언트를 생성해 반환한다.  # 함수 설명
    - 키는 환경변수 OPENAI_API_KEY에서 읽는다.  # 보안상 코드에 키를 직접 넣지 않는다.
    """
    api_key = os.getenv("OPENAI_API_KEY")  # 환경변수에서 API 키를 읽음
    if not api_key:  # 키가 없을 경우 예외 처리
        raise RuntimeError("환경변수 OPENAI_API_KEY가 설정되어 있지 않습니다.")  # 명확한 오류 메시지
    return OpenAI(api_key=api_key)  # 인증된 클라이언트를 생성해 반환

# -----------------------------
# 2) 이력서 JSON 스키마(Structured Output 강제용)
# -----------------------------
RESUME_JSON_SCHEMA: Dict[str, Any] = {  # 스키마를 딕셔너리로 정의
    "type": "object",  # 최상위는 객체 타입
    "properties": {  # 필드 정의
        "profile": {  # 지원자 기본 정보
            "type": "object",  # 객체 타입
            "properties": {  # 하위 필드 정의
                "name": {"type": "string"},  # 이름
                "title": {"type": "string"},  # 직함(예: Backend Engineer)
                "location": {"type": "string"},  # 지역
                "email": {"type": "string"},  # 이메일
                "phone": {"type": "string"}  # 전화번호
            },
            "required": ["name"]  # name은 필수
        },
        "summary": {"type": "string"},  # 핵심 요약(3~5문장)
        "skills": {  # 보유 스킬 목록
            "type": "array",  # 배열 타입
            "items": {"type": "string"},  # 각 요소는 문자열
            "minItems": 1  # 최소 1개 이상
        },
        "experience": {  # 경력 섹션
            "type": "array",  # 배열 타입
            "items": {  # 각 경력 항목 스키마
                "type": "object",  # 객체 타입
                "properties": {  # 하위 필드
                    "company": {"type": "string"},  # 회사명
                    "role": {"type": "string"},  # 직무/직책
                    "start": {"type": "string"},  # 시작(YYYY-MM)
                    "end": {"type": "string"},  # 종료(YYYY-MM|Present)
                    "achievements": {  # 성과 리스트
                        "type": "array",  # 배열 타입
                        "items": {"type": "string"},  # 각 요소는 문자열
                        "minItems": 1  # 최소 1개 이상
                    }
                },
                "required": ["company", "role", "achievements"]  # 필수 필드
            }
        },
        "education": {  # 학력 섹션(선택)
            "type": "array",  # 배열 타입
            "items": {  # 각 학력 항목
                "type": "object",  # 객체 타입
                "properties": {  # 하위 필드
                    "school": {"type": "string"},  # 학교명
                    "degree": {"type": "string"},  # 학위
                    "major": {"type": "string"},  # 전공
                    "start": {"type": "string"},  # 시작(YYYY)
                    "end": {"type": "string"}  # 종료(YYYY)
                },
                "required": ["school"]  # 학교명은 필수
            }
        },
        "projects": {  # 프로젝트 섹션(선택)
            "type": "array",  # 배열 타입
            "items": {  # 각 프로젝트 항목
                "type": "object",  # 객체 타입
                "properties": {  # 하위 필드
                    "name": {"type": "string"},  # 프로젝트명
                    "description": {"type": "string"},  # 설명
                    "tech": {  # 사용 기술
                        "type": "array",  # 배열 타입
                        "items": {"type": "string"}  # 각 요소는 문자열
                    },
                    "impact": {"type": "string"}  # 임팩트/성과
                },
                "required": ["name", "description"]  # 필수 필드
            }
        },
        "keywords": {  # JD 핵심 키워드 배열(선택)
            "type": "array",  # 배열 타입
            "items": {"type": "string"}  # 각 요소는 문자열
        }
    },
    "required": ["profile", "summary", "skills", "experience"]  # 최상위 필수 필드
}

# -----------------------------
# 3) 시스템 메시지/유저 템플릿(프롬프트)
# -----------------------------
SYSTEM_PROMPT: str = (  # 시스템 프롬프트(모델의 역할과 출력 규칙)
    "너는 HR/TA 전문가이자 테크 라이터다. 반드시 주어진 JSON 스키마에 맞춘 JSON만 출력한다. "  # JSON만 반환하도록 강제
    "각 경력의 성과는 ‘행동→맥락→정량결과’ 1~3줄로 서술하고 가능하면 수치를 포함한다. "  # 성과 작성 규칙
    "허위 작성 및 개인 민감정보 노출은 금지한다."  # 준수해야 할 윤리/보안 규칙
)

USER_TEMPLATE: str = """다음 정보를 바탕으로 타깃 회사/직무에 맞춘 이력서를 생성해줘.  # 사용자 템플릿 시작

[지원자 정보]  # 사용자 입력: 개인 정보 블록
{user_info}  # 실제 사용자 정보가 포맷팅되어 들어갈 자리

[지원 회사 정보]  # 사용자 입력: 회사/직무 정보 블록
{company_info}  # 실제 회사 정보가 포맷팅되어 들어갈 자리

형식:  # 모델에 출력 섹션의 기대 형식을 알려줌
- profile(name/title/location/email/phone)  # 프로필 필드
- summary(3~5문장, 핵심역량/도메인/키워드)  # 요약 필드
- skills(키워드 배열)  # 스킬 배열
- experience(회사/역할/기간/업적)  # 경력 섹션
- education  # 학력 섹션(선택)
- projects(선택)  # 프로젝트 섹션(선택)
- keywords(채용공고 핵심키워드)  # 키워드 배열(선택)
"""  # 템플릿 문자열 종료

# -----------------------------
# 4) Responses API 결과 파싱 유틸
# -----------------------------
def _extract_structured_output(resp: Any) -> Dict[str, Any]:
    """
    Responses API 응답 객체에서 Structured Output(JSON)을 안전하게 추출한다.  # 함수 설명
    SDK 버전별 속성 차이를 고려해 여러 경로를 시도한다.  # 호환성 보장
    """
    # 4-1) 가장 권장: content[0].parsed 경로(지원 시)  # 1차 시도
    try:
        output = getattr(resp, "output", None)  # resp.output 속성 접근
        if output and len(output) > 0:  # 출력이 존재하는지 확인
            content = getattr(output[0], "content", None)  # 첫 출력의 content 접근
            if content and len(content) > 0:  # 콘텐츠가 있는지 확인
                first = content[0]  # 첫 콘텐츠 아이템 선택
                parsed = getattr(first, "parsed", None)  # parsed 속성 시도(Structured Output)
                if parsed:  # parsed가 존재하면
                    return parsed  # 이미 dict 형태이므로 그대로 반환
                text = getattr(first, "text", None)  # 텍스트 경로 보조
                if text:  # 텍스트가 있으면
                    return json.loads(text)  # 문자열 JSON을 파싱해 반환
    except Exception:  # 어떤 예외가 발생하더라도
        pass  # 다음 경로로 넘어감

    # 4-2) 편의 프로퍼티: output_text 경로(지원 시)  # 2차 시도
    try:
        output_text = getattr(resp, "output_text", None)  # resp.output_text 접근
        if output_text:  # 값이 있으면
            return json.loads(output_text)  # 문자열 JSON을 파싱해 반환
    except Exception:  # 파싱 실패 시
        pass  # 다음 경로로 넘어감

    # 4-3) 마지막 수단: 모델 덤프 후 텍스트 추출  # 3차 시도
    try:
        # 일부 SDK는 model_dump_json()/to_json()/to_dict() 등을 제공  # 호환성 고려
        if hasattr(resp, "model_dump_json"):  # pydantic 기반 객체일 수 있음
            dumped = resp.model_dump_json()  # JSON 문자열로 덤프
            data = json.loads(dumped)  # 파싱
            # 가능한 위치에서 텍스트를 재시도  # 안전장치
            text = (
                data.get("output_text")  # output_text 키 시도
                or data.get("text")  # text 키 시도
            )
            if text:
                return json.loads(text)  # 문자열 JSON을 파싱해 반환
    except Exception:
        pass  # 실패해도 다음 단계 존재

    # 4-4) 모든 경로 실패 시 예외  # 실패 처리
    raise ValueError("응답에서 구조화된 JSON을 추출하지 못했습니다.")  # 명확한 오류 메시지

# -----------------------------
# 5) 이력서 생성 핵심 함수
# -----------------------------
def generate_resume_draft(
    user_info: str,  # 사용자 입력(원문)
    company_info: str,  # 회사/직무 정보(원문)
    model: str = "gpt-5",  # 기본 모델(조직 정책/비용에 따라 조정)
    temperature: float = 0.3,  # 일관성 우선의 낮은 온도
    max_output_tokens: int = 2000  # 충분한 출력 토큰 한도
) -> Dict[str, Any]:
    """
    사용자/회사 정보를 받아 이력서 JSON을 생성한다.  # 함수 설명
    - Responses API + JSON 스키마 강제(Structured Outputs)를 사용한다.  # 안정적 파싱
    """
    client = get_client()  # OpenAI 클라이언트 생성
    # 메시지 작성(시스템/유저 분리)  # 프롬프트 준비
    messages = [  # 메시지 리스트 시작
        {"role": "system", "content": SYSTEM_PROMPT},  # 시스템 역할 지시
        {"role": "user", "content": USER_TEMPLATE.format(user_info=user_info, company_info=company_info)}  # 사용자 입력
    ]  # 메시지 리스트 종료

    # Responses API 호출 파라미터 구성  # 호출 준비
    response = client.responses.create(  # Responses API 호출
        model=model,  # 사용할 모델 지정
        messages=messages,  # 대화 메시지 전달
        response_format={  # 구조화 출력(스키마) 지정
            "type": "json_schema",  # JSON 스키마 모드
            "json_schema": {  # 구체 스키마 전달
                "name": "resume_schema",  # 스키마 이름
                "schema": RESUME_JSON_SCHEMA,  # 실제 스키마 본문
                "strict": True  # 스키마 엄격 준수
            }
        },
        temperature=temperature,  # 생성 다양성/일관성 조절
        top_p=0.9,  # 확률 상위 누적 제한
        max_output_tokens=max_output_tokens,  # 출력 토큰 상한
        reasoning={"effort": "low"}  # 모델이 지원 시 추론 노력 힌트
    )  # API 호출 종료

    # 응답에서 구조화된 JSON 추출  # 결과 파싱
    resume_json = _extract_structured_output(response)  # 안전한 파서 유틸로 추출
    return resume_json  # 최종 JSON 반환

# -----------------------------
# 6) (선택) FastAPI 마이크로서비스 엔드포인트
# -----------------------------
try:
    # FastAPI가 설치되어 있으면 API 서버도 함께 제공  # 선택적 의존성
    from fastapi import FastAPI  # FastAPI 웹 프레임워크
    from pydantic import BaseModel, Field  # 요청/응답 모델 검증

    app = FastAPI(title="AI Resume Service", version="1.0.0")  # FastAPI 인스턴스 생성

    class GenerateBody(BaseModel):  # 요청 바디 스키마 정의
        user_info: str = Field(..., description="사용자 정보 원문")  # 필수: 사용자 정보
        company_info: str = Field(..., description="회사/직무 정보 원문")  # 필수: 회사 정보
        model: Optional[str] = Field(default="gpt-5", description="모델 이름")  # 선택: 모델
        temperature: Optional[float] = Field(default=0.3, description="샘플링 온도")  # 선택: 온도

    @app.post("/v1/resume/generate")  # POST 엔드포인트 정의
    def api_generate(body: GenerateBody) -> Dict[str, Any]:  # 핸들러 함수
        """
        사용자/회사 정보를 받아 이력서 JSON을 생성하는 HTTP API.  # 엔드포인트 설명
        """
        data = generate_resume_draft(  # 핵심 함수를 호출
            user_info=body.user_info,  # 요청의 사용자 정보
            company_info=body.company_info,  # 요청의 회사 정보
            model=body.model,  # 모델
            temperature=body.temperature  # 온도
        )  # 생성 호출 종료
        return {"resume": data, "model": body.model}  # JSON 응답 반환
except Exception:
    # FastAPI 미설치 등의 이유로 임포트 실패 시 조용히 무시  # 라이브러리 없는 환경에서도 동작
    app = None  # 앱 객체를 None으로 둠

# -----------------------------
# 7) 스탠드얼론 실행 예시
# -----------------------------
if __name__ == "__main__":  # 스크립트 직접 실행 시
    # 데모용 입력 데이터  # 간단 예시
    user_data = """  # 사용자 정보 블록
이름: 홍길동
경력: 5년간 OO회사에서 소프트웨어 개발 담당
스킬: Python, Java, AWS, Docker
"""  # 문자열 종료

    company_data = """  # 회사/직무 정보 블록
회사명: 네이버
직무: 백엔드 개발자
인재상: 끊임없이 도전하고 배우는 사람
"""  # 문자열 종료

    try:
        # 이력서 생성 함수 호출  # 동작 확인
        resume = generate_resume_draft(user_data, company_data)  # JSON 생성
        print(json.dumps(resume, ensure_ascii=False, indent=2))  # 가독성 있게 출력
    except Exception as e:
        # 예외 발생 시 메시지 출력  # 디버깅 편의
        print(f"실행 중 오류: {e}")  # 오류 내용 출력

    # FastAPI 서버 실행 안내(선택)  # 서버 사용법 힌트
    if app is not None:  # FastAPI가 준비된 경우
        print("\nFastAPI 서버를 실행하려면:\nuvicorn ai_resume_service:app --reload --port 8081\n")  # 명령 예시
