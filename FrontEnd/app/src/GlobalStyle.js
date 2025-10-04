import { createGlobalStyle } from "styled-components";
import STCaiyunTTF from "./assets/fonts/STCaiyun/STCaiyun.ttf";

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: "STCaiyun";
    src:
      local("STCaiyun"),
      url(${STCaiyunTTF}) format("truetype");
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
`;

export default GlobalStyle;
