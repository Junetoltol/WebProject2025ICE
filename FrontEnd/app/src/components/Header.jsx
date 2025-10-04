import React, { useEffect, useRef, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { Link } from "react-router-dom";
import HeaderMenu from "./HeaderMenu";

import homeIcon from "../assets/homeButton.svg";
import menuIcon from "../assets/menuButton.svg";
import STCaiyunTTF from "../assets/fonts/STCaiyun/STCaiyun.ttf";

const FontFace = createGlobalStyle`
  @font-face {
    font-family: "STCaiyun";
    src: local("STCaiyun"), url(${STCaiyunTTF}) format("truetype");
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
`;
const CleanLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: inline-flex;
  align-items: center;
`;

const HeaderWrap = styled.header`
  position: relative; /* 드롭다운 기준점 */
  height: 80px;
  min-height: 60px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 clamp(12px, 3vw, 32px);
  box-sizing: border-box;
  z-index: 10;
`;

const Title = styled.h1`
  grid-column: 2;
  margin: 0;
  font-family: "STCaiyun", system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans",
    "Apple SD Gothic Neo", "Malgun Gothic", "Helvetica Neue", Arial, sans-serif;
  font-size: clamp(28px, 5vw, 50px);
  line-height: 1;
  font-weight: 400;
  white-space: nowrap;
  text-align: center;
  cursor: pointer;
`;

const Accent = styled.span` color: #00678c; `;
const Rest   = styled.span` color: #000; `;

const Actions = styled.nav`
  grid-column: 3;
  justify-self: end;
  display: flex;
  gap: clamp(8px, 2vw, 16px);
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const IconImg = styled.img`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: block;
`;

const MenuAnchor = styled.div`
  position: relative; /* 드롭다운 기준점: 이 컨테이너 */
  display: inline-flex;
  align-items: center;
`;

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const anchorRef = useRef(null); // ✅ 메뉴용 앵커 기준

  const toggleMenu = () => setMenuOpen(v => !v);
  const closeMenu  = () => setMenuOpen(false);

  useEffect(() => {
    function handleOutside(e) {
      if (!anchorRef.current) return;
      if (!anchorRef.current.contains(e.target)) closeMenu();
    }
    // pointerdown이 가장 안정적 (mousedown/click 순서 이슈 방지)
    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, []);


    return (
    <>
      <FontFace />

      <HeaderWrap>
        <div aria-hidden="true" />

        {/* 제목 클릭 → 홈 이동 */}
        <CleanLink to="/" aria-label="Go Home via Title">
          <Title aria-label="Job Buddy">
            <Accent>J</Accent>
            <Rest>ob </Rest>
            <Accent>B</Accent>
            <Rest>uddy</Rest>
          </Title>
        </CleanLink>

        <Actions aria-label="Header actions">
          {/* 홈 아이콘 클릭 → 홈 이동 */}
          <CleanLink to="/" aria-label="Go Home via Icon">
            <IconButton>
              <IconImg src={homeIcon} alt="" />
            </IconButton>
          </CleanLink>

          {/* 메뉴 아이콘은 그대로 */}
 {/* ✅ 메뉴 버튼과 드롭다운을 하나의 앵커 컨테이너로 */}
          <MenuAnchor ref={anchorRef}>
            <IconButton
              aria-label="Open Menu"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls="header-menu"
              onClick={toggleMenu}
            >
              <IconImg src={menuIcon} alt="메뉴" />
            </IconButton>

            {/* 버튼 바로 아래에 메뉴 출력 */}
            <HeaderMenu open={menuOpen} onItemClick={closeMenu} />
          </MenuAnchor>
        </Actions>
      </HeaderWrap>
    </>
  );
}