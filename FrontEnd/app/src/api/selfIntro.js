// src/api/selfIntro.js
import api from "./api";
import { isLoggedIn } from "./auth";

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
    // 네트워크 오류 (서버 자체에 연결 실패)
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

  if (!json) {
    throw new Error("서버 응답이 올바르지 않습니다.");
  }

  if (json.code !== "SU" || !json.data) {
    throw new Error(json.message || "자소서 설정 저장에 실패했습니다.");
  }

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
    const message = json.message || "자기소개서 초안 저장에 실패했습니다.";

    const error = new Error(message);
    error.status = json.status ?? json.code ?? err.response.status;
    error.data = json;
    throw error;
  }

  const json = res.data ?? null;

  if (!json) {
    throw new Error("서버 응답이 올바르지 않습니다.");
  }

  if (json.code !== "SU" || !json.data?.coverLetterId) {
    throw new Error(json.message || "자기소개서 초안 저장에 실패했습니다.");
  }

  return json;
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
    const message = json.message || "자기소개서 초안 수정에 실패했습니다.";

    const error = new Error(message);
    error.status = json.status ?? json.code ?? err.response.status;
    error.data = json;
    throw error;
  }

  const json = res.data ?? null;

  if (!json) {
    throw new Error("서버 응답이 올바르지 않습니다.");
  }

  if (json.code !== "SU" || !json.data?.coverLetterId) {
    throw new Error(json.message || "자기소개서 초안 수정에 실패했습니다.");
  }

  return json;
}

/**
 * 자소서 생성 요청
 *
 * POST /api/cover-letters/{coverLetterId}/generate[?mode=poll]
 *
 * - 기본: 동기 (완성된 자소서를 바로 반환)
 * - mode=poll: 비동기 잡 생성 후 PROCESSING 상태 반환
 *
 * @param {number|string} coverLetterId
 * @param {{ mode?: 'sync' | 'poll', exportFormat?: string, options?: any }} options
 */
export async function generateCoverLetter(coverLetterId, options = {}) {
  if (!isLoggedIn()) {
    throw new Error("로그인이 필요합니다.");
  }

  const {
    mode = "poll", // 기본값: 폴링 모드
    exportFormat = "word",
    options: generateOptions = { includeEvidence: true },
  } = options;

  let res;

  const query = mode === "poll" ? "?mode=poll" : "";

  try {
    res = await api.post(
      `/api/cover-letters/${coverLetterId}/generate${query}`,
      {
        exportFormat,
        options: generateOptions,
      }
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

  if (!json) {
    throw new Error("서버 응답이 올바르지 않습니다.");
  }

  if (json.code !== "SU" || !json.data?.coverLetterId) {
    throw new Error(json.message || "자소서 생성 요청에 실패했습니다.");
  }

  return json;
}

/**
 * 자소서 상태/미리보기 메타 조회
 *
 * GET /api/cover-letters/{coverLetterId}
 */
export async function getCoverLetterStatus(coverLetterId) {
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
    const message = json.message || "자소서 조회에 실패했습니다.";

    const error = new Error(message);
    error.httpStatus = err.response.status; // 409, 404, 401 등
    error.code = json.code ?? null;
    error.data = json;
    throw error;
  }

  const json = res.data ?? null;

  if (!json) {
    throw new Error("서버 응답이 올바르지 않습니다.");
  }

  if (json.code !== "SU" || !json.data) {
    throw new Error(json.message || "자소서 조회에 실패했습니다.");
  }

  // json.data = { coverLetterId, title, status, previewUrl, ... }
  return json;
}
