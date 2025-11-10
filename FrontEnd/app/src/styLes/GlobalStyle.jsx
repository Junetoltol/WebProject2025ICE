// src/styles/GlobalStyle.jsx
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  html, body, #root { height: 100%; margin: 0; padding: 0; }
  *, *::before, *::after { box-sizing: border-box; }
  body { background: #fff; }
  /* 루트에 스택 컨텍스트 생성 (z-index 계산 안정화) */
  #root { position: relative; isolation: isolate; }
`;

export default GlobalStyle;