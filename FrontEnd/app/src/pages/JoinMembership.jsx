import React, { useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import Header from "../components/Header";
import Background from "../components/Background";
// import axios from "axios"; // ⚙️ 나중에 실제 서버 통신 시 사용 (npm install axios)

const Global = createGlobalStyle`
  :root{
    --gap-header-card: 20vh;
    --gap-input: 3.5vh;
    --gap-btn-bottom: 3.2vh;
    --card-w: min(88vw, 36rem);
    --card-p: clamp(1.25rem, 2.5vw, 2rem);
    --card-pt: calc(var(--card-p) / 2);
    --card-px: var(--card-p);
    --card-pb: var(--card-p);
    --gap-page-bottom: 8vh;
    --title-top: calc(var(--card-pt) / 2);
    --radius: 1.25rem;
    --primary: var(--jb-primary, #0f7f90);
    --primary-pressed: color-mix(in oklab, var(--primary) 90%, black);
  }
`;

const Layer = styled.div`
  position: relative;
  z-index: 1;
  min-height: 92vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Card = styled.div`
  margin-top: var(--gap-header-card);
  margin-bottom: var(--gap-page-bottom);
  width: var(--card-w);
  background: #fff;
  border-radius: var(--radius);
  padding: var(--card-pt) var(--card-px) var(--card-pb);
  box-shadow: 0 0.5vh 1.2vh rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: var(--gap-input);
`;

const Title = styled.h2`
  margin: var(--title-top) 0 2vh 0;
  text-align: center;
  font-size: clamp(1.25rem, 2.5vw, 1.6rem);
  font-weight: 700;
`;

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2vh;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: clamp(0.9rem, 2vw, 1rem);
`;

const Row = styled.div`
  display: flex;
  gap: 1vw;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  padding: 0.8rem 1rem;
  font-size: clamp(0.9rem, 1.8vw, 1rem);
  background: #fff;
`;

const Btn = styled.button`
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  padding: 0.8rem 1rem;
  font-size: clamp(0.8rem, 1.6vw, 0.95rem);
  cursor: pointer;
  &:active {
    background: var(--primary-pressed);
  }
`;

const JoinBtn = styled(Btn)`
  border-radius: 0.7rem;
  padding: 1rem;
  margin-top: var(--gap-input);
  font-size: clamp(1rem, 2vw, 1.1rem);
  font-weight: 600;
`;

const LoginLine = styled.div`
  text-align: center;
  margin-top: var(--gap-btn-bottom);
  font-size: clamp(0.9rem, 1.8vw, 1rem);
  a {
    color: var(--primary);
    font-weight: 600;
    text-decoration: none;
    margin-left: 0.3rem;
  }
  a:hover {
    text-decoration: underline;
  }
`;

export default function JoinMembership() {
  /* ✅ 1️⃣ 회원가입 입력값 state */
  const [formData, setFormData] = useState({
    userId: "",      // 사용자 ID (필수)
    password: "",    // 비밀번호 (필수)
    name: "",        // 이름 (필수)
    univ: "",        // 학교 (선택)
    major: "",       // 전공 (선택)
  });

  /* ✅ 2️⃣ 입력값 변경 핸들러 */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ✅ 3️⃣ 가입 버튼 클릭 시 실행할 함수 */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ⚠️ 필수 입력값 검증 (API 명세 기준: userId, password, name 필수)
    if (!formData.userId.trim() || !formData.password.trim() || !formData.name.trim()) {
      alert("아이디, 비밀번호, 이름은 필수 입력 항목입니다.");
      return;
    }

    // ⚙️ 실제 서버 통신 로직 (아직 구현 X)
    // try {
    //   const response = await axios.post("/api/auth/signup", formData, {
    //     headers: { "Content-Type": "application/json" },
    //   });
    //   if (response.status === 201) {
    //     alert("회원가입이 성공적으로 완료되었습니다!");
    //   }
    // } catch (error) {
    //   console.error(error);
    //   alert("회원가입에 실패했습니다. 다시 시도해주세요.");
    // }

    // 💡 위 axios.post는 나중에 백엔드 서버가 연결되면 활성화할 부분입니다.
  };

  return (
    <>
      <Global />
      <Background style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />
      <Header />
      <Layer>
        <Card as="form" onSubmit={handleSubmit}>
          <Title>회원가입</Title>

          {/* ✅ 필수 입력: 사용자 아이디 */}
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

          {/* ✅ 필수 입력: 비밀번호 */}
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

          {/* ✅ 필수 입력: 이름 */}
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

          {/* 🟢 선택 입력: 학교 */}
          <Group>
            <Label>학교</Label>
            <Input
              name="univ"
              value={formData.univ}
              onChange={handleChange}
              placeholder="학교명을 입력해주세요."
            />
          </Group>

          {/* 🟢 선택 입력: 전공 */}
          <Group>
            <Label>전공</Label>
            <Input
              name="major"
              value={formData.major}
              onChange={handleChange}
              placeholder="전공을 입력해주세요."
            />
          </Group>

          {/* ✅ 가입하기 버튼 (submit 시 handleSubmit 실행) */}
          <JoinBtn type="submit">가입하기</JoinBtn>

          <LoginLine>
            계정이 있으신가요? <a href="/login">로그인</a>
          </LoginLine>
        </Card>
      </Layer>
    </>
  );
}
