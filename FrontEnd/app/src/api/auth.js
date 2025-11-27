// src/api/auth.js
import { API_BASE_URL } from "./config";

/**
 * 로그인 API
 */
export async function login({ username, password }) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const json = await res.json().catch(() => null);

  if (!json) {
    throw new Error("서버 응답이 올바르지 않습니다.");
  }

  const statusCode = json.status ?? json.code ?? res.status;
  const { message, data } = json;

  if (!res.ok || statusCode !== 200 || !data) {
    throw new Error(message || "아이디 또는 비밀번호가 일치하지 않습니다.");
  }

  const { grantType, accessToken } = data;

  if (!grantType || !accessToken) {
    throw new Error("로그인 응답에 토큰 정보가 없습니다.");
  }

  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("grantType", grantType);

  return {
    status: statusCode,
    message: message || "로그인에 성공했습니다.",
    data,
  };
}

/**
 * 회원가입 API
 * @param {{ username: string, password: string, name: string, univ?: string, major?: string }} formData
 */
export async function signup({ username, password, name, univ, major }) {
  const payload = {
    username, // ✅ 이제 그대로 넘김
    password,
    name,
    univ,
    major,
  };

  let res;
  try {
    res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("네트워크 레벨에서 요청 실패:", err);
    throw new Error("서버에 연결할 수 없습니다. (네트워크/CORS 문제일 수 있습니다)");
  }

  const json = await res.json().catch(() => null);

  if (!json) {
    throw new Error("서버 응답이 올바르지 않습니다.");
  }

  const statusCode = json.status ?? json.code ?? res.status;
  const { message, data } = json;

  if (!res.ok || (statusCode !== 200 && statusCode !== 201)) {
    throw new Error(message || "회원가입에 실패했습니다.");
  }

  return { message: message || "회원가입이 완료되었습니다.", data };
}
