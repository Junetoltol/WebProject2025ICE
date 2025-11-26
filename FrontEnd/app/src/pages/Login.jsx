// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import Header, { HEADER_H } from "../components/Header";
import Background from "../components/Background";

// 🔹 새로 추가: 분리한 API 함수 import
import { login } from "../api/auth";

const Global = createGlobalStyle`
  /* 레이아웃 기본값 초기화 (위쪽 여백 방지) */
  html, body, #root { height: 100%; margin: 0; padding: 0; }
  *, *::before, *::after { box-sizing: border-box; }
  #root { position: relative; isolation: isolate; }
  body { background: transparent; }

  :root{
    --gap-header-card: 90px;
    --gap-title-first: 25px;

    --gap-inputs-btn: 20px;
    --gap-btn-bottom: 10px;

    --card-w: 540px;
    --card-h: 490px;

    --card-p: 40px;
    --radius: 20px;

    --primary: var(--jb-primary, #0f7f90);
    --primary-pressed: color-mix(in oklab, var(--primary) 90%, black);
    --shadow: 0 6px 18px rgba(0,0,0,0.12);
    --field-h: 44px;
  }
`;

export default function Login() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id || !pw) {
      alert("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      // 🔹 API 분리: 실제 요청/토큰 저장은 api/auth.js의 login()이 담당
      const { message } = await login(id, pw);

      alert(message || "로그인에 성공했습니다.");
      navigate("/"); // 성공 후 이동 경로
    } catch (err) {
      console.error(err);
      alert(err.message || "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Global />
      <Background />
      <Header />

      <Page>
        <Card role="region" aria-label="로그인 카드">
          <Title aria-label="Job Buddy">
            <Accent>J</Accent>
            <Rest>ob </Rest>
            <Accent>B</Accent>
            <Rest>uddy</Rest>
          </Title>

          <Subtitle>와 함께, 새로운 시작을 해보세요.</Subtitle>

          <Form onSubmit={handleSubmit}>
            <FieldGroup style={{ marginTop: "var(--gap-title-first)" }}>
              <Label htmlFor="id">아이디</Label>
              <Input
                id="id"
                name="id"
                placeholder="아이디"
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="pw">비밀번호</Label>
              <Input
                id="pw"
                name="pw"
                type="password"
                placeholder="비밀번호"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
              />
            </FieldGroup>

            <Button
              type="submit"
              style={{ marginTop: "var(--gap-inputs-btn)" }}
              disabled={loading}
            >
              {loading ? "로그인 중..." : "로그인"}
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
const Accent = styled.span`
  color: #00678c;
`;
const Rest = styled.span`
  color: #000;
`;

/* 헤더가 fixed이므로, 헤더 높이 + 원하는 간격만큼 상단 패딩 */
const Page = styled.main`
  min-height: 100vh;
  display: grid;
  place-items: start center;
  padding-top: calc(${HEADER_H}px + var(--gap-header-card));
  padding-left: 24px;
  padding-right: 24px;
  padding-bottom: 24px;
`;

const Card = styled.section`
  width: var(--card-w);
  height: var(--card-h);
  padding: var(--card-p);
  border-radius: var(--radius);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: saturate(120%) blur(3px);
  box-shadow: var(--shadow);
  box-sizing: border-box;
`;

const Title = styled.h1`
  font-family: "STCaiyun", system-ui, -apple-system, "Segoe UI", Roboto,
    "Noto Sans KR", sans-serif;
  font-weight: 400;
  line-height: 1.1;
  text-align: center;
  font-size: 40px;
  letter-spacing: 0.8px;
  margin: 0;
`;

const Subtitle = styled.p`
  text-align: center;
  opacity: 0.8;
  margin-top: 12px;
  margin-bottom: 0;
  font-size: 16px;
`;

const Form = styled.form`
  display: grid;
  gap: 20px;
  margin-top: 0;
`;

const FieldGroup = styled.div`
  display: grid;
  gap: 10px;
`;

const Label = styled.label`
  font-size: 16px;
  font-weight: 700;
`;

const Input = styled.input`
  height: var(--field-h);
  padding: 0 16px;
  border: 0;
  outline: 0;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: inset 0 0 0 2px rgba(0, 0, 0, 0.1);
  font-size: 16px;

  &::placeholder {
    opacity: 0.6;
  }

  &:focus {
    box-shadow:
      inset 0 0 0 2px rgba(0, 0, 0, 0.1),
      0 0 0 3px color-mix(in oklab, var(--primary) 25%, white);
  }
`;

const Button = styled.button`
  height: 42px;
  border: 0;
  outline: 0;
  border-radius: 999px;
  background: var(--primary);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.8px;
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.25);
  cursor: pointer;

  &:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 rgba(0, 0, 0, 0.25);
    background: var(--primary-pressed);
  }

  &:disabled {
    opacity: 0.7;
    cursor: default;
    transform: none;
    box-shadow: 0 4px 0 rgba(0, 0, 0, 0.25);
  }
`;

const BottomRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.8);
`;

const CleanLink = styled(Link)`
  color: var(--primary);
  text-decoration: none;
  font-weight: 700;

  &:hover {
    text-decoration: underline;
  }
`;
