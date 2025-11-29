// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import GlobalStyle from "./GlobalStyle";

import Home from "./pages/Home";
import JoinMembership from "./pages/JoinMembership";
import Login from "./pages/Login";

import PersonInfo from "./pages/modify/PersonInfo";
import Password from "./pages/modify/Password";

import StoreIntro from "./pages/mypage/StoreIntro";

import IntroConfig from "./pages/self-intro/IntroConfig";
import IntroDownload from "./pages/self-intro/IntroDownload";
import IntroInfo from "./pages/self-intro/IntroInfo";
import IntroLoading from "./pages/self-intro/IntroLoading";

export default function App() {
  return (
    <>
      <GlobalStyle />

      <Routes>
        {/* ⭐ 기본 경로: 처음 접속하면 Home.jsx가 바로 보임 */}
        <Route path="/" element={<Home />} />

        {/* 기존에 쓰던 /home도 그대로 유지하고 싶으면 추가 */}
        <Route path="/home" element={<Home />} />

        <Route path="/join" element={<JoinMembership />} />
        <Route path="/login" element={<Login />} />

        <Route path="/modify" element={<PersonInfo />} />
        <Route path="/modify/PersonInfo" element={<PersonInfo />} />
        <Route path="/modify/Password" element={<Password />} />

        <Route path="/mypage/store-intro" element={<StoreIntro />} />

        <Route path="/self-intro/config" element={<IntroConfig />} />
        <Route path="/self-intro/download" element={<IntroDownload />} />
        <Route path="/self-intro/info" element={<IntroInfo />} />
        <Route path="/self-intro/loading" element={<IntroLoading />} />

        {/* 없는 경로로 가면 Home으로 보내기 */}
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}
