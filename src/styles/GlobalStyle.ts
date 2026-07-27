import { createGlobalStyle } from "styled-components";
import Handwriting from "@/assets/fonts/mom_to_daughter.subset.woff2";

export const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: "mom_to_daughter";
    /*
     * woff2만 제공한다. woff 폴백은 2017년 이전 브라우저를 위한 것인데,
     * 브라우저는 woff2를 지원하면 woff를 아예 받지 않으므로 사실상 아무도
     * 내려받지 않는 3.6MB가 저장소에만 남아 있었다.
     */
    src: url(${Handwriting}) format("woff2");
    font-weight: normal;
    font-style: normal;
    /* 폰트를 받는 동안 대체 글꼴로 먼저 그린다. 텍스트가 보이지 않는 구간을 없앤다. */
    font-display: swap;
    /* 한글 음절 영역에만 적용해 다른 문자 때문에 폰트를 받는 일을 막는다. */
    unicode-range: U+0020-007E, U+3131-3163, U+AC00-D7A3, U+2018-201D, U+300C-300F;
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

  /*
   * Safari는 list-style: none인 목록에서 list role을 제거한다. 이 청첩장의
   * 주 유입 경로가 iOS 인앱 브라우저이므로, 마커를 지우면 "사진 6장"이나
   * 교통편 항목 수 같은 정보가 통째로 사라진다.
   * 마커를 지우는 목록에는 반드시 role="list"를 함께 붙인다.
   */
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
