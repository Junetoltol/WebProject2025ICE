// src/pages/self-intro/IntroDownload.jsx
import React from "react";
import styled from "styled-components";
import Header from "../../components/Header";

const Wrap = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    180deg,
    rgba(41, 198, 255, 0.25) 0%,
    rgba(113, 189, 129, 0.25) 100%
  );
`;

const Container = styled.div`
  max-width: 740px;
  margin: 0 auto;
  padding: 20vh 24px 40px;
`;

const Box = styled.div`
  background: #fff;
  border-radius: 14px;
  border: 1px solid rgba(199, 214, 223, 0.6);
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.03);
  padding: 32px 28px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  text-align: center;
`;

const Sub = styled.p`
  margin: -14px 0 0;
  font-size: 13px;
  color: #6d7a83;
  text-align: center;
`;

const PreviewWrap = styled.div`
  width: 280px;
  height: 360px;
  background: #ffffff;
  border-radius: 6px;
  box-shadow: 0 10px 28px rgba(0, 103, 140, 0.35);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: stretch;
`;

const ScrollPaper = styled.div`
  width: 100%;
  background: #fff;
  padding: 18px 14px;
  overflow-y: auto;

  /* 스크롤 스타일 조금만 */
  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 103, 140, 0.4);
    border-radius: 999px;
  }
`;

const FakeText = styled.div`
  height: 680px; /* 미리보기용 더미 높이 */
  background: repeating-linear-gradient(
    to bottom,
    #f4f4f4 0px,
    #f4f4f4 1px,
    #ffffff 1px,
    #ffffff 20px
  );
  border-radius: 4px;
`;

const BtnRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const Btn = styled.button`
  background: #00678c;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 26px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.15s ease-out;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);

  &:hover {
    background: #04506d;
  }
`;

const WideBtn = styled(Btn)`
  margin-top: 4px;
  min-width: 180px;
`;

export default function IntroDownload() {
  return (
    <>
      <Header />
      <Wrap>
        <Container>
          <Box>
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "20px" }}>
              <Title>OOO 님의 자소서가 완성되었어요 !</Title>
              <Sub>word로 다운받아 수정할 수 있어요.</Sub>
            </div>

            <PreviewWrap>
              <ScrollPaper>
                {/* 실제에선 여기에 자소서 내용 map으로 넣으면 됨 */}
                <FakeText />
              </ScrollPaper>
            </PreviewWrap>

            <BtnRow>
              <Btn>word로 다운로드</Btn>
              <Btn>pdf로 다운로드</Btn>
            </BtnRow>

            <WideBtn>보관함에 저장</WideBtn>
          </Box>
        </Container>
      </Wrap>
    </>
  );
}