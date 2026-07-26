import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { renderWithProviders, screen } from "@/test/render";

function Exploding(): never {
  throw new Error("서드파티 SDK 실패");
}

let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  /* React가 경계에서 잡은 오류를 콘솔에도 찍으므로 출력만 가린다. */
  consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  consoleError.mockRestore();
});

describe("ErrorBoundary", () => {
  it("자식이 정상이면 그대로 보여 준다", () => {
    renderWithProviders(
      <ErrorBoundary>
        <p>청첩장 본문</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText("청첩장 본문")).toBeInTheDocument();
  });

  it("자식이 예외를 던지면 흰 화면 대신 안내를 보여 준다", () => {
    renderWithProviders(
      <ErrorBoundary>
        <Exploding />
      </ErrorBoundary>,
    );

    /*
     * 경계가 없으면 React가 트리 전체를 언마운트해 흰 화면만 남는다.
     * 하객은 예식장 위치도 계좌번호도 볼 수 없고 원인도 알 수 없다.
     */
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "새로고침" }),
    ).toBeInTheDocument();
  });

  it("추적할 수 있도록 오류를 콘솔에 남긴다", () => {
    renderWithProviders(
      <ErrorBoundary>
        <Exploding />
      </ErrorBoundary>,
    );

    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining("청첩장 렌더링 중 오류"),
      expect.any(Error),
      expect.anything(),
    );
  });
});
