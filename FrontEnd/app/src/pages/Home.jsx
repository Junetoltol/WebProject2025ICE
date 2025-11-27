import React from "react";
import { useNavigate } from "react-router-dom";
import Header, { HEADER_H } from "../components/Header";
import Background from "../components/Background";

import styled from "styled-components";
import homeCharacter from "../assets/homeCharacter.png";
import jobBuddyLogo from "../assets/Job Buddy logo.png";

const PageLayer = styled.div`
  position: relative;
  z-index: 1; /* 배경보다 항상 위 */
  width: 100%;
  min-height: 100vh;
`;

const Main = styled.main`
  position: relative;
  z-index: 1; /* 배경(0)보다 앞으로 */

  padding-top: ${HEADER_H}px; /* 고정 헤더만큼 아래로 밀기 */

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow-x: hidden;
`;

const Hero = styled.section`
  max-width: 1100px;
  margin: 0 auto;
  padding: 80px 24px 56px;
  display: grid;
  grid-template-columns: 0.9fr 0.55fr;
  gap: 32px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const HeroText = styled.div`
  max-width: 540px;
  margin: 0 auto;
  text-align: center;
`;

const HeroTitle = styled.h1`
  word-break: keep-all;
  letter-spacing: -0.02em;
  font-size: 46px;
  font-weight: 700;
  line-height: 1.05;
  color: #000;
  margin: 0 0 18px 0;
  font-family: "Fustat", "Noto Sans KR", sans-serif;

  /* AI만 다르게 */
  strong {
    display: inline-block;
    margin-right: 6px;
    font-size: 80px;
    font-family: "Merriweather", "Times New Roman", serif;
    color: #00678c;
    line-height: 0.9;
    vertical-align: baseline;
  }

  @media (max-width: 960px) {
    font-size: 36px;
    strong {
      font-size: 58px;
    }
  }
`;

const HeroBrand = styled.h2`
  font-size: clamp(40px, 5vw, 48px);
  font-weight: 700;
  color: #0a607f;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.7);
  margin-bottom: 12px;
`;

const SubText = styled.p`
  margin: 0;
  font-size: 15px;
  color: #4a5a63;
  line-height: 1.4;
`;

const LogoImage = styled.img`
  width: 210px;
  height: auto;
  margin: 10px auto 6px;
  display: block;
`;

const Button = styled.button`
  margin-top: 16px;
  background: #0b5e74;
  border: none;
  color: #fff;
  padding: 12px 44px;
  border-radius: 6px;
  font-size: 15px;
  cursor: pointer;
  transition: 0.15s;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
  &:hover {
    background: #094e61;
  }
`;

const HeroImage = styled.img`
  max-width: 330px;
  width: 100%;
  justify-self: center;
  @media (max-width: 960px) {
    margin-top: 8px;
  }
`;

/* ===== 동그란 카드 영역 ===== */
const Features = styled.section`
  max-width: 880px;
  margin: 1rem auto 3rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 0 1.5rem;

  @media (max-width: 900px) {
    justify-content: center;
  }
`;

const FeatureCard = styled.div`
  width: 30%;
  min-width: 180px;

  /* 완전한 원 유지 */
  aspect-ratio: 1 / 1;
  border-radius: 50%;

  background: #006d944d;
  box-shadow: 0 7px 19px rgba(1, 69, 95, 0.12);

  position: relative;
  overflow: hidden;

  @media (max-width: 900px) {
    width: 220px;
  }
`;

/* 원 안에서 내용 정확히 가운데 (살짝 위로 보정) */
const FeatureInner = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  /* 살짝 위로 올리기 위해 -52% 사용 */
  transform: translate(-50%, -52%);

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;

  svg {
    display: block;
  }
`;

const FeatureTitle = styled.div`
  font-weight: 700;
  color: #1b3542;
  line-height: 1.2;
`;

const FeatureDesc = styled.div`
  font-size: 12px;
  max-width: 140px;
  color: #243844;
  line-height: 1.3;
`;

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <Background />
      <PageLayer>
        <Header />
        <Main>
          <Hero>
            <HeroText>
              <HeroTitle>
                <strong>AI</strong>와 함께 쓰는 나만의 지원서
              </HeroTitle>

              <SubText>자소서와 이력서, 이제 혼자가 아니라</SubText>
              <LogoImage src={jobBuddyLogo} alt="Job Buddy 로고" />
              <SubText>와 함께해요!</SubText>

              <Button onClick={() => navigate("/self-intro/Info")}>
                자기소개서 생성
              </Button>
            </HeroText>

            <HeroImage src={homeCharacter} alt="Job Buddy 캐릭터" />
          </Hero>

          <Features>
            <FeatureCard>
              <FeatureInner>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="60"
                  height="60"
                  viewBox="0 0 60 60"
                  fill="none"
                >
                  {/* ...SVG 내용 동일 */}
                </svg>
                <FeatureTitle>동반자</FeatureTitle>
                <FeatureDesc>
                  막막한 첫 문장부터 마지막 다듬기까지 함께!
                </FeatureDesc>
              </FeatureInner>
            </FeatureCard>

            <FeatureCard>
              <FeatureInner>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="60"
                  height="60"
                  viewBox="0 0 60 60"
                  fill="none"
                >
                  {/* ...SVG 내용 동일 */}
                </svg>
                <FeatureTitle>맞춤형</FeatureTitle>
                <FeatureDesc>
                  수많은 합격 자소서 분석 기반, 직무별 맞춤 제안
                </FeatureDesc>
              </FeatureInner>
            </FeatureCard>

            <FeatureCard>
              <FeatureInner>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="60"
                  height="60"
                  viewBox="0 0 60 60"
                  fill="none"
                >
                  {/* ...SVG 내용 동일 */}
                </svg>
                <FeatureTitle>효율성</FeatureTitle>
                <FeatureDesc>시간 절약, 결과는 정교하게</FeatureDesc>
              </FeatureInner>
            </FeatureCard>
          </Features>
        </Main>
      </PageLayer>
    </>
  );
}
