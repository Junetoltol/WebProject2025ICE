from typing import List, Optional, Literal
from pydantic import BaseModel, Field, EmailStr

# ============================================================
# 공통 데이터 구조 (이력서 작성에 필요한 기본 단위들)
# ============================================================

class Profile(BaseModel):
    """지원자 프로필 정보"""
    name: str = Field(min_length=1)                                  # 이름 (필수)
    title: Optional[str] = None                                      # 직무 타이틀
    location: Optional[str] = None                                   # 거주지 / 근무 희망지
    email: Optional[EmailStr] = None                                 # 이메일 (형식 검증 포함)
    phone: Optional[str] = Field(default=None, pattern=r"^[+0-9 ()-]{7,20}$")  # 전화번호 (숫자, +, -, 공백 허용)

class ExperienceItem(BaseModel):
    """경력 항목"""
    company: str                                                     # 회사명
    role: str                                                        # 직무명 / 포지션
    start: Optional[str] = Field(default=None, pattern=r"^\d{4}-(0[1-9]|1[0-2])$")  # 시작 시점 (YYYY-MM)
    end: Optional[str] = Field(default=None, pattern=r"^(\d{4}-(0[1-9]|1[0-2])|Present)$")  # 종료 시점 (또는 Present)
    tasks: Optional[List[str]] = None                                # 주요 업무
    achievements: Optional[List[str]] = None                         # 성과 (숫자 기반이면 가중치 ↑)

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
# 이력서 및 자소서 입력 구조 (프론트엔드 요청 바디)
# ============================================================

class ResumeInput(BaseModel):
    """이력서 전체 구조 (CoverLetterRequest.data 내부에 포함)"""
    profile: Profile                                                 # 프로필 정보
    target_company: Optional[str] = None                             # 지원 회사명 (선택)
    target_role: Optional[str] = None                                # 지원 직무명 (선택)
    summary: Optional[str] = None                                    # 간단한 자기소개 요약
    skills: List[str] = Field(default_factory=list, max_items=30)    # 기술 스택 (최대 30개)
    experience: List[ExperienceItem] = Field(default_factory=list, min_items=0)  # 경력 목록
    projects: List[ProjectItem] = Field(default_factory=list)        # 프로젝트 목록
    certifications: List[str] = Field(default_factory=list)          # 자격증
    languages: List[str] = Field(default_factory=list)               # 구사 언어
    activities: List[ActivityItem] = Field(default_factory=list)     # 활동 내역
    awards: List[AwardItem] = Field(default_factory=list)            # 수상 내역

class EssayConfig(BaseModel):
    """자소서 문항 설정"""
    question: Literal[
        "지원 동기", "본인의 강점 및 역량", "협업 및 팀워크 경험",
        "문제 해결 경험", "실패 및 극복 경험", "전공/학문적 경험", "입사 후 포부/비전"
    ]                                                                # 자소서 문항 유형 (정해진 목록 중 택1)
    tone: Literal["전문적", "진솔한", "열정적", "협력적"]            # 작성 톤/스타일
    length: Literal[500, 1000, 1500]                                 # 분량 (글자 수 기준)

class CoverLetterRequest(BaseModel):
    """자소서 생성 요청 모델"""
    data: ResumeInput                                                # 이력서 데이터 전체
    essay: EssayConfig                                               # 문항 설정

# ============================================================
# 출력 (LLM 응답 구조)
# ============================================================

class CoverLetterResponse(BaseModel):
    """자소서 생성 결과"""
    cover_letter: str                                                # 생성된 자소서 본문 텍스트

class ResumeJSONResponse(BaseModel):
    """JSON 형태의 이력서 구조화 결과"""
    result: dict                                                     # 구조화된 JSON 데이터 (후처리 용)
