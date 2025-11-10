// src/components/Background.jsx
import React from "react";
import styled from "styled-components";

const GradientLayer = styled.div`
  position: fixed;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(29,195,255,0.20) 0%,
                             rgba(113,189,129,0.20) 100%),
    #FFFFFF;
  z-index: 0;           /* 음수 금지 */
  pointer-events: none; /* 클릭 안 가로막게 */
`;

export default function Background() {
  return <GradientLayer aria-hidden />;
}