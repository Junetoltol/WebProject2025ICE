// src/api/selfIntro.js
import api from "./api";
import { isLoggedIn } from "./auth";

/**
 * 공통: 응답 코드 체크 (200 또는 "SU" 면 성공으로 간주)
 */
function isSuccessCode(code) {
  return code === 200 || code === "SU";
}

/**
 * 자소서 설정 저장 (생성/갱신)
 * POST /api/cover-letters/{coverLetterId}/settings
 *
 * @param {number|string} coverLetterId
 * @param {{ questions: string[], tone: string, lengthPerQuestion: number }} payload
 */
export async function saveCoverLetterSettings(coverLetterId, payload) {
  if (!isLoggedIn()) {
    throw new Error("로그인이 필요합니다.");
  }

  let res;

  try {
    res = await api.post(`/api/cover-letters/${coverLetterId}/settings`, {
      questions: payload.questions,
      tone: payload.tone,
      lengthPerQuestion: payload.lengthPerQuestion,
    });
  } catch (err) {
    if (!err.response) {
      console.error("자소서 설정 저장 네트워크 오류:", err);
      throw new Error(
        "서버에 연결할 수 없습니다. (네트워크/CORS 문제일 수 있습니다)"
      );
    }

    const json = err.response.data ?? {};
    const message = json.message || "자소서 설정 저장에 실패했습니다.";

    const error = new Error(message);
    error.status = json.status ?? json.code ?? err.response.status;
    error.data = json;
    throw error;
  }

  const json = res.data ?? null;

  if (!json || !isSuccessCode(json.code) || !json.data) {
    throw new Error(json?.message || "자소서 설정 저장에 실패했습니다.");
  }

  // { code, message, data: {...} } 형태 그대로 쓰고 싶으면 json 리턴
  return json;
}

/**
 * 자소서 초안 생성
 * POST /api/cover-letters
 */
export async function createCoverLetterDraft(draftData) {
  if (!isLoggedIn()) {
    throw new Error("로그인이 필요합니다.");
  }

  let res;

  try {
    res = await api.post("/api/cover-letters", draftData);
  } catch (err) {
    if (!err.response) {
      console.error("자소서 초안 저장 네트워크 오류:", err);
      throw new Error(
        "서버에 연결할 수 없습니다. (네트워크/CORS 문제일 수 있습니다)"
      );
    }

    const json = err.response.data ?? {};
    const message =
      json.message || "자기소개서 초안 저장에 실패했습니다.";

    const error = new Error(message);
    error.status = json.status ?? json.code ?? err.response.status;
    error.data = json;
    throw error;
  }

  const json = res.data ?? null;

  if (!json || !json.data || !isSuccessCode(json.code)) {
    throw new Error(
      json?.message || "자기소개서 초안 저장에 실패했습니다."
    );
  }

  // ✅ IntroInfo.jsx 에서는 이 data 객체를 바로 받는다.
  //    예: { coverLetterId: 26, title, resumeId, ... }
  return json.data;
}

/**
 * 자소서 초안 수정
 * PATCH /api/cover-letters/{coverLetterId}
 */
export async function updateCoverLetterDraft(coverLetterId, draftData) {
  if (!isLoggedIn()) {
    throw new Error("로그인이 필요합니다.");
  }

  let res;

  try {
    res = await api.patch(`/api/cover-letters/${coverLetterId}`, draftData);
  } catch (err) {
    if (!err.response) {
      console.error("자소서 초안 수정 네트워크 오류:", err);
      throw new Error(
        "서버에 연결할 수 없습니다. (네트워크/CORS 문제일 수 있습니다)"
      );
    }

    const json = err.response.data ?? {};
    const message =
      json.message || "자기소개서 초안 수정에 실패했습니다.";

    const error = new Error(message);
    error.status = json.status ?? json.code ?? err.response.status;
    error.data = json;
    throw error;
  }

  const json = res.data ?? null;

  if (!json || !json.data || !isSuccessCode(json.code)) {
    throw new Error(
      json?.message || "자기소개서 초안 수정에 실패했습니다."
    );
  }

  // 생성이랑 동일하게 data만 반환
  return json.data;
}

/**
 * 자소서 단건 조회
 * GET /api/cover-letters/{coverLetterId}
 */
export async function getCoverLetterDraft(coverLetterId) {
  if (!isLoggedIn()) {
    throw new Error("로그인이 필요합니다.");
  }

  let res;

  try {
    res = await api.get(`/api/cover-letters/${coverLetterId}`);
  } catch (err) {
    if (!err.response) {
      console.error("자소서 조회 네트워크 오류:", err);
      throw new Error(
        "서버에 연결할 수 없습니다. (네트워크/CORS 문제일 수 있습니다)"
      );
    }

    const json = err.response.data ?? {};
    const message = json.message || "자기소개서 조회에 실패했습니다.";

    const error = new Error(message);
    error.status = json.status ?? json.code ?? err.response.status;
    error.data = json;
    throw error;
  }

  const json = res.data ?? null;

  if (!json || !json.data || !isSuccessCode(json.code)) {
    throw new Error(json?.message || "자기소개서 조회에 실패했습니다.");
  }

  // { id, coverLetterId, title, targetCompany, targetJob, status, previewUrl, ... }
  return json.data;
}

/**
 * 자소서 AI 생성 요청
 * POST /api/cover-letters/{coverLetterId}/generate
 */
export async function generateCoverLetter(coverLetterId, options = {}) {
  if (!isLoggedIn()) {
    throw new Error("로그인이 필요합니다.");
  }

  let res;

  try {
    const params = {};
    if (options.mode) params.mode = options.mode; // 예: "poll"
    if (options.exportFormat) params.exportFormat = options.exportFormat; // 예: "word"

    const body = options.body ?? {};

    res = await api.post(
      `/api/cover-letters/${coverLetterId}/generate`,
      body,
      { params }
    );
  } catch (err) {
    if (!err.response) {
      console.error("자소서 생성 요청 네트워크 오류:", err);
      throw new Error(
        "서버에 연결할 수 없습니다. (네트워크/CORS 문제일 수 있습니다)"
      );
    }

    const json = err.response.data ?? {};
    const message = json.message || "자소서 생성 요청에 실패했습니다.";

    const error = new Error(message);
    error.status = json.status ?? json.code ?? err.response.status;
    error.data = json;
    throw error;
  }

  const json = res.data ?? null;

  if (!json || !json.data || !isSuccessCode(json.code)) {
    throw new Error(json?.message || "자소서 생성 요청에 실패했습니다.");
  }

  // { code, message, data: { coverLetterId, status, previewUrl, ... } }
  return json;
}

/**
 * 자소서 생성 상태 조회 (로딩 페이지에서 사용)
 * 실제로는 단건 조회와 동일한 API를 재사용
 */
export async function getCoverLetterStatus(coverLetterId) {
  return await getCoverLetterDraft(coverLetterId);
}
