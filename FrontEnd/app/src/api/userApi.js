// src/api/userApi.js

// 비밀번호 변경 API
// 백엔드 명세서:
// PATCH /api/users/me/password
// Authorization: Bearer {JWT}
export async function changePassword({
  token,
  username,
  currentPassword,
  newPassword,
  confirmPassword,
}) {
  const response = await fetch("/api/users/me/password", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      username,
      currentPassword,
      newPassword,
      confirmPassword,
    }),
  });

  // 응답 JSON 파싱 (body가 비어 있을 수도 있으니 try)
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // 에러 객체에 상태 코드와 백엔드 메시지도 같이 담아서 던짐
    const error = new Error(data?.message || "비밀번호 변경 중 오류가 발생했습니다.");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data; // { code: 200, message: "비밀번호가 성공적으로 변경되었습니다." } 형태 예상
}
