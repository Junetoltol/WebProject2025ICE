import React from "react";
import Header from "../components/Header";
import Background from "../components/Background";


import styled from "styled-components";
import homeCharacter from "../assets/homeCharacter.png";
import jobBuddyLogo from "../assets/Job Buddy logo.png";

const Main = styled.main`
background: linear-gradient(
    180deg,
    rgba(41, 198, 255, 0.25) 0%,
    rgba(113, 189, 129, 0.25) 100%
  );
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow-x: hidden;
`;

const Hero = styled.section`
  max-width: 1100px;
  display: grid;
  grid-template-columns: 1.05fr 0.6fr;
  align-items: center;
  gap: 16px;
  padding: 60px 24px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const HeroText = styled.div`
  text-align: center;
`;

const HeroTitle = styled.h1`
  font-size: clamp(32px, 4vw, 40px);
  line-height: 1.1;
  color: #083850;
  margin-bottom: 14px;
  font-weight: 700;
  strong {
    color: #0a6b92;
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
  font-size: 16px;
  color: #1e3c4d;
  margin-bottom: 10px;
`;
const LogoImage = styled.img`
  width: 220px;
  height: auto;
  margin: 8px 0;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1)); 
`;
const Button = styled.button`
  margin-top: 12px;
  background: #0b6a82;
  border: none;
  color: #fff;
  padding: 13px 36px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: 0.15s;
  &:hover {
    background: #095d71;
  }
`;

const HeroImage = styled.img`
  max-width: 310px;
  width: 100%;
  object-fit: contain;
  @media (max-width: 900px) {
    margin: 0 auto;
  }
`;

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
  background: #cde2e8;
  border-radius: 999px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-align: center;
  box-shadow: 0 7px 19px rgba(1, 69, 95, 0.12);
`;

const FeatureTitle = styled.div`
  font-weight: 700;
  color: #1b3542;
`;

const FeatureDesc = styled.div`
  font-size: 12px;
  max-width: 140px;
  color: #243844;
  line-height: 1.3;
`;

export default function Home() {
  return (
    <>
      <Background/>
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
            <Button>자기소개서 생성</Button>
          </HeroText>

          <HeroImage src={homeCharacter} alt="Job Buddy 캐릭터" />
        </Hero>

        <Features>
          <FeatureCard>
            <FeatureTitle>동반자</FeatureTitle>
            <FeatureDesc>
              막막한 문장 작성부터 마지막 다듬기까지 함께!
            </FeatureDesc>
          </FeatureCard>
          <FeatureCard>
            <FeatureTitle>맞춤형</FeatureTitle>
            <FeatureDesc>
              수많은 합격 자소서 분석 기반, 직무별 맞춤 제안
            </FeatureDesc>
          </FeatureCard>
          <FeatureCard>
            <FeatureTitle>효율성</FeatureTitle>
            <FeatureDesc>
              시간 절약, 올라간 완성도
            </FeatureDesc>
          </FeatureCard>
        </Features>
      </Main>
    </>
  );
}
