import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

function stubClipboard(writeText: () => Promise<void>) {
  vi.stubGlobal("isSecureContext", true);
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: vi.fn(writeText) },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  Reflect.deleteProperty(navigator, "clipboard");
});

describe("useCopyToClipboard", () => {
  it("Clipboard API로 복사하고 성공을 알린다", async () => {
    stubClipboard(() => Promise.resolve());
    const { result } = renderHook(() => useCopyToClipboard());

    await expect(result.current.copy("○○은행 123-456")).resolves.toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "○○은행 123-456",
    );
  });

  it("Clipboard API가 거부되면 execCommand로 폴백한다", async () => {
    stubClipboard(() => Promise.reject(new Error("권한 거부")));
    const execCommand = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execCommand,
    });

    const { result } = renderHook(() => useCopyToClipboard());

    await expect(result.current.copy("계좌번호")).resolves.toBe(true);
    expect(execCommand).toHaveBeenCalledWith("copy");
  });

  it("보안 컨텍스트가 아니면 Clipboard API를 건너뛴다", async () => {
    stubClipboard(() => Promise.resolve());
    vi.stubGlobal("isSecureContext", false);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn().mockReturnValue(true),
    });

    const { result } = renderHook(() => useCopyToClipboard());

    await expect(result.current.copy("계좌번호")).resolves.toBe(true);
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it("모든 경로가 실패하면 false를 반환한다", async () => {
    stubClipboard(() => Promise.reject(new Error("권한 거부")));
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn().mockReturnValue(false),
    });

    const { result } = renderHook(() => useCopyToClipboard());

    /*
     * 호출부가 성공 여부를 알 수 있어야 한다. 기존 구현은 실패해도
     * "복사되었습니다" 토스트를 띄웠다.
     */
    await expect(result.current.copy("계좌번호")).resolves.toBe(false);
  });

  it("폴백에 쓴 임시 요소를 실패해도 정리한다", async () => {
    stubClipboard(() => Promise.reject(new Error("권한 거부")));
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn().mockImplementation(() => {
        throw new Error("지원하지 않음");
      }),
    });

    const { result } = renderHook(() => useCopyToClipboard());
    await result.current.copy("계좌번호");

    expect(document.querySelector("textarea")).toBeNull();
  });
});
