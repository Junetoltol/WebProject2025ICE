from typing import List, Optional, Literal
from pydantic import BaseModel, Field, EmailStr

# ====== 공통 ======
class Profile(BaseModel):
    name: str = Field(min_length=1)
    title: Optional[str] = None
    location: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, pattern=r"^[+0-9 ()-]{7,20}$")

class ExperienceItem(BaseModel):
    company: str
    role: str
    start: Optional[str] = Field(default=None, pattern=r"^\d{4}-(0[1-9]|1[0-2])$")
    end: Optional[str] = Field(default=None, pattern=r"^(\d{4}-(0[1-9]|1[0-2])|Present)$")
    tasks: Optional[List[str]] = None
    achievements: Optional[List[str]] = None

class ProjectItem(BaseModel):
    name: str
    description: Optional[str] = None
    tech: Optional[List[str]] = None
    impact: Optional[str] = None
    start: Optional[str] = None
    end: Optional[str] = None
    role: Optional[str] = None

class ActivityItem(BaseModel):
    name: str
    role: Optional[str] = None
    period: Optional[str] = None
    details: Optional[str] = None

class AwardItem(BaseModel):
    name: str
    org: Optional[str] = None
    details: Optional[str] = None

# ====== 이력서/자소서 입력 ======
class ResumeInput(BaseModel):
    profile: Profile
    target_company: Optional[str] = None
    target_role: Optional[str] = None
    summary: Optional[str] = None
    skills: List[str] = Field(default_factory=list, max_items=30)
    experience: List[ExperienceItem] = Field(default_factory=list, min_items=0)
    projects: List[ProjectItem] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    activities: List[ActivityItem] = Field(default_factory=list)
    awards: List[AwardItem] = Field(default_factory=list)

class EssayConfig(BaseModel):
    question: Literal[
        "지원 동기", "본인의 강점 및 역량", "협업 및 팀워크 경험",
        "문제 해결 경험", "실패 및 극복 경험", "전공/학문적 경험", "입사 후 포부/비전"
    ]
    tone: Literal["전문적", "진솔한", "열정적", "협력적"]
    length: Literal[500, 1000, 1500]

class CoverLetterRequest(BaseModel):
    data: ResumeInput
    essay: EssayConfig

# ====== 출력 ======
class CoverLetterResponse(BaseModel):
    cover_letter: str

class ResumeJSONResponse(BaseModel):
    result: dict
