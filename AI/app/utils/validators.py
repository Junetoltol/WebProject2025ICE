from typing import Dict, Any

# ============================================================
# 문자열 및 요청 데이터 전처리 유틸 함수 모음
# ============================================================

def clamp_length(text: str, target: int) -> str:
    """
    자소서 또는 요약문 등의 길이를 target ±15% 범위로 보정한다.
    - 너무 짧으면 그대로 두고 (추가 생성 없음)
    - 너무 길면 target * 1.15 길이까지만 자르고 '…' 붙임
    - 예: target=1000 → 허용 길이 범위: 850~1150자
    """
    low, high = int(target * 0.85), int(target * 1.15)

    # ① 지정 길이보다 짧은 경우 그대로 반환
    if len(text) < low:
        return text

    # ② 지정 길이보다 긴 경우 잘라서 반환
    if len(text) > high:
        return text[:high].rstrip() + "…"   # rstrip()으로 불필요한 공백 제거 후 말줄임표 추가

    # ③ 적정 길이일 경우 그대로 유지
    return text


def sanitize_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    입력 데이터를 정리(정상화)하는 함수.
    - 불필요한 None, 빈 문자열, 중복 리스트 항목 등을 제거할 수 있음
    - 현재는 패스스루(그대로 반환)지만, 추후 전처리 로직을 추가할 수 있도록 구조만 확보
    """
    return payload
