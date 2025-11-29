// src/components/HeaderMenu.jsx
import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../api/auth";

const MenuContainer = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 180px;
  padding: 8px 0;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  z-index: 200;

  display: ${(props) => (props.open ? "block" : "none")};
`;

const MenuList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const MenuItemButton = styled.button`
  width: 100%;
  padding: 10px 16px;
  background: transparent;
  border: none;
  text-align: left;
  font-size: 14px;
  color: #222;
  cursor: pointer;

  &:hover {
    background-color: #f3f6f8;
  }
`;

const MenuDivider = styled.li`
  height: 1px;
  margin: 4px 0;
  background-color: #e4e8ec;
`;

function HeaderMenu({ open, onItemClick }) {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn(); // 🔹 로그인 여부

  const closeMenu = () => {
    if (onItemClick) onItemClick();
  };

  // 로그인 필요한 메뉴 공통 헬퍼
  const requireLoginThen = (nextPath) => {
    if (!isLoggedIn()) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      closeMenu();
      return;
    }
    navigate(nextPath);
    closeMenu();
  };

  // 로그인하기
  const handleLoginClick = () => {
    navigate("/login");
    closeMenu();
  };

  const handleMyStorageClick = () => {
    requireLoginThen("/mypage/store-intro");
  };

  const handlePersonalInfoClick = () => {
    requireLoginThen("/modify/PersonInfo");
  };

  const handlePasswordChangeClick = () => {
    requireLoginThen("/modify/Password");
  };

  // 로그아웃: localStorage 비우고 홈으로
  const handleLogoutClick = () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.error("로그아웃 중 로컬스토리지 삭제 오류:", e);
    }

    alert("로그아웃 되었습니다.");
    navigate("/");   // 🔹 여기! 홈으로 이동
    closeMenu();
  };

  return (
    <MenuContainer
      id="header-menu"
      role="menu"
      aria-hidden={!open}
      open={open}
    >
      <MenuList>
        {/* 🔸 로그아웃 상태: 로그인만 표시 */}
        {!loggedIn && (
          <li>
            <MenuItemButton type="button" onClick={handleLoginClick}>
              로그인
            </MenuItemButton>
          </li>
        )}

        {/* 🔸 로그인 상태: My 자소서 / 개인정보수정 / 로그아웃만 표시 */}
        {loggedIn && (
          <>
            {/* My 자소서 보관함 */}
            <li>
              <MenuItemButton type="button" onClick={handleMyStorageClick}>
                My 자소서 보관함
              </MenuItemButton>
            </li>

            <MenuDivider />

            {/* 개인정보 수정 */}
            <li>
              <MenuItemButton type="button" onClick={handlePersonalInfoClick}>
                개인정보 수정
              </MenuItemButton>
            </li>

            {/* 비밀번호 변경까지 쓰고 싶으면 주석 해제해서 쓰면 됨 */}
            {/*
            <MenuDivider />
            <li>
              <MenuItemButton type="button" onClick={handlePasswordChangeClick}>
                비밀번호 변경
              </MenuItemButton>
            </li>
            */}

            <MenuDivider />

            {/* 로그아웃 */}
            <li>
              <MenuItemButton type="button" onClick={handleLogoutClick}>
                로그아웃
              </MenuItemButton>
            </li>
          </>
        )}
      </MenuList>
    </MenuContainer>
  );
}

export default HeaderMenu;
