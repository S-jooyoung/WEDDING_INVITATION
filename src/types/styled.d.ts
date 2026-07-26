import "styled-components";
import type { Theme } from "@/styles/theme";

/**
 * styled-components의 기본 테마 타입을 이 프로젝트의 토큰으로 좁힌다.
 * 이 선언이 없으면 props.theme가 빈 객체 타입이라 오타를 잡지 못한다.
 */
declare module "styled-components" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends Theme {}
}
