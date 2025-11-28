// src/pages/self-intro/IntroDownload.jsx
import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import Header from "../../components/Header";
import { useLocation, useParams } from "react-router-dom";
import {
  downloadCoverLetterFile,
  archiveCoverLetter,
  getCoverLetterDraft,
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
  border: 1px solid rgba(199, 214, 223, 0.6);
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.03);
  padding: 32px 28px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  text-align: center;
`;

const Sub = styled.p`
  margin: -14px 0 0;
  font-size: 13px;
  color: #6d7a83;
  text-align: center;
`;

const PreviewWrap = styled.div`
  width: 280px;
  height: 360px;
  background: #ffffff;
  border-radius: 6px;
  box-shadow: 0 10px 28px rgba(0, 103, 140, 0.35);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: stretch;
`;

const ScrollPaper = styled.div`
  width: 100%;
  background: #fff;
  padding: 18px 14px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 103, 140, 0.4);
    border-radius: 999px;
  }
`;

const PreviewText = styled.pre`
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: keep-all;
`;

const BtnRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const Btn = styled.button`
  background: #00678c;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 26px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.15s ease-out;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);

  &:hover {
    background: #04506d;
  }

  &:disabled {
    background: #b7c3c9;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const WideBtn = styled(Btn)`
  margin-top: 4px;
  min-width: 180px;
`;

export default function IntroDownload() {
  const location = useLocation();
  const params = useParams();

  // 우선순위: state로 온 값 > URL 파라미터
  const coverLetterId =
    location.state?.coverLetterId || params.coverLetterId || null;

  const userName = location.state?.userName || "OOO";
  const fileTitle = location.state?.title || "자기소개서";

  const placeholderText =
    "AI가 생성한 자기소개서가 이 영역에 표시될 예정입니다.\n\n" +
    "아직 실제 내용 연동이 안 되어 있다면,\n" +
    "IntroLoading → IntroDownload로 넘어올 때\n" +
    "state에 { content }를 넘겨주세요.";

  // 미리보기 텍스트 (state 우선, 없으면 안내 문구)
  const [previewText, setPreviewText] = useState(
    location.state?.content || placeholderText
  );

  // 컴포넌트 마운트 시 / coverLetterId 변경 시 서버에서 내용 조회
  useEffect(() => {
    if (!coverLetterId) return;

    // 이미 state로 content가 넘어왔으면 서버 호출 안 함
    if (location.state?.content) return;

    const fetchPreview = async () => {
      try {
        const res = await getCoverLetterDraft(coverLetterId);
        const data = res?.data ?? res?.data?.data ?? res ?? {};

        // 1순위: content 문자열이 바로 있다면 그걸 사용
        if (typeof data.content === "string") {
          setPreviewText(data.content);
          return;
        }

        // 2순위: sections 배열이면 question/answer를 합쳐서 문자열로 생성
        if (Array.isArray(data.sections)) {
          const joined = data.sections
            .map((section, idx) => {
              if (!section) return "";

              const q =
                section.question ||
                section.title ||
                `문항 ${idx + 1}`;
              const a =
                section.answer ||
                section.content ||
                section.body ||
                "";

              if (q && a) return `Q${idx + 1}. ${q}\n${a}`;
              return a || q || "";
            })
            .filter(Boolean)
            .join("\n\n");

          if (joined) {
            setPreviewText(joined);
            return;
          }
        }

        // 그래도 없으면 placeholder 유지
      } catch (e) {
        console.error("자기소개서 미리보기 조회 실패", e);
      }
    };

    fetchPreview();
  }, [coverLetterId, location.state]);

  const disabled = !coverLetterId;

  // 실제 브라우저 다운로드 처리 함수
  const triggerBrowserDownload = useCallback((blob, fileName) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }, []);

  // word / pdf 공통 처리
  const handleDownload = async (format) => {
    if (!coverLetterId) {
      alert("coverLetterId 정보가 없어 파일을 다운로드할 수 없습니다.");
      return;
    }

    try {
      const { blob, fileName } = await downloadCoverLetterFile(
        coverLetterId,
        format
      );
      triggerBrowserDownload(blob, fileName);
    } catch (err) {
      console.error(err);
      alert(err.message || "파일 다운로드에 실패했습니다.");
    }
  };

  const handleArchive = async () => {
    if (!coverLetterId) {
      alert("coverLetterId 정보가 없어 보관함에 저장할 수 없습니다.");
      return;
    }

    try {
      await archiveCoverLetter(coverLetterId);
      alert("보관함에 저장되었습니다.");
    } catch (err) {
      console.error(err);
      alert(err.message || "보관함 저장에 실패했습니다.");
    }
  };

  return (
    <Wrap>
      <Header />
      <Container>
        <Box>
          <Title>
            {userName} 님의 {fileTitle}가 완성되었어요!
          </Title>
          <Sub>Word와 PDF로 다운로드 받아 자유롭게 수정해 보세요.</Sub>

          <PreviewWrap>
            <ScrollPaper>
              <PreviewText>{previewText}</PreviewText>
            </ScrollPaper>
          </PreviewWrap>

          <BtnRow>
            <Btn disabled={disabled} onClick={() => handleDownload("word")}>
              word로 다운로드
            </Btn>
            <Btn disabled={disabled} onClick={() => handleDownload("pdf")}>
              pdf로 다운로드
            </Btn>
          </BtnRow>

          <WideBtn disabled={disabled} onClick={handleArchive}>
            보관함에 저장
          </WideBtn>
        </Box>
      </Container>
    </Wrap>
  );
}
