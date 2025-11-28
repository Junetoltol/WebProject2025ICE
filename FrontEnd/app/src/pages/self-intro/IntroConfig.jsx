// src/pages/self-intro/IntroConfig.jsx
import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Header, { HEADER_H } from "../../components/Header";
import Background from "../../components/Background";
import {
  saveCoverLetterSettings,
  generateCoverLetter,
} from "../../api/selfIntro";

// 👉 명세의 예시와 완전히 같을 필요는 없지만 참고용
const questionList = [
  {
    title: "지원 동기",
    desc: "왜 이 회사/기관에 지원했는지, 어떤 계기와 목표가 있는지",
  },
  {
    title: "본인의 강점 및 역량",
    desc: "자신이 가진 기술적 · 성격적 강점, 차별화된 경쟁력",
  },
  {
    title: "협업 및 팀워크 경험",
    desc: "타인과 함께 목표를 달성했던 사례, 갈등 극복 경험",
  },
  {
    title: "문제 해결 경험",
    desc: "예상치 못한 문제 상황에서 새로운 접근 방식으로 해결한 사례",
  },
  {
    title: "실패 및 극복 경험",
    desc: "실패나 좌절을 경험한 사례와, 이를 어떻게 극복했는지",
  },
  {
    title: "전공 및 학문적 경험",
    desc: "전공, 연구, 프로젝트 등에서 얻은 전문지식과 성과",
  },
  {
    title: "입사 후 포부 / 비전",
    desc: "회사나 기관에서 이루고 싶은 목표와 본인의 기여 방안",
  },
];

const toneList = [
  {
    title: "전문적",
    desc: "신뢰감 있고 격식 있는 표현으로 전문성을 강조합니다.",
  },
  {
    title: "진솔한",
    desc: "솔직하고 담백한 어조로 경험과 진정성을 드러냅니다.",
  },
  {
    title: "열정적",
    desc: "적극적이고 도전적인 태도를 강조해 활기를 보여줍니다.",
  },
  {
    title: "협력적",
    desc: "따뜻하고 배려심 있는 분위기로 팀워크와 소통을 강조합니다.",
  },
];

// SVG 커스텀 라디오/체크 스타일
function RadioIcon({ checked }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="21"
      height="21"
      viewBox="0 0 21 21"
      fill="none"
    >
      <circle cx="10.5" cy="10.5" r="10" fill="white" stroke="#737171" />
      {checked && <circle cx="10.5" cy="10.5" r="7.5" fill="#00678C" />}
    </svg>
  );
}

export default function IntroConfig() {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  // 1) URL 경로에서 받는 경우: /self-intro/config/:coverLetterId
  // 2) 이전 페이지에서 state로 넘긴 경우: location.state.coverLetterId
  const coverLetterId =
    params.coverLetterId ?? location.state?.coverLetterId ?? null;

  const [selectedQuestions, setSelectedQuestions] = useState([
    questionList[0].title,
  ]);
  const [selectedTone, setSelectedTone] = useState(toneList[0].title);

  // 🔸 명세에 맞춰 500/1000/1500 중 하나로 맞춤
  const [selectedLength, setSelectedLength] = useState("1000");

  const [saving, setSaving] = useState(false);

  const toggleQuestion = (title) => {
    setSelectedQuestions((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const handleGenerate = async () => {
    if (!coverLetterId) {
      alert(
        "자소서 ID(coverLetterId)가 없습니다. 이전 페이지에서 제대로 넘어왔는지 확인해주세요."
      );
      return;
    }

    if (selectedQuestions.length === 0) {
      alert("최소 1개 이상의 문항을 선택해주세요.");
      return;
    }

    const payload = {
      questions: selectedQuestions,
      tone: selectedTone, // 예: "전문적", "진솔한" 등
      lengthPerQuestion: Number(selectedLength), // 500 / 1000 / 1500
    };

    try {
      setSaving(true);

      // 1️⃣ 자소서 설정 저장
      const settingsResult = await saveCoverLetterSettings(
        coverLetterId,
        payload
      );
      // settingsResult.data = { coverLetterId, tone, lengthPerQuestion, ... }

      // 2️⃣ 자소서 생성 요청 (poll 모드)
      const generateResult = await generateCoverLetter(coverLetterId, {
        mode: "poll", // ?mode=poll 로 비동기 잡 요청
        exportFormat: "word", // 결과 포맷 힌트 (다운로드용)
        options: { includeEvidence: true },
      });

      const genData = generateResult.data;
      const status = genData.status; // "PROCESSING" | "SUCCESS" 등

      // 3️⃣ 상태에 따라 이동
      if (status === "SUCCESS") {
        // 동기 모드이거나, 바로 성공 응답을 준 경우
        navigate("/self-intro/download", {
          state: {
            coverLetterId: genData.coverLetterId,
            previewUrl: genData.previewUrl, // 예: "/files/cover-7001.png"
          },
        });
      } else if (status === "PROCESSING") {
        // 비동기 잡으로 들어간 경우 → 로딩 화면으로
        navigate("/self-intro/loading", {
          state: {
            coverLetterId: genData.coverLetterId,
          },
        });
      } else {
        // 혹시 모르는 값이면 일단 로딩 화면으로
        navigate("/self-intro/loading", {
          state: {
            coverLetterId,
          },
        });
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "자소서 생성 요청 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header />
      <Background />

      <PageBody>
        <InnerColumn>
          {/* 1. 문항 선택 카드 */}
          <CardQuestion>
            <CardTitleWrap>
              <SectionTitle>자기소개서 문항 입력</SectionTitle>
              <CardSubTitle>
                자기소개서에 포함시킬 문항을 선택해주세요.
              </CardSubTitle>
            </CardTitleWrap>

            <QuestionList>
              {questionList.map((q) => {
                const isActive = selectedQuestions.includes(q.title);

                return (
                  <QuestionItem
                    key={q.title}
                    $active={isActive}
                    onClick={() => toggleQuestion(q.title)}
                  >
                    <TextWrap>
                      <QuestionLabel>{q.title}</QuestionLabel>
                      <QuestionHelp>{q.desc}</QuestionHelp>
                    </TextWrap>

                    <RadioLabel
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <HiddenInput
                        type="checkbox"
                        checked={isActive}
                        onChange={() => toggleQuestion(q.title)}
                      />
                      <RadioIcon checked={isActive} />
                    </RadioLabel>
                  </QuestionItem>
                );
              })}
            </QuestionList>
          </CardQuestion>

          {/* 2. 어조 선택 */}
          <CardTone>
            <SectionTitle>자기소개서 어조/분위기 선택</SectionTitle>

            <ToneInner>
              <ToneGrid>
                {toneList.map((tone) => {
                  const isActive = selectedTone === tone.title;
                  return (
                    <ToneBox
                      key={tone.title}
                      type="button"
                      $active={isActive}
                      onClick={() => setSelectedTone(tone.title)}
                    >
                      <ToneTitle>{tone.title}</ToneTitle>
                      <ToneDesc>{tone.desc}</ToneDesc>
                    </ToneBox>
                  );
                })}
              </ToneGrid>
            </ToneInner>
          </CardTone>

          {/* 3. 분량 설정 */}
          <CardLength>
            <SectionTitle>자기소개서 문항 당 분량 설정</SectionTitle>

            <LengthOptions>
              {["500", "1000", "1500"].map((len) => (
                <LengthOption key={len}>
                  <RadioLabel>
                    <HiddenInput
                      type="radio"
                      name="length"
                      value={len}
                      checked={selectedLength === len}
                      onChange={(e) => setSelectedLength(e.target.value)}
                    />
                    <RadioIcon checked={selectedLength === len} />
                  </RadioLabel>
                  <span>{len}자</span>
                </LengthOption>
              ))}
            </LengthOptions>
          </CardLength>

          {/* 저장 + 다음 단계로 이동 */}
          <BottomBtn type="button" onClick={handleGenerate} disabled={saving}>
            {saving ? "저장 중..." : "자소서 생성하기"}
          </BottomBtn>
        </InnerColumn>
      </PageBody>
    </>
  );
}

/* ===== 스타일 ===== */

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

const BaseCard = styled.section`
  width: 740px;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  padding: 25px 32px;
  box-sizing: border-box;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
`;

/* --- 문항 카드 --- */

const CardQuestion = styled(BaseCard)`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const CardTitleWrap = styled.header`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CardSubTitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: #555;
`;

const QuestionList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const QuestionItem = styled.li`
  padding: 14px 18px;
  border-radius: 16px;
  border: 1px solid ${({ $active }) => ($active ? "#0f7f90" : "#d9d9d9")};
  background: ${({ $active }) => ($active ? "#f5fbff" : "#ffffff")};
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;

  /* 부드러운 애니메이션 */
  transition: background 0.15s ease, border-color 0.15s ease,
    box-shadow 0.15s ease, transform 0.05s ease;

  &:hover {
    border-color: #00678c;
    background: #f5fbff;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }
`;

/* --- 텍스트 --- */

const TextWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
const QuestionLabel = styled.span`
  font-size: 15px;
  font-weight: 600;
`;
const QuestionHelp = styled.span`
  font-size: 12px;
  color: #777;
`;

/* --- 어조 카드 --- */

const CardTone = styled(BaseCard)`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const ToneInner = styled.div`
  padding: 0 68px;
`;

const ToneGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
`;

const ToneBox = styled.button`
  border-radius: 18px;
  padding: 20px 18px;
  border: 1px solid ${({ $active }) => ($active ? "#0f7f90" : "#d9d9d9")};
  background: ${({ $active }) => ($active ? "#f5fbff" : "#ffffff")};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;

  transition: background 0.15s ease, border-color 0.15s ease,
    box-shadow 0.15s ease, transform 0.05s ease;

  &:hover {
    border-color: #00678c;
    background: #f5fbff;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }
`;

const ToneTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 6px;
`;
const ToneDesc = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
`;

/* --- 분량 카드 --- */

const CardLength = styled(BaseCard)`
  height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 50px;
`;

const LengthOptions = styled.div`
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
`;

const LengthOption = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

/* --- 커스텀 라디오/체크 --- */

const RadioLabel = styled.label`
  width: 21px;
  height: 21px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const HiddenInput = styled.input`
  position: absolute;
  opacity: 0;
  pointer-events: none;
`;

/* --- 버튼 --- */

const BottomBtn = styled.button`
  margin-top: 20px;
  padding: 16px 53px;
  border-radius: 12px;
  border: 1px solid #737171;
  background: #00678c;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.05s ease;

  &:hover {
    background: #005574;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.28);
  }

  &:disabled {
    opacity: 0.7;
    cursor: default;
    box-shadow: none;
  }
`;
