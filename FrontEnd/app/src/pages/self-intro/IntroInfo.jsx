// src/pages/self-intro/IntroInfo.jsx
import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import Header, { HEADER_H } from "../../components/Header";
import Background from "../../components/Background";
import {
  createCoverLetterDraft,
  updateCoverLetterDraft,
  getCoverLetterDraft,
} from "../../api/selfIntro";

// 달력 아이콘이 붙은 단일 date input
function DateInputWithIcon({ placeholder, value, onChange }) {
  const inputRef = useRef(null);

  const openPicker = () => {
    if (inputRef.current && inputRef.current.showPicker) {
      inputRef.current.showPicker();
    } else if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <DateField>
      <DateInput
        ref={inputRef}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <CalendarIcon type="button" onClick={openPicker}>
        <CalendarSvg />
      </CalendarIcon>
    </DateField>
  );
}

// YYYY-MM-DD -> YYYY-MM 로 자르는 헬퍼 (파이썬 스키마 패턴용)
const toYearMonth = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr.length >= 7) return dateStr.slice(0, 7);
  return dateStr;
};

export default function IntroInfo() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ 기본 정보 (API로 보낼 값들)
  const [title, setTitle] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [targetJob, setTargetJob] = useState("");

  // ✅ 임시 저장 후 받은 coverLetterId 보관
  const initialCoverLetterId = location.state?.coverLetterId ?? null;
  const [coverLetterId, setCoverLetterId] = useState(initialCoverLetterId);

  // ✅ 이력서 초안용 (지금은 사용 안 해도 보관)
  const [resumeId, setResumeId] = useState(null);

  const [saving, setSaving] = useState(false);

  // ================== 섹션별 상태 ==================

  // 경력 / 인턴 / 알바
  const [careers, setCareers] = useState([
    { id: 0, company: "", role: "", startDate: "", endDate: "" },
  ]);

  // 프로젝트 경험
  const [projects, setProjects] = useState([
    {
      id: 0,
      name: "",
      role: "",
      startDate: "",
      endDate: "",
      tech: "",
      achievement: "",
    },
  ]);

  // 자격증
  const [certs, setCerts] = useState([{ id: 0, name: "" }]);

  // 어학
  const [langs, setLangs] = useState([{ id: 0, exam: "" }]);

  // 기술 스택
  const [skills, setSkills] = useState([{ id: 0, name: "" }]);
  const [skillLevel, setSkillLevel] = useState("기본"); // 일단 보관만

  // 교내 / 대외 활동
  const [activities, setActivities] = useState([
    { id: 0, name: "", role: "", startDate: "", endDate: "" },
  ]);

  // 수상 / 연구 성과
  const [awards, setAwards] = useState([
    { id: 0, name: "", description: "" },
  ]);

  // ================== 공통 헬퍼 ==================
  const addItem = (setter, createItem) =>
    setter((prev) => {
      const nextId = prev.length > 0 ? prev[prev.length - 1].id + 1 : 0;
      return [...prev, { id: nextId, ...createItem() }];
    });

  const removeItem = (setter, id) =>
    setter((prev) => prev.filter((item) => item.id !== id));

  const updateItem = (setter, id, field, value) =>
    setter((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );

  // ================== 섹션별 헬퍼 ==================
  const addCareer = () =>
    addItem(setCareers, () => ({
      company: "",
      role: "",
      startDate: "",
      endDate: "",
    }));
  const removeCareer = (id) => removeItem(setCareers, id);
  const changeCareer = (id, field, value) =>
    updateItem(setCareers, id, field, value);

  const addProject = () =>
    addItem(setProjects, () => ({
      name: "",
      role: "",
      startDate: "",
      endDate: "",
      tech: "",
      achievement: "",
    }));
  const removeProject = (id) => removeItem(setProjects, id);
  const changeProject = (id, field, value) =>
    updateItem(setProjects, id, field, value);

  const addCert = () =>
    addItem(setCerts, () => ({
      name: "",
    }));
  const removeCert = (id) => removeItem(setCerts, id);
  const changeCert = (id, field, value) =>
    updateItem(setCerts, id, field, value);

  const addLang = () =>
    addItem(setLangs, () => ({
      exam: "",
    }));
  const removeLang = (id) => removeItem(setLangs, id);
  const changeLang = (id, field, value) =>
    updateItem(setLangs, id, field, value);

  const addSkill = () =>
    addItem(setSkills, () => ({
      name: "",
    }));
  const removeSkill = (id) => removeItem(setSkills, id);
  const changeSkill = (id, field, value) =>
    updateItem(setSkills, id, field, value);

  const addActivity = () =>
    addItem(setActivities, () => ({
      name: "",
      role: "",
      startDate: "",
      endDate: "",
    }));
  const removeActivity = (id) => removeItem(setActivities, id);
  const changeActivity = (id, field, value) =>
    updateItem(setActivities, id, field, value);

  const addAward = () =>
    addItem(setAwards, () => ({
      name: "",
      description: "",
    }));
  const removeAward = (id) => removeItem(setAwards, id);
  const changeAward = (id, field, value) =>
    updateItem(setAwards, id, field, value);

  // ⬇⬇ 기존 자소서가 있는 경우, 한 번 불러와서 기본 정보 채우기
  useEffect(() => {
    if (!initialCoverLetterId) return;

    (async () => {
      try {
        const draft = await getCoverLetterDraft(initialCoverLetterId);
        const loadedId = draft.coverLetterId ?? draft.id;
        setCoverLetterId(loadedId);

        setTitle(draft.title || "");
        setTargetCompany(draft.targetCompany || "");
        setTargetJob(draft.targetJob || "");
        // sections 안의 세부 내용은 나중에 필요하면 여기에 매핑 추가
      } catch (e) {
        console.error("자소서 초안 불러오기 실패:", e);
      }
    })();
  }, [initialCoverLetterId]);

  // 🔹 임시 저장 → 자소서 초안 저장
  const handleTempSave = async () => {
    if (!title.trim()) {
      alert("자기소개서 제목을 입력해 주세요.");
      return;
    }

    if (!targetCompany.trim() || !targetJob.trim()) {
      if (
        !window.confirm(
          "회사명 또는 지원 직무가 비어 있습니다.\n그래도 임시 저장하시겠습니까?"
        )
      ) {
        return;
      }
    }

    // ---- 1) 각 섹션별 리스트로 변환 ----

    // 경력/인턴/알바 → educationExperience / experiences
    const experienceList = careers
      .filter(
        (c) =>
          c.company.trim() ||
          c.role.trim() ||
          c.startDate.trim() ||
          c.endDate.trim()
      )
      .map((c) => ({
        company: c.company.trim(),
        role: c.role.trim(),
        start: toYearMonth(c.startDate),
        end: toYearMonth(c.endDate),
        tasks: c.role.trim() ? [c.role.trim()] : [],
        achievements: [],
      }));

    // 프로젝트 경험 → projectExperience / projects
    const projectList = projects
      .filter(
        (p) =>
          p.name.trim() ||
          p.role.trim() ||
          p.tech.trim() ||
          p.achievement.trim() ||
          p.startDate.trim() ||
          p.endDate.trim()
      )
      .map((p) => ({
        name: p.name.trim(),
        description: p.achievement.trim() || null,
        tech: p.tech
          ? p.tech
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        impact: p.achievement.trim() || null,
        start: toYearMonth(p.startDate),
        end: toYearMonth(p.endDate),
        role: p.role.trim() || null,
      }));

    // 자격증 이름 목록
    const certNames = certs
      .map((c) => c.name.trim())
      .filter(Boolean);

    // 어학 시험/점수 문자열 목록
    const langNames = langs
      .map((l) => l.exam.trim())
      .filter(Boolean);

    // 기술 스택 문자열 목록
    const skillNames = skills
      .map((s) => s.name.trim())
      .filter(Boolean);

    // skills/technicalSkills 로 묶어서 AI 에 전달
    const allSkillNames = [...skillNames, ...certNames, ...langNames];
    const technicalSkills = allSkillNames.map((name) => ({ name }));

    // 교내/대외 활동 → activities
    const activityList = activities
      .filter(
        (a) =>
          a.name.trim() ||
          a.role.trim() ||
          a.startDate.trim() ||
          a.endDate.trim()
      )
      .map((a) => ({
        name: a.name.trim(),
        role: a.role.trim() || null,
        period:
          a.startDate || a.endDate
            ? `${a.startDate || ""} ~ ${a.endDate || ""}`.trim()
            : null,
        details: null,
      }));

    // 수상/연구 성과 → awards
    const awardList = awards
      .filter((a) => a.name.trim() || a.description.trim())
      .map((a) => ({
        name: a.name.trim(),
        org: null,
        details: a.description.trim() || null,
      }));

    // certifications 그대로도 보관 (참고용)
    const certList = certNames.map((name) => ({ name }));

    // ---- 2) 자소서 초안 payload ----
    const coverLetterPayload = {
      title: title || "",
      targetCompany: targetCompany || "",
      targetJob: targetJob || "",
      sections: {
        // 자바에서 educationExperience/experiences 둘 다 읽도록 설계
        educationExperience: experienceList,
        experiences: experienceList,

        projectExperience: projectList,
        projects: projectList,

        // skills/technicalSkills 둘 다 지원
        skills: skillNames, // 문자열 배열
        technicalSkills, // { name } 배열

        certifications: certList,
        languages: langNames.map((name) => ({ name })),

        activities: activityList,
        clubs: activityList, // 혹시 모를 키 호환용

        awards: awardList,
      },
    };

    try {
      setSaving(true);

      // 1) 자소서 초안 저장/수정
      let coverData;
      if (coverLetterId) {
        // 이미 한 번 생성된 자소서라면 → PATCH /api/cover-letters/{id}
        coverData = await updateCoverLetterDraft(
          coverLetterId,
          coverLetterPayload
        );
      } else {
        // 처음 생성 → POST /api/cover-letters
        coverData = await createCoverLetterDraft(coverLetterPayload);
      }

      // coverData === { coverLetterId, title, resumeId, ... }
      const newCoverId = coverData.coverLetterId ?? coverData.id;
      const newResumeId = coverData.resumeId ?? resumeId;

      console.log("임시 저장 후 coverLetterId:", newCoverId);
      console.log("임시 저장 후 resumeId:", newResumeId);

      if (!newCoverId) {
        throw new Error("자소서 ID를 응답에서 찾을 수 없습니다.");
      }

      setCoverLetterId(newCoverId);
      if (newResumeId) {
        setResumeId(newResumeId);
      }

      alert("자기소개서 초안이 임시 저장되었습니다.");
    } catch (err) {
      console.error(err);
      alert(err.message || "임시 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // 🔹 다음 단계 → /self-intro/config 로 이동 (IntroConfig에서 설정 저장)
  const handleNext = () => {
    if (!coverLetterId) {
      alert("먼저 임시 저장을 통해 자소서 초안을 생성해 주세요.");
      return;
    }

    navigate("/self-intro/config", {
      state: { coverLetterId },
    });
  };

  return (
    <>
      <Header />
      <Background />

      <PageBody>
        <InnerColumn>
          {/* 1. 기본 정보 입력 */}
          <Card>
            <CardHeader>
              <CardHeaderLeft>
                <CardTitle>기본 정보 입력</CardTitle>
                <CardSubtitle>
                  자기소개서에 공통으로 들어갈 보편적인 내용을 입력합니다.
                </CardSubtitle>
              </CardHeaderLeft>
            </CardHeader>

            <BasicFieldGroup>
              <FullFieldRow>
                <FieldLabel>자기소개서 제목</FieldLabel>
                <InputBox
                  placeholder="제목을 입력해주세요."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </FullFieldRow>

              <TwoColRow>
                <FieldCol>
                  <FieldLabel>회사명</FieldLabel>
                  <InputBox
                    placeholder="ex. ICE Tech"
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                  />
                </FieldCol>
                <FieldCol>
                  <FieldLabel>지원 직무</FieldLabel>
                  <InputBox
                    placeholder="ex. 백엔드 개발자"
                    value={targetJob}
                    onChange={(e) => setTargetJob(e.target.value)}
                  />
                </FieldCol>
              </TwoColRow>
            </BasicFieldGroup>
          </Card>

          {/* 2. 주요 경험 입력 */}
          <Card>
            <CardHeader>
              <CardHeaderLeft>
                <CardTitle>주요 경험 입력</CardTitle>
              </CardHeaderLeft>
            </CardHeader>

            {/* 경력 / 인턴 / 아르바이트 경험 */}
            <Section>
              <SectionTitleRow>
                <SectionTitle>경력 / 인턴 / 아르바이트 경험</SectionTitle>
                <SectionHelp>
                  구체적인 성과 · 역할 중심 (숫자/결과 강조)
                </SectionHelp>
              </SectionTitleRow>

              {careers.map(
                ({ id, company, role, startDate, endDate }, idx) => (
                  <WhiteCard key={`career-${id}`}>
                    {idx > 0 && (
                      <DeleteBtn
                        type="button"
                        onClick={() => removeCareer(id)}
                      >
                        <TrashSvg />
                      </DeleteBtn>
                    )}

                    <ComplexRow>
                      <ComplexLabel>회사명</ComplexLabel>
                      <ComplexInputCell>
                        <InputBox
                          placeholder="회사/기관명 입력"
                          value={company}
                          onChange={(e) =>
                            changeCareer(id, "company", e.target.value)
                          }
                        />
                      </ComplexInputCell>
                    </ComplexRow>

                    <ComplexRow>
                      <ComplexLabel>기간</ComplexLabel>
                      <ComplexInputCell>
                        <DateRangeWrapper>
                          <DateInputWithIcon
                            placeholder="시작일"
                            value={startDate}
                            onChange={(e) =>
                              changeCareer(id, "startDate", e.target.value)
                            }
                          />
                          <Tilde>~</Tilde>
                          <DateInputWithIcon
                            placeholder="종료일"
                            value={endDate}
                            onChange={(e) =>
                              changeCareer(id, "endDate", e.target.value)
                            }
                          />
                        </DateRangeWrapper>
                      </ComplexInputCell>
                    </ComplexRow>

                    <ComplexRow>
                      <ComplexLabel>담당 업무</ComplexLabel>
                      <ComplexInputCell>
                        <InputBox
                          placeholder="ex. 프론트엔드 개발"
                          value={role}
                          onChange={(e) =>
                            changeCareer(id, "role", e.target.value)
                          }
                        />
                      </ComplexInputCell>
                    </ComplexRow>
                  </WhiteCard>
                )
              )}

              <PlusBox type="button" onClick={addCareer}>
                +
              </PlusBox>
            </Section>

            <SectionDivider />

            {/* 프로젝트 경험 */}
            <Section>
              <SectionTitleRow>
                <SectionTitle>프로젝트 경험</SectionTitle>
              </SectionTitleRow>

              {projects.map(
                (
                  {
                    id,
                    name,
                    role,
                    startDate,
                    endDate,
                    tech,
                    achievement,
                  },
                  idx
                ) => (
                  <WhiteCard key={`proj-${id}`}>
                    {idx > 0 && (
                      <DeleteBtn
                        type="button"
                        onClick={() => removeProject(id)}
                      >
                        <TrashSvg />
                      </DeleteBtn>
                    )}

                    <ComplexRow>
                      <ComplexLabel>프로젝트</ComplexLabel>
                      <ComplexInputCell>
                        <InputBox
                          placeholder="프로젝트명 입력"
                          value={name}
                          onChange={(e) =>
                            changeProject(id, "name", e.target.value)
                          }
                        />
                      </ComplexInputCell>
                    </ComplexRow>

                    <ComplexRow>
                      <ComplexLabel>기간</ComplexLabel>
                      <ComplexInputCell>
                        <DateRangeWrapper>
                          <DateInputWithIcon
                            placeholder="시작일"
                            value={startDate}
                            onChange={(e) =>
                              changeProject(id, "startDate", e.target.value)
                            }
                          />
                          <Tilde>~</Tilde>
                          <DateInputWithIcon
                            placeholder="종료일"
                            value={endDate}
                            onChange={(e) =>
                              changeProject(id, "endDate", e.target.value)
                            }
                          />
                        </DateRangeWrapper>
                      </ComplexInputCell>
                    </ComplexRow>

                    <ComplexRow>
                      <ComplexLabel>역할</ComplexLabel>
                      <ComplexInputCell>
                        <InputBox
                          placeholder="ex. 프론트엔드 개발"
                          value={role}
                          onChange={(e) =>
                            changeProject(id, "role", e.target.value)
                          }
                        />
                      </ComplexInputCell>
                    </ComplexRow>

                    <ComplexRow>
                      <ComplexLabel>기술/도구</ComplexLabel>
                      <ComplexInputCell>
                        <InputBox
                          placeholder="사용 기술/도구 입력 (쉼표로 구분)"
                          value={tech}
                          onChange={(e) =>
                            changeProject(id, "tech", e.target.value)
                          }
                        />
                      </ComplexInputCell>
                    </ComplexRow>

                    <ComplexRow>
                      <ComplexLabel>성과</ComplexLabel>
                      <ComplexInputCell>
                        <TextareaBox
                          rows={3}
                          placeholder={
                            "프로젝트 시 이룬 성과를 입력해 주세요. (200자 이내)\nex. 생산성 2배 향상"
                          }
                          value={achievement}
                          onChange={(e) =>
                            changeProject(id, "achievement", e.target.value)
                          }
                        />
                      </ComplexInputCell>
                    </ComplexRow>
                  </WhiteCard>
                )
              )}

              <PlusBox type="button" onClick={addProject}>
                +
              </PlusBox>
            </Section>
          </Card>

          {/* 3. 선택/보강 항목 입력 */}
          <Card>
            <CardHeader>
              <CardHeaderLeft>
                <CardTitle>선택/보강 항목 입력</CardTitle>
              </CardHeaderLeft>
            </CardHeader>

            {/* 자격증 / 어학 */}
            <Section>
              <SectionTitleRow>
                <SectionTitle>자격증 / 어학</SectionTitle>
                <SectionHelp>
                  직무 연관 자격증 및 어학 점수(지원 직무에 필요할 때만) 입력
                </SectionHelp>
              </SectionTitleRow>

              {/* 자격증 */}
              <SubSectionTitle>자격증</SubSectionTitle>
              {certs.map(({ id, name }, idx) => (
                <WhiteCard key={`cert-${id}`}>
                  {idx > 0 && (
                    <DeleteBtn
                      type="button"
                      onClick={() => removeCert(id)}
                    >
                      <TrashSvg />
                    </DeleteBtn>
                  )}

                  <ComplexRow>
                    <ComplexLabel>자격증</ComplexLabel>
                    <ComplexInputCell>
                      <InputBox
                        placeholder="ex. 정보처리 기사"
                        value={name}
                        onChange={(e) =>
                          changeCert(id, "name", e.target.value)
                        }
                      />
                    </ComplexInputCell>
                  </ComplexRow>
                </WhiteCard>
              ))}
              <PlusBox type="button" onClick={addCert}>
                +
              </PlusBox>

              {/* 어학 */}
              <SubSectionTitle style={{ marginTop: 18 }}>어학</SubSectionTitle>
              {langs.map(({ id, exam }, idx) => (
                <WhiteCard key={`lang-${id}`}>
                  {idx > 0 && (
                    <DeleteBtn
                      type="button"
                      onClick={() => removeLang(id)}
                    >
                      <TrashSvg />
                    </DeleteBtn>
                  )}

                  <ComplexRow>
                    <ComplexLabel>어학시험</ComplexLabel>
                    <ComplexInputCell>
                      <InputBox
                        placeholder="시험명 / 어학 점수"
                        value={exam}
                        onChange={(e) =>
                          changeLang(id, "exam", e.target.value)
                        }
                      />
                    </ComplexInputCell>
                  </ComplexRow>
                </WhiteCard>
              ))}
              <PlusBox type="button" onClick={addLang}>
                +
              </PlusBox>
            </Section>

            <SectionDivider />

            {/* 기술 스택 */}
            <Section>
              <SectionTitleRow>
                <SectionTitle>기술 스택</SectionTitle>
                <SectionHelp>
                  사용 가능한 언어, 툴, 시뮬레이션/모델링 소프트웨어
                </SectionHelp>
              </SectionTitleRow>

              {skills.map(({ id, name }, idx) => (
                <WhiteCard key={`skill-${id}`}>
                  {idx > 0 && (
                    <DeleteBtn
                      type="button"
                      onClick={() => removeSkill(id)}
                    >
                      <TrashSvg />
                    </DeleteBtn>
                  )}

                  <ComplexRow>
                    <ComplexLabel>기술 스택</ComplexLabel>
                    <ComplexInputCell>
                      <InputBox
                        placeholder="ex. Java"
                        value={name}
                        onChange={(e) =>
                          changeSkill(id, "name", e.target.value)
                        }
                      />
                    </ComplexInputCell>
                  </ComplexRow>
                </WhiteCard>
              ))}

              <PlusBox type="button" onClick={addSkill}>
                +
              </PlusBox>
            </Section>

            <SectionDivider />

            {/* 교내 / 대외 활동 */}
            <Section>
              <SectionTitleRow>
                <SectionTitle>교내 / 대외 활동</SectionTitle>
                <SectionHelp>
                  동아리, 학회, 서포터즈, 학생회 등 (직무와 연결되는 것 위주)
                </SectionHelp>
              </SectionTitleRow>

              {activities.map(
                ({ id, name, role, startDate, endDate }, idx) => (
                  <WhiteCard key={`act-${id}`}>
                    {idx > 0 && (
                      <DeleteBtn
                        type="button"
                        onClick={() => removeActivity(id)}
                      >
                        <TrashSvg />
                      </DeleteBtn>
                    )}

                    <ComplexRow>
                      <ComplexLabel>활동명</ComplexLabel>
                      <ComplexInputCell>
                        <InputBox
                          placeholder="ex. 정보통신공학과 학회"
                          value={name}
                          onChange={(e) =>
                            changeActivity(id, "name", e.target.value)
                          }
                        />
                      </ComplexInputCell>
                    </ComplexRow>

                    <ComplexRow>
                      <ComplexLabel>기간</ComplexLabel>
                      <ComplexInputCell>
                        <DateRangeWrapper>
                          <DateInputWithIcon
                            placeholder="시작일"
                            value={startDate}
                            onChange={(e) =>
                              changeActivity(
                                id,
                                "startDate",
                                e.target.value
                              )
                            }
                          />
                          <Tilde>~</Tilde>
                          <DateInputWithIcon
                            placeholder="종료일"
                            value={endDate}
                            onChange={(e) =>
                              changeActivity(id, "endDate", e.target.value)
                            }
                          />
                        </DateRangeWrapper>
                      </ComplexInputCell>
                    </ComplexRow>

                    <ComplexRow>
                      <ComplexLabel>담당 업무</ComplexLabel>
                      <ComplexInputCell>
                        <InputBox
                          placeholder="ex. 기획 차장"
                          value={role}
                          onChange={(e) =>
                            changeActivity(id, "role", e.target.value)
                          }
                        />
                      </ComplexInputCell>
                    </ComplexRow>
                  </WhiteCard>
                )
              )}

              <PlusBox type="button" onClick={addActivity}>
                +
              </PlusBox>
            </Section>

            <SectionDivider />

            {/* 수상 및 연구 성과 */}
            <Section>
              <SectionTitleRow>
                <SectionTitle>수상 및 연구 성과</SectionTitle>
                <SectionHelp>공모전, 대회, 논문, 포스터 발표 등</SectionHelp>
              </SectionTitleRow>

              {awards.map(({ id, name, description }, idx) => (
                <WhiteCard key={`award-${id}`}>
                  {idx > 0 && (
                    <DeleteBtn
                      type="button"
                      onClick={() => removeAward(id)}
                    >
                      <TrashSvg />
                    </DeleteBtn>
                  )}

                  <ComplexRow>
                    <ComplexLabel>활동명</ComplexLabel>
                    <ComplexInputCell>
                      <InputBox
                        placeholder="ex. ○○ 공모전 참여"
                        value={name}
                        onChange={(e) =>
                          changeAward(id, "name", e.target.value)
                        }
                      />
                    </ComplexInputCell>
                  </ComplexRow>

                  <ComplexRow>
                    <ComplexLabel>활동 내용</ComplexLabel>
                    <ComplexInputCell>
                      <TextareaBox
                        rows={3}
                        placeholder="활동 상세내용을 작성해주세요. (300자 이내)"
                        value={description}
                        onChange={(e) =>
                          changeAward(id, "description", e.target.value)
                        }
                      />
                    </ComplexInputCell>
                  </ComplexRow>
                </WhiteCard>
              ))}

              <PlusBox type="button" onClick={addAward}>
                +
              </PlusBox>
            </Section>
          </Card>

          {/* 하단 버튼 */}
          <BottomButtonRow>
            <BottomGrayBtn
              type="button"
              onClick={handleTempSave}
              disabled={saving}
            >
              {saving ? "저장 중..." : "임시 저장"}
            </BottomGrayBtn>
            <BottomBlueBtn type="button" onClick={handleNext}>
              다음
            </BottomBlueBtn>
          </BottomButtonRow>
        </InnerColumn>
      </PageBody>
    </>
  );
}

/* ================= 스타일 ================= */

const PageBody = styled.main`
  position: relative;
  z-index: 10;
  min-height: calc(100vh - ${HEADER_H}px);
  padding-top: calc(${HEADER_H}px + 90px);
  padding-bottom: 120px;
  display: flex;
  justify-content: center;
`;

const InnerColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
`;

/* 카드 공통 */

const Card = styled.section`
  width: 740px;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  padding: 25px 32px 32px;
  box-sizing: border-box;
`;

const CardHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
`;

const CardHeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CardTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
`;

const CardSubtitle = styled.p`
  margin: 0;
  font-size: 13px;
  color: #666;
`;

const SmallPillBtn = styled.button`
  padding: 7px 16px;
  border-radius: 999px;
  border: 1px solid #d9d9d9;
  background: #f7f7f7;
  font-size: 11px;
  color: #555;
  cursor: pointer;
  transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.05s ease;

  &:hover {
    background: #e9e9e9;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
  }
`;

/* 기본 정보 입력 */

const BasicFieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const FullFieldRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TwoColRow = styled.div`
  display: flex;
  gap: 12px;
`;

const FieldCol = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FieldLabel = styled.label`
  font-size: 13px;
  font-weight: 500;
`;

const InputBox = styled.input`
  width: 100%;
  border-radius: 16px;
  border: 1px solid #e2e2e2;
  background: #ffffff;
  padding: 10px 14px;
  font-size: 13px;
  box-sizing: border-box;
  outline: none;

  &::placeholder {
    color: #aaa;
  }

  &:focus {
    border-color: #0f7f90;
  }
`;

const TextareaBox = styled.textarea`
  width: 100%;
  border-radius: 16px;
  border: 1px solid #e2e2e2;
  background: #ffffff;
  padding: 10px 14px;
  font-size: 13px;
  box-sizing: border-box;
  resize: none;
  outline: none;

  &:focus {
    border-color: #0f7f90;
  }
`;

/* 섹션 공통 */

const Section = styled.section`
  margin-top: 6px;
`;

const SectionTitleRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
`;

const SectionHelp = styled.span`
  font-size: 11px;
  color: #888;
`;

const SectionDivider = styled.hr`
  border: none;
  border-top: 1px solid #ededed;
  margin: 18px 0;
`;

const SubSectionTitle = styled.div`
  margin: 10px 0 6px;
  font-size: 13px;
  font-weight: 600;
`;

/* 흰 입력 카드 */

const WhiteCard = styled.div`
  position: relative;
  border-radius: 18px;
  border: 1px solid #e3e3e3;
  background: #ffffff;
  padding: 14px 44px 16px 16px; /* 오른쪽 패딩 ↑ : 삭제 버튼 공간 확보 */
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-sizing: border-box;
  margin-bottom: 10px;
  box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.06);
`;

const ComplexRow = styled.div`
  display: grid;
  grid-template-columns: 84px minmax(0, 1fr);
  column-gap: 10px;
  align-items: center;
`;

const ComplexLabel = styled.div`
  font-size: 13px;
  font-weight: 500;
`;

const ComplexInputCell = styled.div`
  width: 100%;
`;

/* 날짜 range */

const DateRangeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DateField = styled.div`
  position: relative;
  flex: 1;
`;

const DateInput = styled.input.attrs({ type: "date" })`
  width: 100%;
  border-radius: 16px;
  border: 1px solid #e2e2e2;
  background: #ffffff;
  padding: 10px 34px 10px 14px;
  font-size: 13px;
  box-sizing: border-box;
  outline: none;

  &::placeholder {
    color: #aaa;
  }

  &:focus {
    border-color: #0f7f90;
  }

  &::-webkit-calendar-picker-indicator {
    opacity: 0;
  }
`;

const CalendarIcon = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const Tilde = styled.span`
  font-size: 14px;
  color: #999;
`;

/* 달력 SVG */

function CalendarSvg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
    >
      <path
        d="M4.08333 6.41663H5.24999V7.58329H4.08333V6.41663ZM4.08333 8.74996H5.24999V9.91663H4.08333V8.74996ZM6.41666 6.41663H7.58333V7.58329H6.41666V6.41663ZM6.41666 8.74996H7.58333V9.91663H6.41666V8.74996ZM8.75 6.41663H9.91666V7.58329H8.75V6.41663ZM8.75 8.74996H9.91666V9.91663H8.75V8.74996Z"
        fill="#737171"
      />
      <path
        d="M2.91667 12.8333H11.0833C11.7267 12.8333 12.25 12.31 12.25 11.6666V3.49996C12.25 2.85654 11.7267 2.33329 11.0833 2.33329H9.91667V1.16663H8.75V2.33329H5.25V1.16663H4.08333V2.33329H2.91667C2.27325 2.33329 1.75 2.85654 1.75 3.49996V11.6666C1.75 12.31 2.27325 12.8333 2.91667 12.8333ZM11.0833 4.66663L11.0839 11.6666H2.91667V4.66663H11.0833Z"
        fill="#737171"
      />
    </svg>
  );
}

/* 휴지통 SVG */

function TrashSvg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
    >
      <path
        d="M2.5 10C2.5 10.2652 2.60536 10.5196 2.79289 10.7071C2.98043 10.8946 3.23478 11 3.5 11H8.5C8.76522 11 9.01957 10.8946 9.20711 10.7071C9.39464 10.5196 9.5 10.2652 9.5 10V4H10.5V3H8.5V2C8.5 1.73478 8.39464 1.48043 8.20711 1.29289C8.01957 1.10536 7.76522 1 7.5 1H4.5C4.23478 1 3.98043 1.10536 3.79289 1.29289C3.60536 1.48043 3.5 1.73478 3.5 2V3H1.5V4H2.5V10ZM4.5 2H7.5V3H4.5V2ZM4 4H8.5V10H3.5V4H4Z"
        fill="black"
      />
      <path d="M4.5 5H5.5V9H4.5V5ZM6.5 5H7.5V9H6.5V5Z" fill="black" />
    </svg>
  );
}

/* 삭제 버튼 */

const DeleteBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: #f4f4f4;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.05s ease;

  &:hover {
    background: #ffecec;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
  }
`;

/* 플러스 박스 */

const PlusBox = styled.button`
  margin-top: 16px;
  margin-bottom: 16px;
  width: 100%;
  height: 48px;
  border-radius: 16px;
  border: none;
  background: rgba(0, 109, 148, 0.25);
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
  font-size: 24px;
  color: #ffffff;
  cursor: pointer;

  transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.05s ease;

  &:hover {
    background: rgba(0, 109, 148, 0.35);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.28);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.25);
  }
`;

/* 기술 스택 태그 (지금은 사용 X, 나중 확장용) */

const TagRow = styled.div`
  display: inline-flex;
  gap: 8px;
`;

const TagBtn = styled.button`
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 11px;
  cursor: pointer;

  border: 1px solid ${({ $active }) => ($active ? "#0f7f90" : "#dcdcdc")};
  background: ${({ $active }) => ($active ? "#0f7f90" : "#f8f8f8")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#333")};

  transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.05s ease,
    border-color 0.15s ease, color 0.15s ease;

  &:hover {
    background: ${({ $active }) => ($active ? "#0d6b82" : "#ececec")};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.16);
  }
`;

/* 하단 버튼 */

const BottomButtonRow = styled.div`
  width: 740px;
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-top: 10px;
`;

const BaseBottomBtn = styled.button`
  min-width: 180px;
  height: 52px;
  border-radius: 12px;
  border: none;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.05s ease;
`;

const BottomGrayBtn = styled(BaseBottomBtn)`
  color: #ffffff;
  border: 1px solid #737171;
  background: #737171;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);

  &:hover {
    background: #5f5f5f;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.28);
  }
`;

const BottomBlueBtn = styled(BaseBottomBtn)`
  border: 1px solid #737171;
  background: #00678c;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
  color: #ffffff;

  &:hover {
    background: #005574;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.28);
  }
`;
