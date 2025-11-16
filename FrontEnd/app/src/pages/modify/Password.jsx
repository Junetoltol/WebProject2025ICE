// src/pages/modify/Password.jsx
import React from "react";
import Header from "../../components/Header";
import Background from "../../components/Background";

export default function Password() {
  return (
    <>
      <Header />
      <Background />

      <main
        style={{
          padding: "24px clamp(12px, 3vw, 32px)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <h1>비밀번호 변경</h1>
      </main>
    </>
  );
}
