// src/pages/modify/PersonInfo.jsx
import React, { useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import Header, { HEADER_H } from "../../components/Header";
import Background from "../../components/Background";

/* 전역 색상 변수 (다른 페이지와 공통) */
const Global = createGlobalStyle`
  :root {
    --primary: #00678c;
    --primary-hover: color-mix(in oklab, var(--primary) 85%, black);
    --primary-pressed: color-mix(in oklab, var(--primary) 80%, black);
  }
`;

/* 돋보기 아이콘 */
const SearchSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
  >
    <path
      d="M5.62119 11.2418C6.86837 11.2415 8.07962 10.824 9.06206 10.0558L12.1509 13.1444L13.1444 12.151L10.0556 9.06227C10.8243 8.07979 11.2421 6.86833 11.2424 5.62089C11.2424 2.52167 8.72057 0 5.62119 0C2.52181 0 0 2.52167 0 5.62089C0 8.7201 2.52181 11.2418 5.62119 11.2418ZM5.62119 1.40522C7.94625 1.40522 9.83708 3.29595 9.83708 5.62089C9.83708 7.94583 7.94625 9.83655 5.62119 9.83655C3.29612 9.83655 1.4053 7.94583 1.4053 5.62089C1.4053 3.29595 3.29612 1.40522 5.62119 1.40522Z"
      fill="#737171"
    />
  </svg>
);

export default function PersonInfo() {
  // ====== 상태 관리 (이름 / 학교 / 전공 + 에러/성공 메시지) ======
  const [name, setName] = useState("");
  const [univ, setUniv] = useState("");
  const [major, setMajor] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const navigate = useNavigate();

  // ====== 저장하기 버튼 클릭 핸들러 ======
  const handleSave = async () => {
    if (loading) return;

    setErrorMsg("");
    setSuccessMsg("");

    // 🔐 로그인 시 localStorage에 저장한 토큰 키와 맞추기 (Login.jsx: authToken)
    const token = localStorage.getItem("authToken");

    if (!token) {
      setErrorMsg("로그인 정보가 없습니다. 다시 로그인 해주세요.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/users/me/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          // Login에서 이미 "Bearer xxx" 형태로 저장했으므로 그대로 사용
          Authorization: token,
        },
        body: JSON.stringify({
          name,
          univ,
          major,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          data?.message ||
          (res.status === 401
            ? "인증 정보가 유효하지 않습니다."
            : "입력 값의 형식이 올바르지 않습니다.");
        setErrorMsg(msg);
        return;
      }

      // 성공 메시지 (명세서 기본 메시지 사용)
      setSuccessMsg(
        data?.message || "이력 정보가 성공적으로 저장되었습니다."
      );

      // 잠깐 메시지 보여준 뒤 이동하고 싶으면 setTimeout 써도 됨
      navigate("/");
    } catch (err) {
      console.error(err);
      setErrorMsg("서버와 통신 중 오류가 발생했습니다.");
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
        <Card>
          <Title>개인정보 수정</Title>

          {/* 이름 */}
          <Field>
            <Label>이름</Label>
            <Input
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          {/* 아이디 (백엔드 연동 전이라 비활성화 인풋만 두기) */}
          <Field style={{ marginTop: 25 }}>
            <Label>아이디</Label>
            <Input placeholder="아이디" disabled />
          </Field>

          {/* 비밀번호 변경하기 (회색 버튼) */}
          <ButtonLink to="/modify/Password">
            <GreyBtn type="button">비밀번호 변경하기</GreyBtn>
          </ButtonLink>

          {/* 학력 */}
          <Field style={{ marginTop: 26 }}>
            <LabelRow>
              <Label>학력</Label>
              <SubText>자기소개서 작성 시 활용됩니다.</SubText>
            </LabelRow>

            <InputWrap>
              <Input
                placeholder="학교 검색"
                style={{ paddingRight: 38 }}
                value={univ}
                onChange={(e) => setUniv(e.target.value)}
              />
              <SearchIcon type="button">
                <SearchSvg />
              </SearchIcon>
            </InputWrap>
          </Field>

          {/* 전공 */}
          <Field style={{ marginTop: 14 }}>
            <Input
              placeholder="전공 입력"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
            />
          </Field>

          {/* 에러/성공 메시지 */}
          {errorMsg && <ErrorText>{errorMsg}</ErrorText>}
          {successMsg && <SuccessText>{successMsg}</SuccessText>}

          {/* 저장하기 (파란 버튼 – 로그인/회원가입과 동일 스타일) */}
          <SaveBtn type="button" onClick={handleSave} disabled={loading}>
            {loading ? "저장 중..." : "저장하기"}
          </SaveBtn>
        </Card>
      </PageBody>
    </>
  );
}

/* ===== 레이아웃 / 카드 ===== */

const PageBody = styled.main`
  position: relative;
  z-index: 10;
  min-height: calc(100vh - ${HEADER_H}px);
  display: flex;
  justify-content: center;
  padding-top: calc(${HEADER_H}px + 90px); /* 헤더에서 90px 아래 */
  padding-bottom: 120px;
`;

const Card = styled.section`
  width: 540px; /* 로그인 / 회원가입과 동일 */
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  padding: 40px 56px 48px;
  box-sizing: border-box;
`;

const Title = styled.h2`
  text-align: center;
  margin: 0 0 32px;
  font-size: 22px;
  font-weight: 700;
`;

/* ===== 필드 / 라벨 ===== */

const Field = styled.div`
  width: 100%;
`;

const LabelRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
`;

const Label = styled.span`
  font-size: 14px;
  font-weight: 600;
`;

const SubText = styled.span`
  font-size: 11px;
  color: #777;
`;

/* ===== 인풋 공통 (로그인/회원가입과 통일) ===== */

const Input = styled.input`
  width: 100%;
  height: 44px; /* 로그인/회원가입 인풋 높이와 동일 */
  border-radius: 10px;
  border: 1px solid #dcdcdc;
  padding: 0 14px;
  font-size: 14px;
  box-sizing: border-box;
  background: ${(props) => (props.disabled ? "#f2f2f2" : "#ffffff")};
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

/* 학교 검색 인풋 + 돋보기 */

const InputWrap = styled.div`
  position: relative;
  width: 100%;
  margin-top: 6px;
`;

const SearchIcon = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
`;

/* ===== 버튼 공통 스타일 (로그인/회원가입과 느낌 통일) ===== */

const ButtonLink = styled(Link)`
  display: block;
  width: 100%;
  text-decoration: none;
`;

/* 회색 버튼 (비밀번호 변경하기) – 크기/폰트는 SaveBtn과 동일하게 맞춤 */
const GreyBtn = styled.button`
  width: 100%;
  height: 44px;
  margin-top: 18px;
  border-radius: 12px;
  background: #6f6f6f;
  color: #ffffff;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;

  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.05s ease;

  &:hover {
    background: #555555;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }

  &:active {
    background: #444444;
    transform: translateY(1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.18);
  }
`;

/* 파란 버튼 (저장하기) – 로그인/회원가입 버튼과 동일 스타일 */

const SaveBtn = styled.button`
  width: 100%;
  height: 44px;
  margin-top: 32px;
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

  &:disabled {
    opacity: 0.7;
    cursor: default;
    transform: none;
  }
`;

/* 에러 / 성공 메시지 */
const ErrorText = styled.p`
  margin-top: 16px;
  margin-bottom: 0;
  font-size: 13px;
  color: #d93025;
`;

const SuccessText = styled.p`
  margin-top: 16px;
  margin-bottom: 0;
  font-size: 13px;
  color: #0b6f8a;
`;
