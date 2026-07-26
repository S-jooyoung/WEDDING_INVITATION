/**
 * 정적 에셋 import에 대한 모듈 선언.
 *
 * Gatsby(webpack)와 Vitest(Vite) 모두 아래 확장자를 URL 문자열로 변환해
 * 넘겨주지만, TypeScript는 이를 알지 못하므로 명시적으로 선언한다.
 */

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.mp4" {
  const src: string;
  export default src;
}

declare module "*.mp3" {
  const src: string;
  export default src;
}

declare module "*.woff" {
  const src: string;
  export default src;
}

declare module "*.woff2" {
  const src: string;
  export default src;
}
