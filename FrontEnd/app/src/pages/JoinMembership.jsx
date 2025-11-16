import React, { useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import Header from "../components/Header";
import Background from "../components/Background";

const Global = createGlobalStyle`
  :root{
    /* 🔢 전부 px로 고정 */
    --gap-header-card: 90px;      /* 헤더 아래 ~ 카드 위 */
    --gap-input: 25px;            /* 각 입력 그룹 사이 */
    --gap-btn-bottom: 0px;       /* 가입 버튼 ~ 로그인 라인 */
    --gap-page-bottom: 64px;      /* 카드 아래 여백 */

    --card-w: 540px;
    --card-h: 780px;

    --card-p: 40px;               /* 카드 패딩 */
    --card-pt: 40px;
    --card-px: 40px;
    --card-pb: 40px;

    --title-top: 16px;            /* 카드 내부에서 제목 위쪽 여백 */
    --radius: 20px;

    --primary: var(--jb-primary, #0f7f90);
    --primary-pressed: color-mix(in oklab, var(--primary) 90%, black);
  }
`;

const Layer = styled.div`
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Card = styled.div`
  margin-top: var(--gap-header-card);
  margin-bottom: var(--gap-page-bottom);
  width: var(--card-w);
  height: var(--card-h);
  flex-shrink: 0;
  box-sizing: border-box;

  background: #fff;
  border-radius: var(--radius);
  padding: var(--card-pt) var(--card-px) var(--card-pb);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);

  display: flex;
  flex-direction: column;
  gap: var(--gap-input);
`;


const Title = styled.h2`
  margin: var(--title-top) 0 25px 0;
  text-align: center;
  font-size: 24px;
  font-weight: 700;
`;

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 16px;
`;

const Row = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  background: #fff;
`;

const Btn = styled.button`
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  cursor: pointer;
  &:active {
    background: var(--primary-pressed);
  }
`;

const JoinBtn = styled(Btn)`
  border-radius: 12px;
  padding: 14px;
  margin-top: var(--gap-input);
  font-size: 16px;
  font-weight: 600;
`;

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

    if (!formData.userId.trim() || !formData.password.trim() || !formData.name.trim()) {
      alert("아이디, 비밀번호, 이름은 필수 입력 항목입니다.");
      return;
    }

    // 추후 axios.post("/api/auth/signup", formData, ...) 연결
  };

  return (
    <>
      <Global />
      <Background style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />
      <Header />
      <Layer>
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
      </Layer>
    </>
  );
}
