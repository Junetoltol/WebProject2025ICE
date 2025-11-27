// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import Header, { HEADER_H } from "../components/Header";
import Background from "../components/Background";

// 🔹 새로 추가: 분리한 API 함수 import
// ../api/auth에서는 예를 들어 이런 식으로 구현돼 있다고 가정:
// export async function login({ username, password }) { ... }
import { login } from "../api/auth";

/* 전역 레이아웃 & 색상 변수 */
const Global = createGlobalStyle`
  html, body, #root { height: 100%; margin: 0; padding: 0; }
  *, *::before, *::after { box-sizing: border-box; }
  body { background: transparent; }

  :root {
    --gap-header-card: 90px;      /* 헤더 아래 ~ 카드 위 간격 */
    --gap-page-bottom: 120px;

    --card-w: 540px;

    --primary: var(--jb-primary, #00678c);
    --primary-hover: color-mix(in oklab, var(--primary) 85%, black);
    --primary-pressed: color-mix(in oklab, var(--primary) 80%, black);
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
      // 🟢 분리한 API 함수만 사용
      // ../api/auth.js 에서 login({ username, password })가
      // JSON( { status, message, data } )을 반환한다고 가정
      const json = await login({ username: id, password: pw });

      if (!json) {
        throw new Error("서버 응답이 없습니다.");
      }

      const { status, message, data } = json;

      if (status === 200 && data) {
        const { tokenType, accessToken } = data;

        // 🔐 토큰 저장 (나중에 Authorization 헤더에 사용)
        const authToken = `${tokenType} ${accessToken}`; // "Bearer xxxxxx"
        localStorage.setItem("authToken", authToken);

        alert(message || "로그인에 성공했습니다.");
        navigate("/"); // 로그인 성공 후 이동할 페이지
      } else {
        alert(message || "아이디 또는 비밀번호가 일치하지 않습니다.");
      }
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

      <PageBody>
        <Card role="region" aria-label="로그인 카드">
          {/* 로고 텍스트 */}
          <LogoTitle aria-label="Job Buddy">
            <Accent>J</Accent>
            <Rest>ob </Rest>
            <Accent>B</Accent>
            <Rest>uddy</Rest>
          </LogoTitle>

          <Subtitle>와 함께, 새로운 시작을 해보세요.</Subtitle>

          <Form onSubmit={handleSubmit}>
            <FieldGroup>
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

            <LoginBtn type="submit" disabled={loading}>
              {loading ? "로그인 중..." : "로그인"}
            </LoginBtn>

            <BottomRow>
              <span>아직 회원이 아니신가요?</span>
              <CleanLink to="/join">회원가입</CleanLink>
            </BottomRow>
          </Form>
        </Card>
      </PageBody>
    </>
  );
}

/* ====== Layout / Card ====== */

const PageBody = styled.main`
  position: relative;
  z-index: 10;
  min-height: calc(100vh - ${HEADER_H}px);
  display: flex;
  justify-content: center;
  padding-top: calc(${HEADER_H}px + var(--gap-header-card)); /* 헤더 + 90px */
  padding-bottom: var(--gap-page-bottom);
`;

const Card = styled.section`
  width: var(--card-w);
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  padding: 40px 56px 48px;
  box-sizing: border-box;
`;

/* ====== Text / Logo ====== */

const LogoTitle = styled.h1`
  font-family: "STCaiyun", system-ui, -apple-system, "Segoe UI", Roboto,
    "Noto Sans KR", sans-serif;
  font-weight: 400;
  line-height: 1.1;
  text-align: center;
  font-size: 40px;
  letter-spacing: 0.8px;
  margin: 0;
`;

const Accent = styled.span`
  color: #00678c;
`;

const Rest = styled.span`
  color: #000000;
`;

const Subtitle = styled.p`
  text-align: center;
  margin-top: 12px;
  margin-bottom: 24px;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.8);
`;

/* ====== Form & Inputs ====== */

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
`;

const Input = styled.input`
  height: 44px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid #dcdcdc;
  background: #ffffff;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &::placeholder {
    color: #b5b5b5;
  }

  &:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 1px rgba(0, 103, 140, 0.18);
  }
`;

/* ====== Buttons / Bottom ====== */

const BtnBase = styled.button`
  width: 100%;
  border: none;
  border-radius: 12px;
  background: var(--primary);
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  padding: 12px 0;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.05s ease;

  &:hover:not(:disabled) {
    background: var(--primary-hover);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }

  &:active:not(:disabled) {
    background: var(--primary-pressed);
    transform: translateY(1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.18);
  }

  &:disabled {
    opacity: 0.7;
    cursor: default;
  }
`;

const LoginBtn = styled(BtnBase)``;

const BottomRow = styled.div`
  margin-top: 12px;
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
