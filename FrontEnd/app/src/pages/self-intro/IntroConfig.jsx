// src/pages/self-intro/IntroConfig.jsx
import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Header, { HEADER_H } from "../../components/Header";
import Background from "../../components/Background";

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
  { title: "진로적", desc: "신뢰감 있고 정갈한 톤으로 안정된 분위기를 강조합니다." },
  { title: "열정적", desc: "적극적이고 도전적인 이미지를 강조하는 톤입니다." },
  { title: "진솔한", desc: "솔직함과 공감을 중심으로 따뜻한 느낌을 전달합니다." },
  { title: "협력적", desc: "팀워크와 소통 능력을 강조하는 톤입니다." },
];

export default function IntroConfig() {
  const navigate = useNavigate();

  const handleGenerateClick = () => {
    navigate("/self-intro/loading");
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
              {questionList.map((q) => (
                <QuestionItem key={q}>
                  <TextWrap>
                    <QuestionLabel>{q.title}</QuestionLabel>
                    <QuestionHelp>{q.desc}</QuestionHelp>
                  </TextWrap>
                  <CircleInput type="radio" name="question" />
                </QuestionItem>
              ))}
            </QuestionList>
          </CardQuestion>

          {/* 2. 어조 / 분위기 선택 카드 */}
          <CardTone>
            <SectionTitle>자기소개서 어조/분위기 선택</SectionTitle>

            <ToneInner>
              <ToneGrid>
                {toneList.map((tone) => (
                  <ToneBox key={tone.title}>
                    <ToneTitle>{tone.title}</ToneTitle>
                    <ToneDesc>{tone.desc}</ToneDesc>
                  </ToneBox>
                ))}
              </ToneGrid>
            </ToneInner>
          </CardTone>

          {/* 3. 분량 설정 카드 */}
          <CardLength>
            <SectionTitle>자기소개서 문항 당 분량 설정</SectionTitle>

            <LengthOptions>
              <LengthOption>
                <input type="radio" name="length" defaultChecked />
                <span>500자</span>
              </LengthOption>
              <LengthOption>
                <input type="radio" name="length" />
                <span>1000자</span>
              </LengthOption>
              <LengthOption>
                <input type="radio" name="length" />
                <span>1500자</span>
              </LengthOption>
            </LengthOptions>
          </CardLength>

          {/* 하단 버튼 */}
          <BottomBtn type="button" onClick={handleGenerateClick}>
            자소서 생성하기
          </BottomBtn>
        </InnerColumn>
      </PageBody>
    </>
  );
}

/* ===== Layout ===== */

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

/* ===== 공통 카드 스타일 ===== */

const BaseCard = styled.section`
  width: 740px;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
  padding: 25px 32px; /* ⬅ 세 카드 모두 동일: 제목 x좌표 통일 */
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
`;

/* 1번 카드 */

const CardQuestion = styled(BaseCard)`
  height: 581px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const CardTitleWrap = styled.header`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CardSubTitle = styled.p`
  font-size: 14px;
  color: #555;
`;

const QuestionList = styled.ul`
  flex: 1;
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
`;

const QuestionItem = styled.li`
  padding: 14px 18px;
  border-radius: 16px;
  border: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

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

const CircleInput = styled.input`
  width: 20px;
  height: 20px;
`;

/* 2번 카드 */

const CardTone = styled(BaseCard)`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const ToneInner = styled.div`
  /* 양쪽에 여유를 둬서 상자 뭉치가 안쪽으로 모이게 */
  padding: 0 68px; /* 32 + 68 ≈ 100 느낌 */
`;

const ToneGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  row-gap: 25px;
  column-gap: 25px;
`;

const ToneBox = styled.button`
  border-radius: 18px;
  padding: 20px 18px;
  border: 1px solid #dbeafe;
  background: #f3f7ff;
  text-align: left;
  cursor: pointer;

  &:hover {
    border-color: #0f7f90;
  }
`;

const ToneTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const ToneDesc = styled.p`
  font-size: 13px;
  color: #555;
`;

/* 3번 카드 */

const CardLength = styled(BaseCard)`
  height: 144px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 위 제목 / 아래 옵션 공간 균등 */
`;

const LengthOptions = styled.div`
  width: 100%;
  max-width: 420px;       /* 너무 넓지 않게 */
  margin: 0 auto 0 auto;  /* 가운데로 모으기 */
  display: flex;
  justify-content: space-between; /* 500 / 1000 / 1500 간격 일정 */
  align-items: center;
`;

const LengthOption = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  cursor: pointer;

  input {
    width: 16px;
    height: 16px;
  }
`;

/* 하단 버튼 */

const BottomBtn = styled.button`
  margin-top: 25px;
  width: 260px;
  height: 52px;
  border-radius: 999px;
  border: none;
  background: #0f7f90;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
`;
