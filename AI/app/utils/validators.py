from typing import Dict, Any


def clamp_length(text: str, target: int) -> str:
    # target ±15% 범위로 자르기
    low, high = int(target * 0.85), int(target * 1.15)
    if len(text) < low:
        return text
    if len(text) > high:
        return text[:high].rstrip() + "…"
    return text


def sanitize_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    # 빈 값/중복 제거 등 사소한 전처리 추가 가능
    return payload
