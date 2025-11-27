// src/api/resume.js
import { API_BASE_URL } from "./config";

/**
 * 이력서 초안 생성
 * POST /api/resumes
 */
export async function createResumeDraft(data) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${API_BASE_URL}/api/resumes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json().catch(() => null);

  if (!json) {
    throw new Error("서버 응답 오류");
  }

  if (json.status !== 200 && json.status !== 201) {
    throw new Error(json.message || "자소서 저장 실패");
  }

  return json;
}

/**
 * 이력서 초안 수정
 * PATCH /api/resumes/{resumeId}
 */
export async function updateResumeDraft(resumeId, data) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${API_BASE_URL}/api/resumes/${resumeId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json().catch(() => null);

  if (!json) {
    throw new Error("서버 응답 오류");
  }

  if (json.status !== 200) {
    throw new Error(json.message || "자소서 수정 실패");
  }

  return json;
}
