// src/api/userApi.js

import api from "./api";
import { isLoggedIn } from "./auth";

/**
 * 비밀번호 변경 API
 *
 * PATCH /api/users/me/password
 * Authorization: Bearer {JWT}
 */
export async function changePassword({
  username,
  currentPassword,
  newPassword,
  confirmPassword,
}) {
  if (!isLoggedIn()) {
    throw new Error("로그인이 필요합니다.");
  }

  let res;
  try {
    // ✅ axios 인스턴스 사용 (Authorization은 인터셉터가 자동 첨부)
    res = await api.patch("/api/users/me/password", {
      username,
      currentPassword,
      newPassword,
      confirmPassword,
    });
  } catch (err) {
    // 네트워크 레벨 에러 (서버 접속 자체 실패)
    if (!err.response) {
      console.error("비밀번호 변경 요청 네트워크 오류:", err);
      const error = new Error(
        "서버에 연결할 수 없습니다. (네트워크/CORS 문제일 수 있습니다)"
      );
      error.cause = err;
      throw error;
    }

    // HTTP 에러 응답 (400/401/500 등)
    const data = err.response.data ?? {};
    const statusCode = data.status ?? data.code ?? err.response.status;

    const error = new Error(
      data?.message || "비밀번호 변경 중 오류가 발생했습니다."
    );
    error.status = statusCode;
    error.data = data;
    throw error;
  }

  const data = res.data ?? null;

  if (!data) {
    const error = new Error("서버 응답이 올바르지 않습니다.");
    error.status = res.status;
    throw error;
  }

  const statusCode = data.status ?? data.code ?? res.status;

  if (statusCode !== 200) {
    const error = new Error(
      data?.message || "비밀번호 변경 중 오류가 발생했습니다."
    );
    error.status = statusCode;
    error.data = data;
    throw error;
  }

  // 예상: { code: 200, message: "...", data: null }
  return data;
}

/**
 * 개인정보(이력 정보) 수정 API
 *
 * PATCH /api/users/me/profile
 * Authorization: Bearer {JWT}
 */
export async function updateUserProfile({ name, univ, major }) {
  if (!isLoggedIn()) {
    throw new Error("로그인이 필요합니다.");
  }

  let res;
  try {
    res = await api.patch("/api/users/me/profile", {
      name,
      univ,
      major,
    });
  } catch (err) {
    if (!err.response) {
      console.error("프로필 수정 요청 네트워크 오류:", err);
      const error = new Error(
        "서버에 연결할 수 없습니다. (네트워크/CORS 문제일 수 있습니다)"
      );
      error.cause = err;
      throw error;
    }

    const data = err.response.data ?? {};
    const statusCode = data.status ?? data.code ?? err.response.status;

    const error = new Error(
      data?.message || "이력 정보 저장 중 오류가 발생했습니다."
    );
    error.status = statusCode;
    error.data = data;
    throw error;
  }

  const data = res.data ?? null;

  if (!data) {
    const error = new Error("서버 응답이 올바르지 않습니다.");
    error.status = res.status;
    throw error;
  }

  const statusCode = data.status ?? data.code ?? res.status;

  if (statusCode !== 200) {
    const error = new Error(
      data?.message || "이력 정보 저장 중 오류가 발생했습니다."
    );
    error.status = statusCode;
    error.data = data;
    throw error;
  }

  // 예상: { code: 200, message: "...", data: null }
  return data;
}
