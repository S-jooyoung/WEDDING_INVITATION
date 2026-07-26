import type { GatsbyConfig } from "gatsby";

const config: GatsbyConfig = {
  siteMetadata: {
    title: "weddingInvitation",
    siteUrl: "https://www.yourdomain.tld",
  },

  /*
   * React 17에서 도입된 automatic JSX 런타임을 사용한다.
   *
   * Gatsby의 기본값은 여전히 classic이라, JSX를 쓰는 모든 파일이 스코프에
   * React를 가지고 있어야 한다. tsconfig의 "jsx": "react-jsx"는 타입 검사에만
   * 적용되고 번들러(Babel)는 보지 않으므로, 타입은 통과하는데 SSR 빌드에서
   * ReferenceError: React is not defined 로 터지는 불일치가 생긴다.
   */
  jsxRuntime: "automatic",

  plugins: ["gatsby-plugin-styled-components"],
};

export default config;
