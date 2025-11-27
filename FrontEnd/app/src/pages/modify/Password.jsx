// src/pages/modify/Password.jsx
import React, { useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { useNavigate } from "react-router-dom";
import Header, { HEADER_H } from "../../components/Header";
import Background from "../../components/Background";
import { changePassword } from "../../api/userApi";

/* 글로벌 색상 (다른 페이지와 통일) */
const Global = createGlobalStyle`
  :root {
    --primary: #00678c;
    --primary-hover: color-mix(in oklab, var(--primary) 85%, black);
    --primary-pressed: color-mix(in oklab, var(--primary) 80%, black);
  }
`;

// 백엔드 명세서의 비밀번호 규칙과 동일한 정규식
const PASSWORD_REGEX =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-])[A-Za-z\d!@#$%^&*()_+=\-]{8,}$/;

export default function Password() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [fieldError, setFieldError] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const validate = () => {
    const nextError = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
    let ok = true;

    if (!currentPassword.trim()) {
      nextError.currentPassword = "현재 비밀번호를 입력해주세요.";
      ok = false;
    }

    if (!newPassword.trim()) {
      nextError.newPassword = "새 비밀번호를 입력해주세요.";
      ok = false;
    } else if (!PASSWORD_REGEX.test(newPassword)) {
      nextError.newPassword =
        "비밀번호는 8자 이상, 영문/숫자/특수문자를 각각 1자 이상 포함해야 합니다.";
      ok = false;
    }

    if (!confirmPassword.trim()) {
      nextError.confirmPassword = "비밀번호 확인을 입력해주세요.";
      ok = false;
    } else if (newPassword !== confirmPassword) {
      nextError.confirmPassword = "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.";
      ok = false;
    }

    setFieldError(nextError);
    return ok;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validate()) return;

  try {
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");
    const username =
      localStorage.getItem("username") || localStorage.getItem("userId");

    if (!token) {
      alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
      navigate("/login");
      return;
    }

    if (!username) {
      alert("사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
      navigate("/login");
      return;
    }

    // 🔥 분리한 API 함수 호출
    const data = await changePassword({
      token,
      username,
      currentPassword,
      newPassword,
      confirmPassword,
    });

    alert(data?.message || "비밀번호가 성공적으로 변경되었습니다.");

    // 폼 초기화 & 페이지 이동
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    navigate("/modify/PersonInfo");
  } catch (err) {
    console.error(err);
    if (err.data?.message) {
      // 예: "비밀번호가 틀렸습니다.", "비밀번호가 일치하지 않습니다." 등
      alert(err.data.message);
    } else {
      alert("비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  }
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

          {/* 현재 비밀번호 */}
          <FieldGroup>
            <Input
              type="password"
              placeholder="기존 비밀번호 입력"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setFieldError((prev) => ({
                  ...prev,
                  currentPassword: "",
                }));
              }}
            />
            {fieldError.currentPassword && (
              <ErrorText>{fieldError.currentPassword}</ErrorText>
            )}
          </FieldGroup>

          {/* 새 비밀번호 */}
          <FieldGroup>
            <Input
              type="password"
              placeholder="새 비밀번호 입력"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setFieldError((prev) => ({
                  ...prev,
                  newPassword: "",
                }));
              }}
            />
            {fieldError.newPassword && (
              <ErrorText>{fieldError.newPassword}</ErrorText>
            )}
          </FieldGroup>

          {/* 새 비밀번호 확인 */}
          <FieldGroup>
            <Input
              type="password"
              placeholder="비밀번호 확인"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setFieldError((prev) => ({
                  ...prev,
                  confirmPassword: "",
                }));
              }}
            />
            {fieldError.confirmPassword && (
              <ErrorText>{fieldError.confirmPassword}</ErrorText>
            )}
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

  /* 아래 여백 */
  padding-bottom: 90px;
`;

const Card = styled.section`
  width: 540px;
  height: 540px;
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

const ErrorText = styled.p`
  margin: 4px 0 0;
  font-size: 12px;
  color: #e74c3c;
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
