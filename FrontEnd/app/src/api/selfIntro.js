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
    res = await api.post(
      `/api/cover-letters/${coverLetterId}/settings`,
      {
        questions: payload.questions,
        tone: payload.tone,
        lengthPerQuestion: payload.lengthPerQuestion,
      }
    );
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
    const message =
      json.message || "자기소개서 초안 저장에 실패했습니다.";

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
    throw new Error(
      json.message || "자기소개서 초안 저장에 실패했습니다."
    );
  }

  return json;
}

/**
 * 자소서 초안 수정
 * PATCH /api/cover-letters/{coverLetterId}
 */
export async function updateCoverLetterDraft(
  coverLetterId,
  draftData
) {
  if (!isLoggedIn()) {
    throw new Error("로그인이 필요합니다.");
  }

  let res;

  try {
    res = await api.patch(
      `/api/cover-letters/${coverLetterId}`,
      draftData
    );
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

  if (!json) {
    throw new Error("서버 응답이 올바르지 않습니다.");
  }

  if (json.code !== "SU" || !json.data?.coverLetterId) {
    throw new Error(
      json.message || "자기소개서 초안 수정에 실패했습니다."
    );
  }

  return json;
}
