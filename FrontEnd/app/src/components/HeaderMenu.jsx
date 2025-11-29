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

  const closeMenu = () => {
    if (onItemClick) onItemClick();
  };

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

  const handleGoHome = () => {
    navigate("/");
    closeMenu();
  };

  const handleMyStorageClick = () => {
    // 🔹 My 자소서 보관함 (로그인 필요)
    requireLoginThen("/mypage/store-intro");
  };

  const handlePersonalInfoClick = () => {
    // 🔹 개인정보 수정 (로그인 필요)
    requireLoginThen("/modify/PersonInfo");
  };

  const handlePasswordChangeClick = () => {
    // 🔹 비밀번호 변경 (로그인 필요)
    requireLoginThen("/modify/Password");
  };

  return (
    <MenuContainer
      id="header-menu"
      role="menu"
      aria-hidden={!open}
      open={open}
    >
      <MenuList>
        <li>
          <MenuItemButton type="button" onClick={handleGoHome}>
            홈으로
          </MenuItemButton>
        </li>

        <MenuDivider />

        <li>
          <MenuItemButton type="button" onClick={handleMyStorageClick}>
            My 자소서 보관함
          </MenuItemButton>
        </li>

        <MenuDivider />

        <li>
          <MenuItemButton type="button" onClick={handlePersonalInfoClick}>
            개인정보 수정
          </MenuItemButton>
        </li>

      </MenuList>
    </MenuContainer>
  );
}

export default HeaderMenu;
