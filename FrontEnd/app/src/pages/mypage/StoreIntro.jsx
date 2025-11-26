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
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(199, 214, 223, 0.6);
  padding: 28px 28px 32px;
`;

const BoxHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 26px;
`;

const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #000;
`;

const Sub = styled.div`
  font-size: 13px;
  color: #6d7a83;
`;

const NewButton = styled.button`
  background: #00678c;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.15s ease-out;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);

  &:hover {
    background: #04506d;
  }
`;

const CardRow = styled.div`
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
`;

const DocCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const DocThumbnail = styled.div`
  width: 150px;
  height: 210px; /* A4 비율 */
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0 9px 18px rgba(0, 96, 140, 0.28);
  border: 1px solid rgba(0, 103, 140, 0.12);
  position: relative;
  overflow: hidden;

  /* hover 시 버튼 영역 표시 */
  &:hover div.overlay {
    opacity: 1;
    pointer-events: all;
  }
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 103, 140, 0.40) 0%, rgba(0, 109, 148, 0.12) 100%), #FFF;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
`;

const ActionButton = styled.button`
  width: 80px;
  padding: 8px 0;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  color: #fff;
  background: ${({ variant }) =>
    variant === "edit"
      ? "#00678C"
      : variant === "download"
      ? "#00678C"
      : "#9E9E9E"};
  transition: background 0.2s;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);

  &:hover {
    background: ${({ variant }) =>
      variant === "edit"
        ? "#04506D"
        : variant === "download"
        ? "#04506D"
        : "#7C7C7C"};
  }
`;

const DocName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #000;
`;

const DocDate = styled.div`
  font-size: 11.5px;
  color: #5a666d;
`;

export default function StoreIntro() {
  const docs = [
    { id: 1, title: "새문서 1", modified: "2025.01.01" },
    { id: 2, title: "새문서 2", modified: "2025.01.03" },
    { id: 3, title: "새문서 3", modified: "2025.01.05" },
  ];

  return (
    <>
      <Header />
      <Wrap>
        <Container>
          <Box>
            <BoxHeader>
              <TitleGroup>
                <Title>ooo 님의 자소서 보관함</Title>
                <Sub>생성한 자소서를 확인하고 저장하거나, 수정할 수 있어요.</Sub>
              </TitleGroup>
              <NewButton>새 자소서 작성하기</NewButton>
            </BoxHeader>

            <CardRow>
              {docs.map((doc) => (
                <DocCard key={doc.id}>
                  <DocThumbnail>
                    <Overlay className="overlay">
                      <ActionButton variant="edit">수정</ActionButton>
                      <ActionButton variant="download">다운로드</ActionButton>
                      <ActionButton variant="delete">삭제하기</ActionButton>
                    </Overlay>
                  </DocThumbnail>
                  <DocName>{doc.title}</DocName>
                  <DocDate>수정일자: {doc.modified}</DocDate>
                </DocCard>
              ))}
            </CardRow>
          </Box>
        </Container>
      </Wrap>
    </>
  );
}