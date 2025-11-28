// src/pages/modify/PersonInfo.jsx
import React, { useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import Header, { HEADER_H } from "../../components/Header";
import Background from "../../components/Background";
import { updateUserProfile } from "../../api/userApi";
import { isLoggedIn } from "../../api/auth";

/* 전역 색상 변수 (다른 페이지와 공통) */
const Global = createGlobalStyle`
  :root {
    --primary: #00678c;
    --primary-hover: color-mix(in oklab, var(--primary) 85%, black);
    --primary-pressed: color-mix(in oklab, var(--primary) 80%, black);
  }
`;

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

    // 🔐 로그인 여부 확인
    if (!isLoggedIn()) {
      setErrorMsg("로그인 정보가 없습니다. 다시 로그인 해주세요.");
      navigate("/login");
      return;
    }

    // 간단한 유효성 검사 (이름 정도만 필수로)
    if (!name.trim()) {
      setErrorMsg("이름을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);

      // 🔥 분리한 API 함수 호출 (토큰은 userApi/updateUserProfile 안에서 getAuthHeader로 자동 처리)
      const res = await updateUserProfile({
        name,
        univ,
        major,
      });

      // 성공 메시지 (명세 기본 메시지 사용)
      setSuccessMsg(
        res?.message || "이력 정보가 성공적으로 저장되었습니다."
      );

      // 필요하면 잠시 후 페이지 이동
      // navigate("/");
    } catch (err) {
      console.error(err);
      if (err.data?.message) {
        setErrorMsg(err.data.message);
      } else if (err.message) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("서버와 통신 중 오류가 발생했습니다.");
      }
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

            <Input
              placeholder="학교 이름 입력"
              value={univ}
              onChange={(e) => setUniv(e.target.value)}
              style={{ marginTop: 6 }}  // 기존 InputWrap의 margin-top 보정
            />
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

/* 에러/성공 메시지 */

const ErrorText = styled.p`
  margin: 8px 0 0;
  font-size: 12px;
  color: #e74c3c;
`;

const SuccessText = styled.p`
  margin: 8px 0 0;
  font-size: 12px;
  color: #2ecc71;
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
    box-shadow: none;
  }
`;
