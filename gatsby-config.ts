import type { GatsbyConfig } from "gatsby";
import { siteConfig } from "./src/config/site";

const config: GatsbyConfig = {
  /*
   * 사이트 메타데이터의 출처를 src/config/site.ts 하나로 둔다.
   * 여기에 값을 따로 적으면 제목과 주소의 진실이 두 곳으로 갈라진다.
   */
  siteMetadata: {
    title: siteConfig.title,
    description: siteConfig.description,
    siteUrl: siteConfig.url,
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

  plugins: [
    "gatsby-plugin-styled-components",
    {
      /*
       * 파비콘과 홈 화면 아이콘.
       *
       * src/images/icon.png는 예전부터 저장소에 있었지만 어떤 플러그인도
       * 참조하지 않아, 브라우저 탭에는 Gatsby 기본 아이콘이 떴다.
       */
      resolve: "gatsby-plugin-manifest",
      options: {
        name: siteConfig.title,
        short_name: "청첩장",
        description: siteConfig.description,
        lang: "ko",
        start_url: "/",
        background_color: "#efebe9",
        theme_color: "#efebe9",
        display: "standalone",
        icon: "src/images/icon.png",
      },
    },
  ],
};

export default config;
