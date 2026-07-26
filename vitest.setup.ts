import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

/**
 * jsdom이 구현하지 않는 브라우저 API를 채운다.
 *
 * 이 프로젝트는 스크롤 진입 애니메이션과 반응형 분기에 두 API를 쓰는데,
 * jsdom에는 존재하지 않아 참조하는 순간 테스트가 죽는다.
 */
vi.stubGlobal(
  "IntersectionObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds: readonly number[] = [];
  },
);

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
});
