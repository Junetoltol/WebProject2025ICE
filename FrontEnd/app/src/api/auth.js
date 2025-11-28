// src/api/auth.js
import api from "./api";

const ACCESS_TOKEN_KEY = "accessToken";
const GRANT_TYPE_KEY = "grantType";
const USERNAME_KEY = "username";

/**
 * 내부용: 토큰 제거
 */
export function clearAuthToken() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(GRANT_TYPE_KEY);
    localStorage.removeItem(USERNAME_KEY);
  } catch (e) {
    console.error("로컬 스토리지 토큰 제거 실패:", e);
  }
}

/**
 * 내부/외부 공용: 액세스 토큰 가져오기
 */
export function getAccessToken() {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Authorization 헤더 객체 생성
 * - (axios 인터셉터에서 이미 쓰고 있지만, 다른 곳에서도 쓸 수 있게 유지)
 */
export function getAuthHeader() {
  const token = getAccessToken();
  const grantType =
    (typeof window !== "undefined" &&
      localStorage.getItem(GRANT_TYPE_KEY)) ||
    "Bearer";

  if (!token) return {};
  return {
    Authorization: `${grantType} ${token}`,
  };
}

/**
 * 현재 로그인 여부 체크
 */
export function isLoggedIn() {
  return !!getAccessToken();
}

/**
 * 로그인 API (axios 버전)
 * @param {{ username: string, password: string }} param0
 * @returns {Promise<{ status: number, message: string, data: any }>}
 */
export async function login({ username, password }) {
  let res;

  try {
    // ✅ axios 인스턴스 사용
    res = await api.post("/api/auth/login", {
      username,
      password,
    });
  } catch (err) {
    // 🔻 네트워크/서버 접속 자체가 안 될 때
    if (!err.response) {
      console.error("로그인 요청 네트워크 오류:", err);
      throw new Error(
        "서버에 연결할 수 없습니다. (네트워크/CORS 문제일 수 있습니다)"
      );
    }

    // 🔻 HTTP 400/401/500 같은 에러 응답일 때
    const json = err.response.data ?? {};
    const statusCode = json.status ?? json.code ?? err.response.status;
    const message =
      json.message || "아이디 또는 비밀번호가 일치하지 않습니다.";

    clearAuthToken();

    const error = new Error(message);
    error.status = statusCode;
    error.data = json;
    throw error;
  }

  const json = res.data ?? null;

  if (!json) {
    throw new Error("서버 응답이 올바르지 않습니다.");
  }

  const statusCode = json.status ?? json.code ?? res.status;
  const { message, data } = json;

  // 로그인 실패인 경우
  if (statusCode !== 200 || !data) {
    clearAuthToken();
    throw new Error(
      message || "아이디 또는 비밀번호가 일치하지 않습니다."
    );
  }

  const { grantType, accessToken } = data;

  if (!grantType || !accessToken) {
    clearAuthToken();
    throw new Error("로그인 응답에 토큰 정보가 없습니다.");
  }

  // ✅ 토큰 저장
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(GRANT_TYPE_KEY, grantType);
    localStorage.setItem(USERNAME_KEY, username); 
  } catch (e) {
    console.error("로컬 스토리지 저장 실패:", e);
    throw new Error("브라우저 저장소에 토큰을 저장할 수 없습니다.");
  }

  return {
    status: statusCode,
    message: message || "로그인에 성공했습니다.",
    data,
  };
}

/**
 * 회원가입 API (axios 버전)
 * @param {{ username: string, password: string, name: string, univ?: string, major?: string }} formData
 * @returns {Promise<{ message: string, data: any }>}
 */
export async function signup({
  username,
  password,
  name,
  univ,
  major,
}) {
  const payload = {
    username, // ✅ 백엔드 명세 필드명과 동일
    password,
    name,
    univ,
    major,
  };

  let res;
  try {
    res = await api.post("/api/auth/signup", payload);
  } catch (err) {
    // 네트워크 레벨 에러
    if (!err.response) {
      console.error("회원가입 요청 네트워크 오류:", err);
      throw new Error(
        "서버에 연결할 수 없습니다. (네트워크/CORS 문제일 수 있습니다)"
      );
    }

    const json = err.response.data ?? {};
    const statusCode = json.status ?? json.code ?? err.response.status;
    const message = json.message || "회원가입에 실패했습니다.";

    const error = new Error(message);
    error.status = statusCode;
    error.data = json;
    throw error;
  }

  const json = res.data ?? null;

  if (!json) {
    throw new Error("서버 응답이 올바르지 않습니다.");
  }

  const statusCode = json.status ?? json.code ?? res.status;
  const { message, data } = json;

  if (statusCode !== 200 && statusCode !== 201) {
    throw new Error(message || "회원가입에 실패했습니다.");
  }

  return {
    message: message || "회원가입이 완료되었습니다.",
    data,
  };
}
