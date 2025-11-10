import React from "react";
import styled from "styled-components";
import Header from "../../components/Header";
import loadingCharacter from "../../assets/loadingCharacter.png";
const Wrap = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    180deg,
    rgba(41, 198, 255, 0.25) 0%,
    rgba(113, 189, 129, 0.25) 100%
  );
`;

const CenterArea = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 20vh 24px 40px; /* 헤더만큼 아래로 */
  display: flex;
  justify-content: center;
`;

const Card = styled.div`
  width: 540px;
  min-height: 360px;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e3e6eb;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  text-align: center;
`;

const CharImg = styled.img`
  width: 170px;
  height: auto;
`;

const Title = styled.div`
  font-weight: 700;
  font-size: 16px;
  color: #000;
`;

const Sub = styled.div`
  font-size: 13px;
  color: #737171;
`;

export default function IntroLoading() {
  return (
    <Wrap>
      <Header />
      <CenterArea>
        <Card>
          <CharImg src={loadingCharacter} alt="자소서 생성 캐릭터" />
          <Title>맞춤 자소서를 생성 중이에요...</Title>
          <Sub>최대 몇 분의 시간이 소요될 수 있습니다.</Sub>
        </Card>
      </CenterArea>
    </Wrap>
  );
}