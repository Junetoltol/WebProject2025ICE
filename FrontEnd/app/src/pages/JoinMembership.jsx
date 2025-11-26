// src/pages/JoinMembership.jsx
import React, { useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import Header, { HEADER_H } from "../components/Header";
import Background from "../components/Background";

/* 전역 변수 (색/간격 통일) */
const Global = createGlobalStyle`
  :root{
    --gap-header-card: 90px;      /* 헤더 아래 ~ 카드 위 */
    --gap-input: 25px;            /* 각 입력 그룹 사이 */
    --gap-btn-bottom: 0px;        /* 가입 버튼 ~ 로그인 라인 */
    --gap-page-bottom: 120px;     /* 카드 아래 여백 */

    --card-w: 540px;

    --primary: var(--jb-primary, #00678c);
    --primary-hover: color-mix(in oklab, var(--primary) 85%, black);
    --primary-pressed: color-mix(in oklab, var(--primary) 80%, black);
  }
`;

/* 페이지 레이아웃: 헤더 높이 + 90px 만큼 띄우기 */
const PageBody = styled.main`
  position: relative;
  z-index: 10;
  min-height: calc(100vh - ${HEADER_H}px);
  display: flex;
  justify-content: center;
  padding-top: calc(${HEADER_H}px + var(--gap-header-card));
  padding-bottom: var(--gap-page-bottom);
`;

/* 중앙 카드 (개인정보 수정이랑 통일) */
const Card = styled.section`
  width: var(--card-w);
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  padding: 40px 56px 48px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  gap: var(--gap-input);
`;

const Title = styled.h2`
  margin: 0 0 32px;
  text-align: center;
  font-size: 22px;
  font-weight: 700;
`;

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 14px;
`;

/* 인풋 공통 스타일 (포커스 시 테두리 색/두께 느낌 통일) */
const Input = styled.input`
  flex: 1;
  border-radius: 10px;
  border: 1px solid #dcdcdc;
  padding: 12px 14px;
  font-size: 14px;
  box-sizing: border-box;
  background: #ffffff;
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

/* 버튼 공통 – hover/active + 그림자 */
const BtnBase = styled.button`
  width: 100%;
  border: none;
  border-radius: 12px;
  background: var(--primary);
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  padding: 14px;
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

/* 가입 버튼 */
const JoinBtn = styled(BtnBase)`
  margin-top: var(--gap-input);
`;

/* 로그인 라인 */
const LoginLine = styled.div`
  text-align: center;
  margin-top: var(--gap-btn-bottom);
  font-size: 14px;

  a {
    color: var(--primary);
    font-weight: 600;
    text-decoration: none;
    margin-left: 4px;
  }

  a:hover {
    text-decoration: underline;
  }
`;

export default function JoinMembership() {
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
    name: "",
    univ: "",
    major: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.userId.trim() ||
      !formData.password.trim() ||
      !formData.name.trim()
    ) {
      alert("아이디, 비밀번호, 이름은 필수 입력 항목입니다.");
      return;
    }

    // 추후 axios.post("/api/auth/signup", formData, ...) 연결
  };

  return (
    <>
      <Global />
      <Background />
      <Header />

      <PageBody>
        <Card as="form" onSubmit={handleSubmit}>
          <Title>회원가입</Title>

          <Group>
            <Label>아이디 *</Label>
            <Input
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              placeholder="6~12자의 영문/숫자 조합"
              required
            />
          </Group>

          <Group>
            <Label>비밀번호 *</Label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="8자 이상, 영문/숫자/특수문자 포함"
              required
            />
          </Group>

          <Group>
            <Label>이름 *</Label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="실명을 입력해주세요."
              required
            />
          </Group>

          <Group>
            <Label>학교</Label>
            <Input
              name="univ"
              value={formData.univ}
              onChange={handleChange}
              placeholder="학교명을 입력해주세요."
            />
          </Group>

          <Group>
            <Label>전공</Label>
            <Input
              name="major"
              value={formData.major}
              onChange={handleChange}
              placeholder="전공을 입력해주세요."
            />
          </Group>

          <JoinBtn type="submit">가입하기</JoinBtn>

          <LoginLine>
            계정이 있으신가요? <a href="/login">로그인</a>
          </LoginLine>
        </Card>
      </PageBody>
    </>
  );
}
