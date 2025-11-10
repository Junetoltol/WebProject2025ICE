import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import JoinMembership from "./pages/JoinMembership";
import Login from "./pages/Login";
import ModifyPersonalInfo from "./pages/ModifyPersonalInfo";

import StoreIntro from "./pages/mypage/StoreIntro";

import IntroConfig from "./pages/self-intro/IntroConfig";
import IntroDownload from "./pages/self-intro/IntroDownload";
import IntroInfo from "./pages/self-intro/IntroInfo";
import IntroLoading from "./pages/self-intro/IntroLoading";

import GlobalStyle from "./GlobalStyle";

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
          <Route path="/modify" element={<ModifyPersonalInfo />} />

          <Route path="/mypage/store-intro" element={<StoreIntro />} />

          <Route path="/self-intro/config" element={<IntroConfig />} />
          <Route path="/self-intro/download" element={<IntroDownload />} />
          <Route path="/self-intro/info" element={<IntroInfo />} />
          <Route path="/self-intro/loading" element={<IntroLoading />} />

          <Route path="*" element={<Menu />} />
        </Routes>
      )}
    </>
  );
}
