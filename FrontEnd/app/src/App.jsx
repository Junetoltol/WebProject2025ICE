// src/App.jsx (또는 너가 쓰는 메인 컴포넌트 파일)

import { Routes, Route } from "react-router-dom";

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

import GlobalStyle from "./GlobalStyle";

export default function App() {
  return (
    <>
      <GlobalStyle />
      <Routes>
        {/* 처음 접속(/)해도, /home으로 와도 둘 다 Home */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        <Route path="/join" element={<JoinMembership />} />
        <Route path="/login" element={<Login />} />
        <Route path="/modify" element={<PersonInfo />} />
        <Route path="/modify/PersonInfo" element={<PersonInfo />} />
        <Route path="/modify/Password" element={<Password />} />

<Route path="/mypage/store-intro" element={<StoreIntro />} />
<Route path="/self-intro/store" element={<StoreIntro />} />  {/* 🔹 이 줄 추가 */}

        <Route path="/self-intro/config" element={<IntroConfig />} />
        <Route path="/self-intro/download" element={<IntroDownload />} />
        <Route path="/self-intro/info" element={<IntroInfo />} />
        <Route path="/self-intro/loading" element={<IntroLoading />} />
      </Routes>
    </>
  );
}

/*
  return (
    <>
      <GlobalStyle />

      {isMenuPage ? (
        // 처음 화면: 버튼 메뉴만 보임
        <Menu />
      ) : (
        // 다른 경로일 때: 페이지 내용만 보임
        <Routes>
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

          <Route path="*" element={<Menu />} />
        </Routes>
      )}
    </>
  );*/
