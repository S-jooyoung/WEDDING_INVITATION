import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useToast } from "@/components/ui/Toast";
import {
  act,
  fireEvent,
  render,
  renderWithProviders,
  screen,
} from "@/test/render";

function Trigger({ message = "계좌번호가 복사되었습니다." }) {
  const { showToast } = useToast();

  return (
    <button type="button" onClick={() => showToast(message)}>
      복사
    </button>
  );
}

describe("ToastProvider", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("알림 영역을 처음부터 렌더링해 둔다", () => {
    renderWithProviders(<Trigger />);

    /*
     * 영역을 나중에 삽입하면 일부 스크린 리더가 변경을 감지하지 못한다.
     * 비어 있더라도 live region은 항상 존재해야 한다.
     */
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("알림을 aria-live 영역에 노출한다", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Trigger />);

    await user.click(screen.getByRole("button", { name: "복사" }));

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("계좌번호가 복사되었습니다.");
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("같은 문구를 연달아 알려도 매번 새 노드로 교체한다", () => {
    renderWithProviders(<Trigger />);
    const button = screen.getByRole("button", { name: "복사" });

    fireEvent.click(button);
    const first = screen.getByRole("status").firstElementChild;

    fireEvent.click(button);
    const second = screen.getByRole("status").firstElementChild;

    /*
     * 문구만 상태에 두면 같은 값에서 React가 리렌더를 건너뛰어 DOM이 그대로
     * 남는다. 스크린 리더는 live region의 변경을 신호로 읽으므로, 노드가
     * 바뀌지 않으면 두 번째 복사부터 아무것도 읽지 않는다.
     * 계좌를 연달아 복사하는 것이 이 화면의 정상 흐름이다.
     */
    expect(first).not.toBeNull();
    expect(second).not.toBe(first);
    expect(screen.getByRole("status")).toHaveTextContent(
      "계좌번호가 복사되었습니다.",
    );
  });

  it("일정 시간이 지나면 알림을 지운다", () => {
    vi.useFakeTimers();
    renderWithProviders(<Trigger />);

    /* userEvent는 내부적으로 실제 타이머를 기다리므로 여기서는 fireEvent를 쓴다. */
    fireEvent.click(screen.getByRole("button", { name: "복사" }));
    expect(screen.getByRole("status")).toHaveTextContent("복사되었습니다");

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });
});

describe("useToast", () => {
  it("Provider 밖에서 호출하면 원인을 알려주며 실패한다", () => {
    /* 콘솔에 찍히는 React 에러 경계 로그를 테스트 출력에서 감춘다. */
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => render(<Trigger />)).toThrow(
      /ToastProvider 안에서만 사용할 수 있습니다/,
    );

    consoleError.mockRestore();
  });
});
