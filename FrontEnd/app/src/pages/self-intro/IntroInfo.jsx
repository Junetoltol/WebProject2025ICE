// src/pages/self-intro/IntroInfo.jsx
import React, { useState, useRef } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Header, { HEADER_H } from "../../components/Header";
import Background from "../../components/Background";

// 달력 아이콘이 붙은 단일 date input
function DateInputWithIcon({ placeholder }) {
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
      <DateInput ref={inputRef} placeholder={placeholder} />
      <CalendarIcon onClick={openPicker}>
        <CalendarSvg />
      </CalendarIcon>
    </DateField>
  );
}

export default function IntroInfo() {
  const navigate = useNavigate();

  // 각 섹션별 카드 ID 배열
  const [careerIds, setCareerIds] = useState([0]);
  const [projectIds, setProjectIds] = useState([0]);
  const [certIds, setCertIds] = useState([0]); // 자격증
  const [langIds, setLangIds] = useState([0]); // 어학
  const [skillIds, setSkillIds] = useState([0]);
  const [activityIds, setActivityIds] = useState([0]);
  const [awardIds, setAwardIds] = useState([0]);

  // 공통 add / remove
  const addId = (setter) =>
    setter((prev) => [...prev, prev[prev.length - 1] + 1]);

  const removeId = (setter, id) =>
    setter((prev) => prev.filter((x) => x !== id));

  const handleTempSave = () => {
    alert("임시 저장은 나중에 실제 로직 연결");
  };

  const handleNext = () => {
    navigate("/self-intro/config");
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
                <InputBox placeholder="제목을 입력해주세요." />
              </FullFieldRow>

              <TwoColRow>
                <FieldCol>
                  <FieldLabel>회사명</FieldLabel>
                  <InputBox placeholder="ex. ICE Tech" />
                </FieldCol>
                <FieldCol>
                  <FieldLabel>지원 직무</FieldLabel>
                  <InputBox placeholder="ex. 백엔드 개발자" />
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
              <SmallPillBtn type="button">기존 정보 불러오기</SmallPillBtn>
            </CardHeader>

            {/* 경력 / 인턴 / 아르바이트 경험 */}
            <Section>
              <SectionTitleRow>
                <SectionTitle>경력 / 인턴 / 아르바이트 경험</SectionTitle>
                <SectionHelp>
                  구체적인 성과 · 역할 중심 (숫자/결과 강조)
                </SectionHelp>
              </SectionTitleRow>

              {careerIds.map((id, idx) => (
                <WhiteCard key={`career-${id}`}>
                  {idx > 0 && (
                    <DeleteBtn
                      type="button"
                      onClick={() => removeId(setCareerIds, id)}
                    >
                      🗑
                    </DeleteBtn>
                  )}

                  <ComplexRow>
                    <ComplexLabel>회사명</ComplexLabel>
                    <ComplexInputCell>
                      <InputBox placeholder="회사/기관명 입력" />
                    </ComplexInputCell>
                  </ComplexRow>

                  <ComplexRow>
                    <ComplexLabel>기간</ComplexLabel>
                    <ComplexInputCell>
                      <DateRangeWrapper>
                        <DateInputWithIcon placeholder="시작일" />
                        <Tilde>~</Tilde>
                        <DateInputWithIcon placeholder="종료일" />
                      </DateRangeWrapper>
                    </ComplexInputCell>
                  </ComplexRow>

                  <ComplexRow>
                    <ComplexLabel>담당 업무</ComplexLabel>
                    <ComplexInputCell>
                      <InputBox placeholder="ex. 프론트엔드 개발" />
                    </ComplexInputCell>
                  </ComplexRow>
                </WhiteCard>
              ))}

              <PlusBox type="button" onClick={() => addId(setCareerIds)}>
                +
              </PlusBox>
            </Section>

            <SectionDivider />

            {/* 프로젝트 경험 */}
            <Section>
              <SectionTitleRow>
                <SectionTitle>프로젝트 경험</SectionTitle>
              </SectionTitleRow>

              {projectIds.map((id, idx) => (
                <WhiteCard key={`proj-${id}`}>
                  {idx > 0 && (
                    <DeleteBtn
                      type="button"
                      onClick={() => removeId(setProjectIds, id)}
                    >
                      🗑
                    </DeleteBtn>
                  )}

                  <ComplexRow>
                    <ComplexLabel>프로젝트</ComplexLabel>
                    <ComplexInputCell>
                      <InputBox placeholder="프로젝트명 입력" />
                    </ComplexInputCell>
                  </ComplexRow>

                  <ComplexRow>
                    <ComplexLabel>기간</ComplexLabel>
                    <ComplexInputCell>
                      <DateRangeWrapper>
                        <DateInputWithIcon placeholder="시작일" />
                        <Tilde>~</Tilde>
                        <DateInputWithIcon placeholder="종료일" />
                      </DateRangeWrapper>
                    </ComplexInputCell>
                  </ComplexRow>

                  <ComplexRow>
                    <ComplexLabel>역할</ComplexLabel>
                    <ComplexInputCell>
                      <InputBox placeholder="ex. 프론트엔드 개발" />
                    </ComplexInputCell>
                  </ComplexRow>

                  <ComplexRow>
                    <ComplexLabel>기술/도구</ComplexLabel>
                    <ComplexInputCell>
                      <InputBox placeholder="사용 기술/도구 입력" />
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
                      />
                    </ComplexInputCell>
                  </ComplexRow>
                </WhiteCard>
              ))}

              <PlusBox type="button" onClick={() => addId(setProjectIds)}>
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
              {certIds.map((id, idx) => (
                <WhiteCard key={`cert-${id}`}>
                  {idx > 0 && (
                    <DeleteBtn
                      type="button"
                      onClick={() => removeId(setCertIds, id)}
                    >
                      🗑
                    </DeleteBtn>
                  )}

                  <ComplexRow>
                    <ComplexLabel>자격증</ComplexLabel>
                    <ComplexInputCell>
                      <InputBox placeholder="ex. 정보처리 기사" />
                    </ComplexInputCell>
                  </ComplexRow>
                </WhiteCard>
              ))}
              <PlusBox type="button" onClick={() => addId(setCertIds)}>
                +
              </PlusBox>

              {/* 어학 */}
              <SubSectionTitle style={{ marginTop: 18 }}>어학</SubSectionTitle>
              {langIds.map((id, idx) => (
                <WhiteCard key={`lang-${id}`}>
                  {idx > 0 && (
                    <DeleteBtn
                      type="button"
                      onClick={() => removeId(setLangIds, id)}
                    >
                      🗑
                    </DeleteBtn>
                  )}

                  <ComplexRow>
                    <ComplexLabel>어학시험</ComplexLabel>
                    <ComplexInputCell>
                      <InputBox placeholder="시험명 / 어학 점수" />
                    </ComplexInputCell>
                  </ComplexRow>
                </WhiteCard>
              ))}
              <PlusBox type="button" onClick={() => addId(setLangIds)}>
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

              {skillIds.map((id, idx) => (
                <WhiteCard key={`skill-${id}`}>
                  {idx > 0 && (
                    <DeleteBtn
                      type="button"
                      onClick={() => removeId(setSkillIds, id)}
                    >
                      🗑
                    </DeleteBtn>
                  )}

                  <ComplexRow>
                    <ComplexLabel>기술 스택</ComplexLabel>
                    <ComplexInputCell>
                      <InputBox placeholder="ex. Java" />
                    </ComplexInputCell>
                  </ComplexRow>

                  <ComplexRow>
                    <ComplexLabel>수준</ComplexLabel>
                    <ComplexInputCell>
                      <TagRow>
                        <TagBtn type="button">기본</TagBtn>
                        <TagBtn type="button">활용 가능</TagBtn>
                        <TagBtn type="button">심화</TagBtn>
                      </TagRow>
                    </ComplexInputCell>
                  </ComplexRow>
                </WhiteCard>
              ))}

              <PlusBox type="button" onClick={() => addId(setSkillIds)}>
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

              {activityIds.map((id, idx) => (
                <WhiteCard key={`act-${id}`}>
                  {idx > 0 && (
                    <DeleteBtn
                      type="button"
                      onClick={() => removeId(setActivityIds, id)}
                    >
                      🗑
                    </DeleteBtn>
                  )}

                  <ComplexRow>
                    <ComplexLabel>활동명</ComplexLabel>
                    <ComplexInputCell>
                      <InputBox placeholder="ex. 정보통신공학과 학회" />
                    </ComplexInputCell>
                  </ComplexRow>

                  <ComplexRow>
                    <ComplexLabel>기간</ComplexLabel>
                    <ComplexInputCell>
                      <DateRangeWrapper>
                        <DateInputWithIcon placeholder="시작일" />
                        <Tilde>~</Tilde>
                        <DateInputWithIcon placeholder="종료일" />
                      </DateRangeWrapper>
                    </ComplexInputCell>
                  </ComplexRow>

                  <ComplexRow>
                    <ComplexLabel>담당 업무</ComplexLabel>
                    <ComplexInputCell>
                      <InputBox placeholder="ex. 기획 차장" />
                    </ComplexInputCell>
                  </ComplexRow>
                </WhiteCard>
              ))}

              <PlusBox type="button" onClick={() => addId(setActivityIds)}>
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

              {awardIds.map((id, idx) => (
                <WhiteCard key={`award-${id}`}>
                  {idx > 0 && (
                    <DeleteBtn
                      type="button"
                      onClick={() => removeId(setAwardIds, id)}
                    >
                      🗑
                    </DeleteBtn>
                  )}

                  <ComplexRow>
                    <ComplexLabel>활동명</ComplexLabel>
                    <ComplexInputCell>
                      <InputBox placeholder="ex. ○○ 공모전 참여" />
                    </ComplexInputCell>
                  </ComplexRow>

                  <ComplexRow>
                    <ComplexLabel>활동 내용</ComplexLabel>
                    <ComplexInputCell>
                      <TextareaBox
                        rows={3}
                        placeholder="활동 상세내용을 작성해주세요. (300자 이내)"
                      />
                    </ComplexInputCell>
                  </ComplexRow>
                </WhiteCard>
              ))}

              <PlusBox type="button" onClick={() => addId(setAwardIds)}>
                +
              </PlusBox>
            </Section>
          </Card>

          {/* 하단 버튼 */}
          <BottomButtonRow>
            <BottomGrayBtn type="button" onClick={handleTempSave}>
              임시 저장
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
  padding: 14px 16px 16px;
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

  /* 크롬 기본 달력 아이콘 숨기기 */
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

/* 삭제 버튼 */

const DeleteBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: #f4f4f4;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
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
`;


/* 기술 스택 태그 */

const TagRow = styled.div`
  display: inline-flex;
  gap: 8px;
`;

const TagBtn = styled.button`
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid #dcdcdc;
  background: #f8f8f8;
  font-size: 11px;
  cursor: pointer;
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
`;

const BottomGrayBtn = styled(BaseBottomBtn)`
  border-radius: 12px;
  color:#ffffff;
  border: 1px solid #737171;
  background: #737171;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
  `;

const BottomBlueBtn = styled(BaseBottomBtn)`
  border-radius: 12px;
  border: 1px solid #737171;
  background: #00678C;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
  color: #ffffff;
`;