from typing import List, Optional
from pydantic import BaseModel, Field, EmailStr

# ============================================================
# 공통 데이터 구조 (자소서 작성에 필요한 기본 단위들)
# ============================================================

class Profile(BaseModel):
    """지원자 프로필 정보"""
    name: str = Field(min_length=1)                                  # 이름 (필수)
    title: Optional[str] = None                                      # 직무 타이틀
    location: Optional[str] = None                                   # 거주지 / 근무 희망지
    email: Optional[EmailStr] = None                                 # 이메일 (형식 검증 포함)
    phone: Optional[str] = Field(
        default=None,
        pattern=r"^[+0-9 ()-]{7,20}$"
    )  # 전화번호 (숫자, +, -, 공백 허용)


class ExperienceItem(BaseModel):
    """경력 항목"""
    company: str                                                     # 회사명
    role: str                                                        # 직무명 / 포지션
    start: Optional[str] = Field(
        default=None,
        pattern=r"^\d{4}-(0[1-9]|1[0-2])$"
    )  # 시작 시점 (YYYY-MM)
    end: Optional[str] = Field(
        default=None,
        pattern=r"^(\d{4}-(0[1-9]|1[0-2])|Present)$"
    )  # 종료 시점 (또는 Present)
    tasks: Optional[List[str]] = None                                # 주요 업무
    achievements: Optional[List[str]] = None                         # 성과


class ProjectItem(BaseModel):
    """프로젝트 수행 이력"""
    name: str                                                        # 프로젝트명
    description: Optional[str] = None                                # 프로젝트 개요
    tech: Optional[List[str]] = None                                 # 사용 기술 스택
    impact: Optional[str] = None                                     # 프로젝트의 영향 (성과 중심)
    start: Optional[str] = None                                      # 시작 시점
    end: Optional[str] = None                                        # 종료 시점
    role: Optional[str] = None                                       # 담당 역할


class ActivityItem(BaseModel):
    """교내외 활동, 동아리, 대외활동 등"""
    name: str                                                        # 활동명
    role: Optional[str] = None                                       # 역할 / 직책
    period: Optional[str] = None                                     # 활동 기간
    details: Optional[str] = None                                    # 구체 내용


class AwardItem(BaseModel):
    """수상 및 공모전 내역"""
    name: str                                                        # 수상명
    org: Optional[str] = None                                        # 주최 기관
    details: Optional[str] = None                                    # 수상 관련 세부 내용


# ============================================================
# 이력서 전체 입력 (Java 쪽에서 대부분 null 로 보내도 허용)
# ============================================================

class ResumeInput(BaseModel):
    """이력서 전체 입력 구조"""

    # 전부 Optional + 기본값 None 으로 두어서 null 도 허용
    profile: Optional[Profile] = None
    experiences: Optional[List[ExperienceItem]] = None
    projects: Optional[List[ProjectItem]] = None
    activities: Optional[List[ActivityItem]] = None
    awards: Optional[List[AwardItem]] = None


# ============================================================
# 자소서 입력 구조 (프론트엔드/백엔드 요청 바디)
# ============================================================

class EssayConfig(BaseModel):
    """
    자소서 문항 설정
    - 지금은 Java 에서 tone="formal", length=800 이런 값이 오고 있으니까
      Literal 제한을 풀고, 그냥 str / int 로 받도록 완화함.
    """
    question: Optional[str] = None          # 지금은 자유 문자열로
    tone: str = "진솔한"                    # 아무 문자열이나 허용
    length: int = 1000                      # 아무 숫자나 허용


class CoverLetterRequest(BaseModel):
    """자소서 생성 요청 모델"""

    # Java 에서 data 를 안 보내거나 null 로 보내도 되도록 Optional
    data: Optional[ResumeInput] = None
    essay: EssayConfig                      # essay 는 필수 (tone/length 때문에)


# ============================================================
# 출력 (LLM 응답 구조)
# ============================================================

class CoverLetterResponse(BaseModel):
    """자소서 생성 결과"""
    cover_letter: str    

