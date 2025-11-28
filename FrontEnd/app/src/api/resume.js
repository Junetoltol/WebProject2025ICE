// src/api/resume.js
import api from "./api";
import { isLoggedIn } from "./auth";

// 응답 코드 공통 체크 (200 / 201 / "SU" 성공으로 간주)
function isSuccessStatus(json, res) {
  const code = json?.code;
  const status = json?.status ?? res?.status;

  return code === "SU" || code === 200 || status === 200 || status === 201;
}

/**
 * 이력서 초안 생성
 * POST /api/resumes
 */
export async function createResumeDraft(data) {
  if (!isLoggedIn()) {
    throw new Error("로그인이 필요합니다.");
  }

  let res;

  try {
    // ✅ axios 인스턴스 사용 (토큰은 인터셉터가 자동으로 첨부)
    res = await api.post("/api/resumes", data);
  } catch (err) {
    // 네트워크 에러 (서버 자체에 못 붙는 경우)
    if (!err.response) {
      console.error("이력서 초안 생성 네트워크 오류:", err);
      throw new Error(
        "서버에 연결할 수 없습니다. (네트워크/CORS 문제일 수 있습니다)"
      );
    }

    const json = err.response.data ?? {};
    const statusCode = json.status ?? json.code ?? err.response.status;
    const message = json.message || "이력서 저장 실패";

    const error = new Error(message);
    error.status = statusCode;
    error.data = json;
    throw error;
  }

  const json = res.data ?? null;

  if (!json) {
    throw new Error("서버 응답 오류");
  }

  if (!json.data || !isSuccessStatus(json, res)) {
    throw new Error(json.message || "이력서 저장 실패");
  }

  // ✅ IntroInfo.jsx 에서는
  //    const resumeData = await createResumeDraft(...);
  //    newResumeId = resumeData.resumeId;
  // 이렇게 바로 쓸 수 있음
  return json.data;
}

/**
 * 이력서 초안 수정
 * PATCH /api/resumes/{resumeId}
 */
export async function updateResumeDraft(resumeId, data) {
  if (!isLoggedIn()) {
    throw new Error("로그인이 필요합니다.");
  }

  let res;

  try {
    res = await api.patch(`/api/resumes/${resumeId}`, data);
  } catch (err) {
    if (!err.response) {
      console.error("자소서 초안 수정 네트워크 오류:", err);
      throw new Error(
        "서버에 연결할 수 없습니다. (네트워크/CORS 문제일 수 있습니다)"
      );
    }

    const json = err.response.data ?? {};
    const statusCode = json.status ?? json.code ?? err.response.status;
    const message = json.message || "자소서 수정 실패";

    const error = new Error(message);
    error.status = statusCode;
    error.data = json;
    throw error;
  }

  const json = res.data ?? null;

  if (!json) {
    throw new Error("서버 응답 오류");
  }

  if (!json.data || !isSuccessStatus(json, res)) {
    throw new Error(json.message || "자소서 수정 실패");
  }

  // 마찬가지로 data만 반환
  return json.data;
}
