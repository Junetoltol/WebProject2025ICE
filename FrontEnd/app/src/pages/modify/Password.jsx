import React from "react";
import styled, { createGlobalStyle } from "styled-components";
import { useNavigate } from "react-router-dom";
import Header, { HEADER_H } from "../../components/Header";
import Background from "../../components/Background";

/* 글로벌 색상 (다른 페이지와 통일) */
const Global = createGlobalStyle`
  :root {
    --primary: #00678c;
    --primary-hover: color-mix(in oklab, var(--primary) 85%, black);
    --primary-pressed: color-mix(in oklab, var(--primary) 80%, black);
  }
`;

export default function Password() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // TODO: 비밀번호 변경 API 연동
    alert("비밀번호 변경이 완료되었습니다.");

    // 🔥 비밀번호 변경 후 개인정보 수정 화면으로 이동
    navigate("/modify/PersonInfo");
  };

  return (
    <>
      <Global />
      <Background />
      <Header />

      <PageBody>
        <Card as="form" onSubmit={handleSubmit}>
          <Title>비밀번호 변경</Title>

          <SectionTitle>비밀번호 변경</SectionTitle>

          <FieldGroup>
            <Input
              type="password"
              placeholder="기존 비밀번호 입력"
              autoComplete="current-password"
            />
          </FieldGroup>

          <FieldGroup>
            <Input
              type="password"
              placeholder="새 비밀번호 입력"
              autoComplete="new-password"
            />
          </FieldGroup>

          <FieldGroup>
            <Input
              type="password"
              placeholder="비밀번호 확인"
              autoComplete="new-password"
            />
          </FieldGroup>

          <SaveBtn type="submit">저장하기</SaveBtn>
        </Card>
      </PageBody>
    </>
  );
}

/* ---------- 레이아웃 ---------- */

const PageBody = styled.main`
  position: relative;
  z-index: 10;
  min-height: calc(100vh - ${HEADER_H}px);
  display: flex;
  justify-content: center;

  /* 헤더 90px 아래에서 시작 */
  padding-top: calc(${HEADER_H}px + 90px);

  /* 아래 여백 축소 (기존 120px → 60px) */
  padding-bottom: 90px;
`;

const Card = styled.section`
  width: 540px; 
  height:540px;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  padding: 40px 56px 48px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Title = styled.h2`
  text-align: center;
  margin: 0 0 30px;
  font-size: 22px;
  font-weight: 700;
`;

const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
`;

/* ---------- 입력 ---------- */

const FieldGroup = styled.div`
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  height: 44px;
  border-radius: 10px;
  border: 1px solid #dcdcdc;
  padding: 0 14px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;

  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &::placeholder {
    color: #b5b5b5;
  }

  &:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 1px rgba(0, 103, 140, 0.18);
  }
`;

/* ---------- 버튼 ---------- */

const SaveBtn = styled.button`
  width: 100%;
  height: 44px;
  margin-top: 16px;

  border-radius: 12px;
  background: var(--primary);
  color: #ffffff;
  border: none;
  font-size: 16px;
  font-weight: 700;

  cursor: pointer;

  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.05s ease;

  &:hover {
    background: var(--primary-hover);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }

  &:active {
    background: var(--primary-pressed);
    transform: translateY(1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.18);
  }
`;
