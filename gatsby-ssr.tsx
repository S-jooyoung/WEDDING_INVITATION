import type { GatsbySSR } from "gatsby";
import { RootProvider } from "./src/providers/RootProvider";

export const wrapRootElement: GatsbySSR["wrapRootElement"] = ({ element }) => (
  <RootProvider>{element}</RootProvider>
);

/**
 * 한국어 문서임을 명시한다.
 *
 * lang이 없으면 스크린 리더가 문서를 영어로 읽으려 시도해 한글 발음이
 * 뭉개지고, 브라우저 번역 기능도 원어를 잘못 판단한다.
 */
export const onRenderBody: GatsbySSR["onRenderBody"] = ({
  setHtmlAttributes,
}) => {
  setHtmlAttributes({ lang: "ko" });
};
