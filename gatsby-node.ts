import path from "node:path";
import type { GatsbyNode } from "gatsby";

/**
 * tsconfig의 `@/*` path alias를 webpack에도 동일하게 등록한다.
 *
 * tsconfig의 paths는 타입 검사에만 쓰이고 번들러는 알지 못하므로,
 * 이 설정이 없으면 타입은 통과하는데 빌드에서 모듈을 찾지 못한다.
 */
export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = ({
  actions,
}) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  });
};
