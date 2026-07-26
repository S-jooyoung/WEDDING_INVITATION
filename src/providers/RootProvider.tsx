import type { ReactNode } from "react";
import { ThemeProvider } from "styled-components";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/ui";
import { GlobalStyle } from "@/styles/GlobalStyle";
import { theme } from "@/styles/theme";

/**
 * 브라우저와 SSR 양쪽에서 동일하게 감싸는 루트 Provider.
 *
 * gatsby-browser와 gatsby-ssr이 같은 트리를 쓰지 않으면 서버가 그린 마크업과
 * 클라이언트가 그린 마크업이 어긋나 hydration이 깨진다.
 */
export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {/* 대체 화면도 테마를 써야 하므로 ThemeProvider 안쪽에 둔다. */}
      <ErrorBoundary>
        <ToastProvider>{children}</ToastProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
