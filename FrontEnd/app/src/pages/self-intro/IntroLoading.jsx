// src/pages/self-intro/IntroLoading.jsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import loadingCharacter from "../../assets/loadingCharacter.png";
import { getCoverLetterStatus } from "../../api/selfIntro";

const Wrap = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    180deg,
    rgba(41, 198, 255, 0.25) 0%,
    rgba(113, 189, 129, 0.25) 100%
  );
`;

const CenterArea = styled.div`
  max-width: 740px;
  margin: 0 auto;
  padding: 20vh 24px 40px; /* 헤더만큼 아래로 */
  display: flex;
  justify-content: center;
`;

const Card = styled.div`
  width: 540px;
  min-height: 360px;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e3e6eb;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  text-align: center;
`;

const CharImg = styled.img`
  width: 170px;
  height: auto;
`;

const Title = styled.div`
  font-weight: 700;
  font-size: 16px;
  color: #000;
`;

const Sub = styled.div`
  font-size: 13px;
  color: #737171;
`;

const ErrorText = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: #c9453b;
`;

export default function IntroLoading() {
  const navigate = useNavigate();
  const location = useLocation();

  // IntroConfig → navigate("/self-intro/loading", { state: { coverLetterId } })
  const coverLetterId = location.state?.coverLetterId ?? null;

  const [status, setStatus] = useState("PROCESSING"); // PROCESSING | SUCCESS | ERROR
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!coverLetterId) {
      alert("자소서 ID(coverLetterId)가 없습니다. 처음 화면으로 이동합니다.");
      navigate("/self-intro/info", { replace: true }); // 필요에 따라 경로 수정
      return;
    }

    let cancelled = false;

    const pollIntervalMs = 3000;

    async function pollOnce() {
      try {
        const res = await getCoverLetterStatus(coverLetterId);
        if (cancelled) return;

        const data = res.data;
        const currentStatus = data.status; // "SUCCESS" | "PROCESSING" 등

        if (currentStatus === "SUCCESS") {
          setStatus("SUCCESS");
          // 완료되면 다운로드 페이지로 이동
          navigate("/self-intro/download", {
            replace: true,
            state: {
              coverLetterId: data.coverLetterId,
              previewUrl: data.previewUrl, // "/files/cover-7001.png"
              title: data.title,
            },
          });
        } else if (currentStatus === "PROCESSING") {
          setStatus("PROCESSING");
          // 아직 생성 중이면 일정 시간 뒤 다시 폴링
          setTimeout(pollOnce, pollIntervalMs);
        } else {
          // 정의되지 않은 상태 값이면 에러로 처리
          setStatus("ERROR");
          setErrorMsg("자소서 상태가 올바르지 않습니다. 다시 시도해 주세요.");
        }
      } catch (err) {
        if (cancelled) return;

        // 아직 미생성(409) → 계속 기다렸다가 다시 폴링
        if (err.httpStatus === 409) {
          setStatus("PROCESSING");
          setTimeout(pollOnce, pollIntervalMs);
          return;
        }

        // 404, 401, 403 등은 에러로 노출
        console.error("자소서 상태 조회 실패:", err);
        setStatus("ERROR");
        setErrorMsg(err.message || "자소서 조회 중 오류가 발생했습니다.");
      }
    }

    // 첫 호출
    pollOnce();

    return () => {
      cancelled = true;
    };
  }, [coverLetterId, navigate]);

  return (
    <Wrap>
      <Header />
      <CenterArea>
        <Card>
          <CharImg src={loadingCharacter} alt="자소서 생성 캐릭터" />
          <Title>맞춤 자소서를 생성 중이에요...</Title>
          <Sub>최대 몇 분의 시간이 소요될 수 있습니다.</Sub>
          {status === "ERROR" && errorMsg && (
            <ErrorText>{errorMsg}</ErrorText>
          )}
        </Card>
      </CenterArea>
    </Wrap>
  );
}
