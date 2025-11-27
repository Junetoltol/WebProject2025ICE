// src/api/selfIntro.js
import { API_BASE_URL } from "./config";


/**
 * 자소서 설정 저장 (생성/갱신)
 * POST /api/cover-letters/{coverLetterId}/settings
 *
 * @param {number|string} coverLetterId
 * @param {{ questions: string[], tone: string, lengthPerQuestion: number }} payload
 * @returns {Promise<{ code: string, message: string, data: { coverLetterId: number, tone: string, lengthPerQuestion: number } }>}
 */
export async function saveCoverLetterSettings(coverLetterId, payload) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("로그인이 필요합니다.");
  }

  const res = await fetch(
    `${API_BASE_URL}/api/cover-letters/${coverLetterId}/settings`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token, // 예: "Bearer xxxxx" (login에서 그대로 저장한 값 사용)
      },
      body: JSON.stringify({
        questions: payload.questions,
        tone: payload.tone,
        lengthPerQuestion: payload.lengthPerQuestion,
      }),
    }
  );

  const json = await res.json().catch(() => null);

  if (!json) {
    throw new Error("서버 응답이 올바르지 않습니다.");
  }

  const { code, message, data } = json;

  // ✅ 명세 기준: 성공 code = "SU"
  if (!res.ok || code !== "SU" || !data) {
    // 400/401/403/404/500 등 모두 여기로 들어옴
    throw new Error(message || "자소서 설정 저장에 실패했습니다.");
  }

  return json; // { code: "SU", message: "...", data: { coverLetterId, tone, lengthPerQuestion } }
}

/**
 * 자소서 초안 저장 (POST /api/cover-letters)
 * @param {Object} draftData - { title, targetCompany, targetJob, sections: {...} }
 * @returns {Promise<{ code: string, message: string, data: { coverLetterId: number } }>}
 */
export async function createCoverLetterDraft(draftData) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("로그인이 필요합니다.");
  }

  const res = await fetch(`${API_BASE_URL}/api/cover-letters`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token, // "Bearer xxx"
    },
    body: JSON.stringify(draftData),
  });

  const json = await res.json().catch(() => null);
  if (!json) {
    throw new Error("서버 응답이 올바르지 않습니다.");
  }

  const { code, message, data } = json;

  if (!res.ok || code !== "SU" || !data?.coverLetterId) {
    throw new Error(message || "자기소개서 초안 저장에 실패했습니다.");
  }

  return json; // { code: "SU", message: "...", data: { coverLetterId } }
}

/**
 * 자소서 초안 수정 (PATCH /api/cover-letters/{coverLetterId})
 * @param {number|string} coverLetterId
 * @param {Object} draftData - POST와 동일한 구조
 */
export async function updateCoverLetterDraft(coverLetterId, draftData) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("로그인이 필요합니다.");
  }

  const res = await fetch(
    `${API_BASE_URL}/api/cover-letters/${coverLetterId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(draftData),
    }
  );

  const json = await res.json().catch(() => null);
  if (!json) {
    throw new Error("서버 응답이 올바르지 않습니다.");
  }

  const { code, message, data } = json;

  if (!res.ok || code !== "SU" || !data?.coverLetterId) {
    throw new Error(message || "자기소개서 초안 수정에 실패했습니다.");
  }

  return json;
}