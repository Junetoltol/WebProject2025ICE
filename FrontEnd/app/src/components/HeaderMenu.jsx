// app/src/components/HeaderMenu.jsx
import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const MenuWrap = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 150px;
  height: 180px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.16);
  overflow: hidden;
  z-index: 2000;
  display: ${props => (props.open ? "block" : "none")};
`;

const Item = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;   /* 3등분(60px x 3) */
  text-decoration: none;
  color: #222;
  font-weight: 500;
  font-size: 14px;
  &:hover { background: #f5f5f5; }
`;

export default function HeaderMenu({ open, onItemClick }) {
  return (
    <MenuWrap open={open} role="menu" aria-hidden={!open} id="header-menu">
      {/* 1) 로그인 */}
      <Item to="/login" onClick={onItemClick}>로그인</Item>

      {/* 2) My 자소서 보관함 */}
      <Item to="/mypage/store-intro" onClick={onItemClick}>My 자소서 보관함</Item>

      {/* 3) 개인정보 수정 */}
      <Item to="/modify" onClick={onItemClick}>개인정보 수정</Item>
    </MenuWrap>
  );
}
