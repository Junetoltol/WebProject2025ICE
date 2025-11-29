// src/pages/self-intro/StoreIntro.jsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { isLoggedIn } from "../../api/auth";
import {
  getCoverLetterArchive,
  deleteCoverLetter,
  downloadCoverLetter, // ✅ 다운로드 API 추가
} from "../../api/selfIntro";

const Wrap = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    180deg,
    rgba(41, 198, 255, 0.25) 0%,
    rgba(113, 189, 129, 0.25) 100%
  );
`;

const Container = styled.div`
  max-width: 740px;
  margin: 0 auto;
  padding: 20vh 24px 40px;
`;

const Box = styled.div`
  background: #fff;
  border-radius: 14px;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(199, 214, 223, 0.6);
  padding: 28px 28px 32px;
`;

const BoxHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 26px;
`;

const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #000;
`;

const Sub = styled.div`
  font-size: 13px;
  color: #6d7a83;
`;

const NewButton = styled.button`
  background: #00678c;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.15s ease-out;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);

  &:hover {
    background: #04506d;
  }
`;

const CardRow = styled.div`
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
`;

const DocCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const DocThumbnail = styled.div`
  width: 150px;
  height: 210px;
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0 9px 18px rgba(0, 96, 140, 0.28);
  border: 1px solid rgba(0, 103, 140, 0.12);
  position: relative;
  overflow: hidden;

  &:hover div.overlay {
    opacity: 1;
    pointer-events: all;
  }
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
      180deg,
      rgba(0, 103, 140, 0.4) 0%,
      rgba(0, 109, 148, 0.12) 100%
    ),
    #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
`;

const ActionButton = styled.button`
  width: 80px;
  padding: 8px 0;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  color: #fff;
  background: ${({ variant }) =>
    variant === "edit"
      ? "#00678C"
      : variant === "download"
      ? "#00678C"
      : "#9E9E9E"};
  transition: background 0.2s;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);

  &:hover {
    background: ${({ variant }) =>
      variant === "edit"
        ? "#04506D"
        : variant === "download"
        ? "#04506D"
        : "#7C7C7C"};
  }
`;

const DocName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #000;
`;

const DocDate = styled.div`
  font-size: 11.5px;
  color: #5a666d;
`;

// 날짜 포맷터: 2025-01-05T12:34:56 → 2025.01.05
function formatDate(isoString) {
  if (!isoString) return "-";
  const d = new Date(isoString);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

export default function StoreIntro() {
  const navigate = useNavigate();

  // 🔹 사용자 이름 상태
  const [userName, setUserName] = useState("사용자");

  // 🔹 자소서 목록 상태 (초기에는 새문서 1만 있는 빈 상태)
  const [docs, setDocs] = useState([
    { id: 1, title: "새문서 1", modified: "-" },
  ]);

  // ✅ 1) 페이지 진입 시 로그인 여부 확인
  useEffect(() => {
    if (!isLoggedIn()) {
      alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
      navigate("/login");
    }
  }, [navigate]);

  // 🔹 2) 사용자 이름 로컬스토리지에서 가져오기
  useEffect(() => {
    const savedName = localStorage.getItem("userName");
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  // ✅ 3) 보관함 목록 불러오기 (로그인 된 상태에서)
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const page = await getCoverLetterArchive({
          page: 0,
          size: 12,
        });

        // page.content 안에 데이터가 있을 때만 목록으로 교체
        if (page && Array.isArray(page.content) && page.content.length > 0) {
          const mapped = page.content.map((item) => ({
            // ★ 명세서 기준: coverLetterId 사용
            id: item.coverLetterId,
            title: item.title || "제목 없음",
            modified: formatDate(item.updatedAt || item.createdAt),
          }));
          setDocs(mapped);
        } else {
          // 아무것도 없으면 기본 "새문서 1" 유지
          setDocs([{ id: 1, title: "새문서 1", modified: "-" }]);
        }
      } catch (err) {
        console.error("보관함 목록 조회 실패:", err);
        // 실패해도 화면은 placeholder 유지
      }
    };

    if (isLoggedIn()) {
      fetchDocs();
    }
  }, []);

  // ✅ 자소서 열기 (수정 페이지로 이동)
  const handleOpenDoc = (docId) => {
    // 수정 페이지: /self-intro/:coverLetterId
    navigate(`/self-intro/${docId}`);
  };

  // ✅ 삭제하기 (백엔드 연동)
  const handleDeleteDoc = async (docId) => {
    const ok = window.confirm(
      "정말 이 자소서를 삭제할까요? (삭제 후에는 복구할 수 없습니다)"
    );
    if (!ok) return;

    try {
      await deleteCoverLetter(docId); // ★ 여기로 올바른 id 전달

      setDocs((prev) => {
        const next = prev.filter((doc) => doc.id !== docId);
        return next.length === 0
          ? [{ id: 1, title: "새문서 1", modified: "-" }]
          : next;
      });
    } catch (err) {
      console.error("자소서 삭제 실패:", err);
      alert(err.message || "자소서 삭제 중 오류가 발생했습니다.");
    }
  };

  // ✅ 다운로드
  const handleDownloadDoc = async (docId) => {
    try {
      // 기본은 word로 다운로드, 필요하면 "pdf"로 바꿔도 됨
      const { blob, filename } = await downloadCoverLetter(docId, "word");

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("자소서 다운로드 실패:", err);
      alert(err.message || "자소서 다운로드 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <Header />
      <Wrap>
        <Container>
          <Box>
            <BoxHeader>
              <TitleGroup>
                {/* ✅ 000 부분에 사용자 이름 넣기 */}
                <Title>자소서 보관함</Title>
                <Sub>생성한 자소서를 저장하거나, 삭제할 수 있어요.</Sub>
              </TitleGroup>

              <NewButton onClick={() => navigate("/self-intro/Info")}>
                새 자소서 작성하기
              </NewButton>
            </BoxHeader>

            <CardRow>
              {docs.map((doc) => (
                <DocCard key={doc.id}>
                  <DocThumbnail onClick={() => handleOpenDoc(doc.id)}>
                    <Overlay className="overlay">
                      <ActionButton
                        variant="download"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadDoc(doc.id);
                        }}
                      >
                        다운로드
                      </ActionButton>

                      {/* ✅ 수정하기 버튼 추가 
                      <ActionButton
                        variant="edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDoc(doc.id);
                        }}
                      >
                        
                        수정하기
                      </ActionButton>
                      */}
                      <ActionButton
                        variant="delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDoc(doc.id);
                        }}
                      >
                      
                        삭제하기
                      </ActionButton>
                    </Overlay>
                  </DocThumbnail>

                  <DocName onClick={() => handleOpenDoc(doc.id)}>
                    {doc.title}
                  </DocName>
                  <DocDate>수정일자: {doc.modified}</DocDate>
                </DocCard>
              ))}
            </CardRow>
          </Box>
        </Container>
      </Wrap>
    </>
  );
}
