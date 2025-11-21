import React from "react";
import Header, { HEADER_H } from "../components/Header";
import Background from "../components/Background";

import styled from "styled-components";
import homeCharacter from "../assets/homeCharacter.png";
import jobBuddyLogo from "../assets/Job Buddy logo.png";

const PageLayer = styled.div`
  position: relative;
  z-index: 1;   /* 배경보다 항상 위 */
  width: 100%;
  min-height: 100vh;
`;

const Main = styled.main`
  position: relative;
  z-index: 1;  /* 배경(0)보다 앞으로 */

  padding-top: ${HEADER_H}px; /* 고정 헤더만큼 아래로 밀기 */

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
  background: #006D944D;
  border-radius: 999px;
  height: 180px;
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
              <Button>자기소개서 생성</Button>
            </HeroText>

            <HeroImage src={homeCharacter} alt="Job Buddy 캐릭터" />
          </Hero>

          <Features>
            <FeatureCard>
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="none">
<path d="M47.5583 0C50.0007 0 52.179 2.61967 52.179 6.13858C52.179 9.67004 50.0007 12.2772 47.5583 12.2772C45.1158 12.2772 42.9375 9.67004 42.9375 6.13858C42.9375 2.61967 45.1158 0 47.5583 0ZM30.0125 0C32.4417 0 34.6333 2.61967 34.6333 6.13858C34.6333 9.67004 32.4417 12.2772 30.0125 12.2772C27.5701 12.2772 25.3786 9.67004 25.3786 6.13858C25.3786 2.61967 27.5701 0 30.0125 0ZM12.4536 0C14.896 0 17.0744 2.61967 17.0744 6.13858C17.0744 9.67004 14.896 12.2772 12.4536 12.2772C10.0112 12.2772 7.82094 9.67004 7.82094 6.13858C7.82094 2.61967 10.0112 0 12.4536 0ZM30.0125 15.2049C38.4619 15.4838 45.5911 15.4838 54.1461 15.7905C58.2256 18.2721 60.1135 30.9871 59.9947 35.4066L57.6711 37.8743C56.6546 31.9072 55.374 23.9465 53.2484 22.1759V34.3889L53.7897 60H50.8588L48.654 34.2495H46.2776L44.0729 60H41.1288L41.6833 34.3889L40.6271 22.0504H36.7589L35.8083 34.3471L36.3628 59.9582H33.4187L31.2007 34.2076H28.8243L26.6064 59.9582H23.6755L24.23 34.3471L23.2662 22.0504H19.398L18.3418 34.3889L18.8963 60H15.9522L13.7474 34.2495H11.371L9.14116 60H6.21027L6.76477 34.3889V22.1759C4.62601 23.9465 3.3454 31.9072 2.32883 37.8743L0.00523836 35.4066C-0.113581 30.9871 1.78754 18.2721 5.85381 15.7905C14.4339 15.4838 21.5631 15.4838 30.0125 15.2049Z" fill="black"/>
</svg>
              <FeatureTitle>동반자</FeatureTitle>
              <FeatureDesc>
                막막한 첫 문장부터 마지막 다듬기까지 함께!
              </FeatureDesc>
            </FeatureCard>
            <FeatureCard>
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="none">
<path d="M27.5 30C27.5 30.663 27.7634 31.2989 28.2322 31.7678C28.7011 32.2366 29.337 32.5 30 32.5C30.663 32.5 31.2989 32.2366 31.7678 31.7678C32.2366 31.2989 32.5 30.663 32.5 30C32.5 29.337 32.2366 28.7011 31.7678 28.2322C31.2989 27.7634 30.663 27.5 30 27.5C29.337 27.5 28.7011 27.7634 28.2322 28.2322C27.7634 28.7011 27.5 29.337 27.5 30Z" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M29.8418 17.3361C27.3695 17.3361 24.9528 18.0692 22.8972 19.4428C20.8416 20.8163 19.2394 22.7685 18.2933 25.0526C17.3472 27.3367 17.0997 29.85 17.582 32.2748C18.0643 34.6995 19.2548 36.9268 21.003 38.675C22.7511 40.4231 24.9784 41.6136 27.4032 42.0959C29.8279 42.5783 32.3413 42.3307 34.6253 41.3846C36.9094 40.4385 38.8617 38.8364 40.2352 36.7807C41.6087 34.7251 42.3418 32.3084 42.3418 29.8361" stroke="black" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M32.3418 7.47361C27.707 6.95363 23.0251 7.8868 18.9438 10.144C14.8626 12.4013 11.5836 15.871 9.56045 20.0733C7.53733 24.2755 6.87008 29.0026 7.651 33.6007C8.43191 38.1988 10.6224 42.4405 13.9194 45.7392C17.2165 49.0379 21.4572 51.2306 26.0548 52.0138C30.6525 52.797 35.3799 52.1322 39.5832 50.1112C43.7865 48.0902 47.2579 44.8129 49.5172 40.7328C51.7765 36.6526 52.712 31.9712 52.1943 27.3361" stroke="black" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M37.3418 14.8361V22.3361H44.8418L52.3418 14.8361H44.8418V7.33612L37.3418 14.8361Z" stroke="black" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M37.3418 22.3361L29.8418 29.8361" stroke="black" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
              <FeatureTitle>맞춤형</FeatureTitle>
              <FeatureDesc>
                수많은 합격 자소서 분석 기반, 직무별 맞춤 제안
              </FeatureDesc>
            </FeatureCard>
            <FeatureCard>
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="none">
<g clip-path="url(#clip0_121_200)">
<path d="M36.725 5.52502L10.825 28.725C9.22501 30.175 10.125 32.85 12.275 33.05L32.5 35L20.375 51.9C19.825 52.675 19.9 53.75 20.575 54.425C21.325 55.175 22.5 55.2 23.275 54.475L49.175 31.275C50.775 29.825 49.875 27.15 47.725 26.95L27.5 25L39.625 8.10002C40.175 7.32502 40.1 6.25002 39.425 5.57502C39.0716 5.21406 38.5904 5.00651 38.0852 4.99716C37.5801 4.9878 37.0916 5.17739 36.725 5.52502Z" fill="black"/>
</g>
<defs>
<clipPath id="clip0_121_200">
<rect width="60" height="60" fill="white"/>
</clipPath>
</defs>
</svg>
              <FeatureTitle>효율성</FeatureTitle>
              <FeatureDesc>시간 절약, 결과는 정교하게</FeatureDesc>
            </FeatureCard>
          </Features>
        </Main>
      </PageLayer>
    </>
  );
}
