import React from "react";
import Header from "../components/Header";
import Background from "../components/Background";


export default function Home() {
  return (
    <>
      <Background/>
      <Header />
      <main style={{ padding: "24px clamp(12px, 3vw, 32px)" }}>
        <h1>Home Page</h1>
      </main>
    </>
  );
}
