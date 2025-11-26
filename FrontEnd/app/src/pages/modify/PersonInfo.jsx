// src/pages/modify/PersonInfo.jsx
import React, { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom"; // ★ useNavigate 추가
import Header from "../../components/Header";
import Background from "../../components/Background";

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
  const handleSave = async (e) => {
    e.preventDefault(); // Link의 기본 이동 막기
    if (loading) return;

    setErrorMsg("");
    setSuccessMsg("");

    // ★ 프로젝트에서 사용하는 토큰 키 이름에 맞춰 수정하면 됨
    const token = localStorage.getItem("accessToken");

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
          Authorization: `Bearer ${token}`, // Bearer {JWT}
        },
        body: JSON.stringify({
          name: name,
          univ: univ,
          major: major,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        // 명세서에 나온 에러 메시지 형식 반영
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

      // 저장 성공 시 Home으로 이동 (기존 Link 동작 유지)
      navigate("/Home");
    } catch (err) {
      setErrorMsg("서버와 통신 중 오류가 발생했습니다.");
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

          {/* 아이디 */}
          <Field style={{ marginTop: "25px" }}>
            <Label>아이디</Label>
            <Input placeholder="아이디" disabled />
          </Field>

          {/* 비밀번호 변경하기 → /modify/Password */}
          <ButtonLink to="/modify/Password">
            <PasswordBtn>비밀번호 변경하기</PasswordBtn>
          </ButtonLink>

          {/* 학력 */}
          <Field style={{ marginTop: "25px" }}>
            <Label>
              학력
              <SubText>자기소개서 작성 시 활용합니다.</SubText>
            </Label>

            <InputWrap>
              <Input
                placeholder="학교 검색"
                value={univ}
                onChange={(e) => setUniv(e.target.value)}
              />
              <SearchIcon>🔍</SearchIcon>
            </InputWrap>
          </Field>

          {/* 전공 입력 */}
          <Field style={{ marginTop: "15px" }}>
            <Input
              placeholder="전공 입력"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
            />
          </Field>

          {/* 에러 / 성공 메시지 */}
          {errorMsg && <ErrorText>{errorMsg}</ErrorText>}
          {successMsg && <SuccessText>{successMsg}</SuccessText>}

          {/* 저장하기 → /Home (API 호출 후 성공 시 이동) */}
          <ButtonLink to="/Home">
            <SaveBtn onClick={handleSave} disabled={loading}>
              {loading ? "저장 중..." : "저장하기"}
            </SaveBtn>
          </ButtonLink>
        </Card>
      </PageBody>
    </>
  );
}

/* ================= Styled Components ================= */

const PageBody = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 90px; /* 헤더와 카드 사이 90px */
  position: relative;
  z-index: 1;
  padding-bottom: 80px;
`;

const Card = styled.div`
  width: 540px; /* 흰 박스 너비 고정 */
  background: #ffffff;
  border-radius: 16px;
  padding: 40px 48px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 2;
`;

const Title = styled.h2`
  text-align: center;
  margin: 0 0 35px;
  font-weight: 700;
  font-size: 22px;
`;

const Field = styled.div`
  width: 100%;
`;

const Label = styled.div`
  font-size: 15px;
  margin-bottom: 8px;
  font-weight: 600;
`;

const SubText = styled.span`
  margin-left: 6px;
  font-size: 12px;
  color: #777777;
  font-weight: 400;
`;

/* input들은 전부 카드 내부 폭 기준 95% (오른쪽 여백 조금 남김) */
const Input = styled.input`
  width: 95%;
  height: 42px;
  border-radius: 8px;
  border: 1px solid #dcdcdc;
  padding: 0 12px;
  font-size: 15px;
  outline: none;
  background: ${(props) => (props.disabled ? "#f2f2f2" : "#ffffff")};

  &:focus {
    border-color: #0f7f90;
  }
`;

/* 버튼을 감싸는 Link (버튼 크기 그대로, 링크 스타일 제거) */
const ButtonLink = styled(Link)`
  display: block;
  width: 100%;
  text-decoration: none;
`;

/* 비밀번호 변경 버튼 */
const PasswordBtn = styled.button`
  width: 100%;
  height: 40px;
  margin-top: 18px;
  border-radius: 6px;
  background: #6f6f6f;
  color: #ffffff;
  border: none;
  font-size: 14px;
  cursor: pointer;
`;

/* 검색 박스(돋보기 포함) */
const InputWrap = styled.div`
  width: 100%;
  position: relative;
`;

const SearchIcon = styled.span`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
`;

/* 저장하기 버튼 */
const SaveBtn = styled.button`
  width: 100%;
  height: 44px;
  margin-top: 35px;
  background: #0b6f8a;
  color: #ffffff;
  border: none;
  font-size: 15px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;

  &:active {
    transform: scale(0.98);
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
