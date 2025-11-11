import os
from pydantic import BaseModel
from dotenv import load_dotenv
# .env 파일에서 환경 변수 로드
load_dotenv()

class Settings(BaseModel):
    env: str = os.getenv("ENV", "dev")
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "8000"))


    model_provider: str = os.getenv("MODEL_PROVIDER", "openai").lower()
    model_name: str = os.getenv("MODEL_NAME", "gpt-5")


    openai_api_key: str | None = os.getenv("OPENAI_API_KEY")
    gemini_api_key: str | None = os.getenv("GEMINI_API_KEY")


# Generation defaults (UI의 톤/분량은 요청에서 override)
    temperature: float = float(os.getenv("TEMPERATURE", "0.3"))
    top_p: float = float(os.getenv("TOP_P", "0.9"))
    max_output_tokens: int = int(os.getenv("MAX_OUTPUT_TOKENS", "2000"))


settings = Settings()