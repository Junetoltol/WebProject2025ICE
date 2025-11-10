// src/components/Header.jsx
import React, { useEffect, useRef, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { Link } from "react-router-dom";
import HeaderMenu from "./HeaderMenu";

import homeIcon from "../assets/homeButton.svg";
import menuIcon from "../assets/menuButton.svg";
import STCaiyunTTF from "../assets/fonts/STCaiyun/STCaiyun.ttf";

/* STCaiyun 폰트 로드 */
const FontFace = createGlobalStyle`
  @font-face {
    font-family: "STCaiyun";
    src: local("STCaiyun"), url(${STCaiyunTTF}) format("truetype");
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
`;

/* 외부 링크 기본 스타일 제거 */
const CleanLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: inline-flex;
  align-items: center;
`;

/* ===== 헤더 핵심: 화면 상단 고정 + 전체 폭 채우기 ===== */
export const HEADER_H = 80;

const HeaderWrap = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;          /* 가로 전체 */
  height: ${HEADER_H}px;
  min-height: 60px;

  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;

  padding: 0 clamp(12px, 3vw, 32px);
  margin: 0;         /* 혹시 모를 기본 마진 제거 */
  box-sizing: border-box;

  /* 배경: 흰색(캡쳐처럼) — 필요하면 투명/반투명으로 바꿔도 됨 */
  background-color: #ffffff;

  /* 다른 콘텐츠 위에 올라오도록 충분히 크게 */
  z-index: 100;

  /* 헤더 아래에 살짝 그림자(선택) — 필요 없으면 삭제 */
  /* box-shadow: 0 1px 8px rgba(0,0,0,0.06); */
`;

/* 타이틀 */
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
const Rest   = styled.span` color: #000;   `;

/* 우측 액션 영역 */
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

/* 드롭다운 기준 앵커 */
const MenuAnchor = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const anchorRef = useRef(null);

  const toggleMenu = () => setMenuOpen(v => !v);
  const closeMenu  = () => setMenuOpen(false);

  useEffect(() => {
    function handleOutside(e) {
      if (!anchorRef.current) return;
      if (!anchorRef.current.contains(e.target)) closeMenu();
    }
    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, []);

  return (
    <>
      <FontFace />

      <HeaderWrap>
        {/* 좌측 공간(그리드용) */}
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

        {/* 우측 아이콘들 */}
        <Actions aria-label="Header actions">
          <CleanLink to="/" aria-label="Go Home via Icon">
            <IconButton>
              <IconImg src={homeIcon} alt="" />
            </IconButton>
          </CleanLink>

          {/* 메뉴 버튼 & 드롭다운 */}
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

            <HeaderMenu open={menuOpen} onItemClick={closeMenu} />
          </MenuAnchor>
        </Actions>
      </HeaderWrap>
    </>
  );
}
