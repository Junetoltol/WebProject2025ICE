// src/pages/Login.jsx
import React from "react";
import { Link } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import Header, { HEADER_H } from "../components/Header";
import Background from "../components/Background";

const Global = createGlobalStyle`
  /* 레이아웃 기본값 초기화 (위쪽 여백 방지) */
  html, body, #root { height: 100%; margin: 0; padding: 0; }
  *, *::before, *::after { box-sizing: border-box; }
  #root { position: relative; isolation: isolate; } /* z-index 컨텍스트 안정화 */
  body { background: transparent; }

  :root{
    /* 스크린샷의 간격값을 비율로 변환 (px 금지) */
    --gap-header-card: 12vh;  /* ≈ 90px */
    --gap-title-first: 3.5vh; /* ≈ 25px */
    --gap-inputs-btn: 5.5vh;  /* ≈ 49px */
    --gap-btn-bottom: 4vh;    /* ≈ 30px */

    --card-w: min(88vw, 36rem);
    --card-p: clamp(1.25rem, 2.5vw, 2rem);
    --radius: 1.25rem;

    --primary: var(--jb-primary, #0f7f90);
    --primary-pressed: color-mix(in oklab, var(--primary) 90%, black);
    --shadow: 0 0.4rem 1.2rem rgba(0 0 0 / 0.12);
    --field-h: 2.75rem;
  }
`;

export default function Login() {
  return (
    <>
      <Global />
      {/* 화면 전체 고정 배경: children 없음 */}
      <Background />
      {/* 상단 고정 헤더 */}
      <Header />

      {/* 페이지 콘텐츠 */}
      <Page>
        <Card role="region" aria-label="로그인 카드">
          <Title aria-label="Job Buddy">
            <Accent>J</Accent>
            <Rest>ob </Rest>
            <Accent>B</Accent>
            <Rest>uddy</Rest>
          </Title>

          <Subtitle>와 함께, 새로운 시작을 해보세요.</Subtitle>

          <Form>
            <FieldGroup style={{ marginTop: "var(--gap-title-first)" }}>
              <Label htmlFor="id">아이디</Label>
              <Input id="id" name="id" placeholder="아이디" />
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="pw">비밀번호</Label>
              <Input id="pw" name="pw" type="password" placeholder="비밀번호" />
            </FieldGroup>

            <Button style={{ marginTop: "var(--gap-inputs-btn)" }}>
              로그인
            </Button>

            <BottomRow style={{ marginTop: "var(--gap-btn-bottom)" }}>
              <span>아직 회원이 아니신가요?</span>
              <CleanLink to="/join">회원가입</CleanLink>
            </BottomRow>
          </Form>
        </Card>
      </Page>
    </>
  );
}

/* 색상 조합 */
const Accent = styled.span` color: #00678c; `;
const Rest   = styled.span` color: #000; `;

/* 헤더가 fixed이므로, 헤더 높이 + 원하는 간격만큼 상단 패딩 */
const Page = styled.main`
  min-height: 100dvh;
  display: grid;
  place-items: start center;
  padding-top: calc(${HEADER_H}px + var(--gap-header-card));
  padding-left: clamp(12px, 3vw, 32px);
  padding-right: clamp(12px, 3vw, 32px);
  padding-bottom: 24px;
`;

const Card = styled.section`
  width: var(--card-w);
  padding: var(--card-p);
  border-radius: var(--radius);
  background: rgba(255 255 255 / 0.92);
  backdrop-filter: saturate(120%) blur(0.2rem);
  box-shadow: var(--shadow);
`;

const Title = styled.h1`
  font-family: "STCaiyun", system-ui, -apple-system, "Segoe UI", Roboto,
    "Noto Sans KR", sans-serif;
  font-weight: 400;
  line-height: 1.1;
  text-align: center;
  /* clamp(min, preferred, max) — 순서 수정 */
  font-size: clamp(2.4rem, 3.2vw, 3rem);
  letter-spacing: 0.02em;
`;

const Subtitle = styled.p`
  text-align: center;
  opacity: 0.8;
  margin-top: 0.75rem;
  font-size: clamp(0.9rem, 1.8vw, 1rem);
`;

const Form = styled.form`
  display: grid;
  gap: 1.2rem; /* 필드 사이 기본 간격(비율 기반 rem) */
`;

const FieldGroup = styled.div`
  display: grid;
  gap: 0.6rem;
`;

const Label = styled.label`
  font-size: clamp(0.9rem, 1.6vw, 1rem);
  font-weight: 700;
`;

const Input = styled.input`
  height: var(--field-h);
  padding: 0 1rem;
  border: 0;
  outline: 0;
  border-radius: 0.7rem;
  background: rgba(255 255 255 / 0.9);
  box-shadow: inset 0 0 0 0.12rem rgba(0 0 0 / 0.1);
  font-size: 1rem;

  &::placeholder { opacity: 0.6; }

  &:focus {
    box-shadow:
      inset 0 0 0 0.12rem rgba(0 0 0 / 0.1),
      0 0 0 0.18rem color-mix(in oklab, var(--primary) 25%, white);
  }
`;

const Button = styled.button`
  height: calc(var(--field-h) * 0.95);
  border: 0;
  outline: 0;
  border-radius: 999rem;
  background: var(--primary);
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  box-shadow: 0 0.25rem 0 rgba(0 0 0 / 0.25);
  cursor: pointer;

  &:active {
    transform: translateY(0.15rem);
    box-shadow: 0 0.12rem 0 rgba(0 0 0 / 0.25);
    background: var(--primary-pressed);
  }
`;

const BottomRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.6rem;
  font-size: clamp(0.9rem, 1.6vw, 1rem);
  color: rgba(0 0 0 / 0.8);
`;

const CleanLink = styled(Link)`
  color: var(--primary);
  text-decoration: none;
  font-weight: 700;

  &:hover { text-decoration: underline; }
`;
