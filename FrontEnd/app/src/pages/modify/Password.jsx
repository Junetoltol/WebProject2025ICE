// src/pages/modify/Password.jsx
import React, { useState } from "react";
import styled from "styled-components";
import Header, { HEADER_H } from "../../components/Header";
import Background from "../../components/Background";

export default function Password() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");        // 성공/에러 메세지
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // 1단계: 프론트 단에서 간단한 검사
    if (!currentPassword || !newPassword || !confirmPassword) {
      setIsError(true);
      setMessage("모든 칸을 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setIsError(true);
      setMessage("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    // 필요하면 정규식으로 새 비밀번호 규칙 체크
    const pwRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-])[A-Za-z\d!@#$%^&*()_+=\-]{8,}$/;
    if (!pwRegex.test(newPassword)) {
      setIsError(true);
      setMessage(
        "비밀번호는 8자 이상, 영문/숫자/특수문자를 각각 1자 이상 포함해야 합니다."
      );
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("accessToken"); // 토큰 key는 프로젝트에 맞게 변경
      if (!token) {
        setIsError(true);
        setMessage("로그인이 필요합니다.");
        return;
      }

      const res = await fetch("/api/users/me/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // username은 백엔드에서 필요하다면 로그인 시 저장해 두었다가 꺼내 쓰면 됨
          username: localStorage.getItem("username") || "",
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.code !== 200) {
        setIsError(true);
        setMessage(data.message || "비밀번호 변경에 실패했습니다.");
        return;
      }

      setIsError(false);
      setMessage("비밀번호가 성공적으로 변경되었습니다.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage("서버와 통신 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Background />

      <PageBody>
        <Card>
          <Title>비밀번호 변경</Title>

          <Form onSubmit={handleSubmit}>
            <FieldTitle>비밀번호 변경</FieldTitle>

            <Input
              type="password"
              placeholder="기존 비밀번호 입력"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="새 비밀번호 입력"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {/* ✅ 항상 일정 높이를 차지하는 경고 영역 */}
            <MessageArea>
              {message && <Message $error={isError}>{message}</Message>}
            </MessageArea>

            <SaveButton type="submit" disabled={loading}>
              {loading ? "저장 중..." : "저장하기"}
            </SaveButton>
          </Form>
        </Card>
      </PageBody>
    </>
  );
}

/* ---------- styled-components ONLY ---------- */

// Header는 position: fixed 라고 가정
// 헤더 높이(HEADER_H) + 90px 만큼 아래에서 카드가 시작하도록 패딩 줌
const PageBody = styled.main`
  min-height: 100vh;
  padding-top: ${HEADER_H + 90}px;
  display: flex;
  justify-content: center;
  align-items: flex-start;

  position: relative;
  z-index: 1; /* Background보다 위로 */
`;

// 흰 상자
const Card = styled.section`
  width: 540px;
  height: 460px; /* 밑부분 여유 조금 더 줌 (원래 405) */
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);

  display: flex;
  flex-direction: column;
  align-items: center;

  /* 아래쪽 패딩을 크게 줘서 버튼 자리를 미리 확보 */
  padding: 40px 60px 96px;
  box-sizing: border-box;

  position: relative; /* ✅ SaveButton absolute 기준 */
  z-index: 2;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 32px;
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FieldTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  height: 40px;
  border-radius: 6px;
  border: 1px solid #dddddd;
  padding: 0 12px;
  font-size: 14px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #0f7f90;
    box-shadow: 0 0 0 1px rgba(15, 127, 144, 0.3);
  }
`;

/* 경고문/안내문이 없어도 항상 일정 높이 차지 */
const MessageArea = styled.div`
  min-height: 32px; /* 두 줄까지는 높이 변동 없음 */
  margin-top: 4px;
`;

const Message = styled.p`
  font-size: 13px;
  line-height: 1.4;
  color: ${(p) => (p.$error ? "#d94141" : "#0f7f90")};
`;

/* ✅ 카드 기준으로 x,y 좌표를 고정하는 버튼 */
const SaveButton = styled.button`
  position: absolute;
  left: 50%;
  bottom: 40px; /* 버튼을 조금 더 아래로 */
  transform: translateX(-50%);

  /* Card 안쪽 너비(패딩 60px씩 제외) */
  width: calc(100% - 120px);
  height: 40px;

  border-radius: 999px;
  border: none;
  background-color: #0f7f90;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.2);

  &:active {
    transform: translate(-50%, 1px);
    box-shadow: 0 3px 0 rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.7;
    cursor: default;
    box-shadow: none;
  }
`;
