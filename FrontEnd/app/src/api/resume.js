// src/api/resume.js
import api from "./api";

/**
 * 이력서 초안 생성
 * POST /api/resumes
 */
export async function createResumeDraft(data) {
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
    const message = json.message || "자소서 저장 실패";

    const error = new Error(message);
    error.status = statusCode;
    error.data = json;
    throw error;
  }

  const json = res.data ?? null;

  if (!json) {
    throw new Error("서버 응답 오류");
  }

  const statusCode = json.status ?? json.code ?? res.status;

  if (statusCode !== 200 && statusCode !== 201) {
    throw new Error(json.message || "자소서 저장 실패");
  }

  return json;
}

/**
 * 이력서 초안 수정
 * PATCH /api/resumes/{resumeId}
 */
export async function updateResumeDraft(resumeId, data) {
  let res;

  try {
    res = await api.patch(`/api/resumes/${resumeId}`, data);
  } catch (err) {
    if (!err.response) {
      console.error("이력서 초안 수정 네트워크 오류:", err);
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

  const statusCode = json.status ?? json.code ?? res.status;

  if (statusCode !== 200) {
    throw new Error(json.message || "자소서 수정 실패");
  }

  return json;
}
