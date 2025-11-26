// src/api/auth.js
import { API_BASE_URL } from "./config";

/**
 * 로그인 API
 * @param {string} id - 사용자 아이디 (username)
 * @param {string} pw - 비밀번호
 * @returns {Promise<{ message: string, data: any }>}
 * @throws {Error} - 로그인 실패 시 에러 발생
 */
export async function login(id, pw) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // 🔹 백엔드 명세에 맞춰서 필드명 사용 (username / password)
    body: JSON.stringify({
      username: id,
      password: pw,
    }),
  });

  // JSON 파싱 (에러나도 undefined로 처리)
  const json = await res.json().catch(() => null);

  // 응답이 아예 없으면
  if (!json) {
    throw new Error("서버 응답이 올바르지 않습니다.");
  }

  // 상태 코드(백엔드가 status 또는 code 중 무엇을 쓰는지 모르니 둘 다 대응)
  const statusCode = json.status ?? json.code;
  const { message, data } = json;

  if (!res.ok || statusCode !== 200 || !data) {
    // 서버가 내려준 메시지가 있으면 그걸 우선 사용
    throw new Error(message || "아이디 또는 비밀번호가 일치하지 않습니다.");
  }

  const { tokenType, accessToken } = data;

  if (!tokenType || !accessToken) {
    throw new Error("로그인 응답에 토큰 정보가 없습니다.");
  }

  // 🔐 토큰 저장 (나중에 Authorization 헤더에 사용)
  const authToken = `${tokenType} ${accessToken}`; // 예: "Bearer xxxxx"
  localStorage.setItem("authToken", authToken);

  // Login.jsx에서 { message } 구조분해 해서 사용 예정
  return { message: message || "로그인에 성공했습니다.", data };
}

// src/api/auth.js 에서 login 함수 밑에 추가

/**
 * 회원가입 API
 * @param {Object} formData - { userId, password, name, univ, major }
 * @returns {Promise<{ message: string, data: any }>}
 * @throws {Error} - 회원가입 실패 시 에러 발생
 */
export async function signup(formData) {
  const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // 🔹 API 명세서에 맞게 그대로 전달 (userId, password, name, univ, major)
    body: JSON.stringify(formData),
  });

  const json = await res.json().catch(() => null);

  if (!json) {
    throw new Error("서버 응답이 올바르지 않습니다.");
  }

  const statusCode = json.status ?? json.code ?? res.status;
  const { message, data } = json;

  // 보통 회원가입은 200 또는 201일 것이라 둘 다 허용
  if (!res.ok || (statusCode !== 200 && statusCode !== 201)) {
    throw new Error(message || "회원가입에 실패했습니다.");
  }

  // 회원가입은 토큰을 굳이 저장하지 않는다고 가정
  return { message: message || "회원가입이 완료되었습니다.", data };
}
