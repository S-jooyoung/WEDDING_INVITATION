import {
  render,
  type RenderOptions,
  type RenderResult,
} from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { ThemeProvider } from "styled-components";
import { ToastProvider } from "@/components/ui";
import { theme } from "@/styles/theme";

function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}

/**
 * 앱과 같은 Provider 트리 안에서 렌더한다.
 *
 * styled-components는 theme가 없으면 토큰 접근에서 터지므로, 테스트마다
 * ThemeProvider를 손으로 감싸는 대신 여기서 한 번에 제공한다.
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
): RenderResult {
  return render(ui, { wrapper: Providers, ...options });
}

export * from "@testing-library/react";
