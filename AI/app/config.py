# 환경 설정 (Settings)
# - .env 파일을 로드하여 실행 환경(dev/prod), 포트, 모델 종류(OpenAI/Gemini) 등을 관리
# - FastAPI 전역에서 import하여 동일한 설정 사용
import os
from pydantic import BaseModel
from dotenv import load_dotenv


# 1️.env 파일에서 환경 변수 로드
# - 프로젝트 루트에 위치한 .env의 내용을 os.environ으로 불러옴
# - 예: .env 안에 HOST=127.0.0.1 PORT=8000 ...

load_dotenv()


# 2. Settings 클래스
# - BaseModel을 상속하여 타입 안정성을 확보
# - 환경 변수를 Python 객체로 매핑

class Settings(BaseModel):
    # ---------------------------
    # 기본 실행 환경
    # ---------------------------
    env: str = os.getenv("ENV", "dev")                   # 환경 구분 (dev, prod 등)
    host: str = os.getenv("HOST", "0.0.0.0")             # 서버 호스트 주소
    port: int = int(os.getenv("PORT", "8000"))           # 포트 번호 (기본 8000)

    # ---------------------------
    # AI 모델 설정
    # ---------------------------
    model_provider: str = os.getenv("MODEL_PROVIDER", "openai").lower()  # 모델 제공자(openai | gemini)
    model_name: str = os.getenv("MODEL_NAME", "gpt-5")                   # 사용할 모델 이름 (기본 gpt-5)

    # ---------------------------
    # API 키 (외부 서비스 연동)
    # - 실제 키 값은 .env에서 관리해야 하며 절대 GitHub에 올리지 않음
    # ---------------------------
    openai_api_key: str | None = os.getenv("OPENAI_API_KEY")   # OpenAI용 API Key
    gemini_api_key: str | None = os.getenv("GEMINI_API_KEY")   # Gemini용 API Key

    # ---------------------------
    # 모델 응답 생성 기본값
    # - 프롬프트 세부 설정 (UI에서 override 가능)
    # ---------------------------
    temperature: float = float(os.getenv("TEMPERATURE", "0.3"))       # 창의성/랜덤성 (0.0~1.0)
    top_p: float = float(os.getenv("TOP_P", "0.9"))                   # nucleus sampling 확률 컷오프
    max_output_tokens: int = int(os.getenv("MAX_OUTPUT_TOKENS", "2000"))  # 최대 출력 토큰 수

# ------------------------------------------------------------
# 3️⃣ 전역 Settings 인스턴스
# - 어디서든 from app.config import settings 로 불러 사용 가능
# ------------------------------------------------------------
settings = Settings()
