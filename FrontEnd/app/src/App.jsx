import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import JoinMembership from "./pages/JoinMembership";
import Login from "./pages/Login";
import ModifyPersonalInfo from "./pages/ModifyPersonalInfo";

import StoreIntro from "./pages/mypage/StoreIntro";
import StoreResume from "./pages/mypage/StoreResume";

import ResumeDownload from "./pages/resume/ResumeDownload";
import ResumeInfo from "./pages/resume/ResumeInfo";
import ResumeLoading from "./pages/resume/ResumeLoading";
import ResumeTemp from "./pages/resume/ResumeTemp";

import IntroConfig from "./pages/self-intro/IntroConfig";
import IntroDownload from "./pages/self-intro/IntroDownload";
import IntroInfo from "./pages/self-intro/IntroInfo";
import IntroLoading from "./pages/self-intro/IntroLoading";

// 버튼 메뉴
function Menu() {
  const navigate = useNavigate();
  const go = (path) => () => navigate(path);

  return (
    <div style={{ display: "grid", gap: 8, padding: 16 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={go("/home")}>Home</button>
        <button onClick={go("/join")}>Join_membership</button>
        <button onClick={go("/login")}>Login</button>
        <button onClick={go("/modify")}>Modify_personal_info</button>
      </div>

      <hr />

      <strong>mypage</strong>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={go("/mypage/store-intro")}>store_intro</button>
        <button onClick={go("/mypage/store-resume")}>store_resume</button>
      </div>

      <strong>resume</strong>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={go("/resume/download")}>resume_download</button>
        <button onClick={go("/resume/info")}>resume_info</button>
        <button onClick={go("/resume/loading")}>resume_loading</button>
        <button onClick={go("/resume/temp")}>resume_temp</button>
      </div>

      <strong>self_intro</strong>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={go("/self-intro/config")}>intro_config</button>
        <button onClick={go("/self-intro/download")}>intro_download</button>
        <button onClick={go("/self-intro/info")}>intro_info</button>
        <button onClick={go("/self-intro/loading")}>intro_loading</button>
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const isMenuPage = location.pathname === "/"; // 처음 시작 화면 (버튼만 보이게)

  return (
    <>
      {isMenuPage ? (
        // 처음 화면: 버튼 메뉴만 보임
        <Menu />
      ) : (
        // 다른 경로일 때: 페이지 내용만 보임
        <Routes>
          {/* pages 바로 아래 */}
          <Route path="/home" element={<Home />} />
          <Route path="/join" element={<JoinMembership />} />
          <Route path="/login" element={<Login />} />
          <Route path="/modify" element={<ModifyPersonalInfo />} />

          {/* /mypage/* */}
          <Route path="/mypage/store-intro" element={<StoreIntro />} />
          <Route path="/mypage/store-resume" element={<StoreResume />} />

          {/* /resume/* */}
          <Route path="/resume/download" element={<ResumeDownload />} />
          <Route path="/resume/info" element={<ResumeInfo />} />
          <Route path="/resume/loading" element={<ResumeLoading />} />
          <Route path="/resume/temp" element={<ResumeTemp />} />

          {/* /self-intro/* */}
          <Route path="/self-intro/config" element={<IntroConfig />} />
          <Route path="/self-intro/download" element={<IntroDownload />} />
          <Route path="/self-intro/info" element={<IntroInfo />} />
          <Route path="/self-intro/loading" element={<IntroLoading />} />

          {/* 잘못된 경로 → 메뉴로 돌아가기 */}
          <Route path="*" element={<Menu />} />
        </Routes>
      )}
    </>
  );
}
