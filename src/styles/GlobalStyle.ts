import { createGlobalStyle } from "styled-components";
import HandwritingWoff from "@/assets/fonts/mom_to_daughter.woff";
import HandwritingWoff2 from "@/assets/fonts/mom_to_daughter.woff2";

export const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: "mom_to_daughter";
    src: url(${HandwritingWoff2}) format("woff2"),
         url(${HandwritingWoff}) format("woff");
    font-weight: normal;
    font-style: normal;
    /* 폰트를 받는 동안 대체 글꼴로 먼저 그린다. 텍스트가 보이지 않는 구간을 없앤다. */
    font-display: swap;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    /* 사용자가 브라우저 기본 글자 크기를 키웠다면 그대로 따른다. */
    -webkit-text-size-adjust: 100%;
  }

  body {
    margin: 0;
    background-color: ${({ theme }) => theme.color.background};
    color: ${({ theme }) => theme.color.text};
    font-family: ${({ theme }) => theme.font.body};
    line-height: 1.75;
    word-break: keep-all;
    overflow-wrap: break-word;
  }

  h1, h2, h3, p, figure, blockquote {
    margin: 0;
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  img, video {
    display: block;
    max-width: 100%;
  }

  button {
    font: inherit;
    color: inherit;
  }

  /*
   * 키보드 사용자에게만 포커스 링을 보인다.
   * 기본 outline을 지우고 대체 스타일을 주지 않으면 키보드로 현재 위치를
   * 알 수 없게 되므로, 지우는 대신 또렷하게 바꾼다.
   */
  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.focusRing};
    outline-offset: 2px;
    border-radius: 2px;
  }

  /*
   * 전정기관 장애가 있는 사용자는 큰 움직임에 어지럼증·구역감을 겪는다.
   * OS에서 "동작 줄이기"를 켠 사용자에게는 모든 전환을 사실상 제거한다.
   */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;
