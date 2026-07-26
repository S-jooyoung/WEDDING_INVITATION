import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Gift } from "@/components/sections/Gift";
import { renderWithProviders, screen, within } from "@/test/render";

const writeText = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  vi.stubGlobal("isSecureContext", true);
});

/**
 * userEvent 세션을 열고 클립보드를 우리 mock으로 바꾼다.
 *
 * userEvent.setup()은 copy/paste 시뮬레이션을 위해 navigator.clipboard를
 * 자체 스텁으로 교체한다. beforeEach에서 먼저 mock을 심어도 setup()이
 * 그 위를 덮어쓰므로, 반드시 setup() 이후에 다시 정의해야 한다.
 */
function setupUser() {
  const user = userEvent.setup();
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
  return user;
}

afterEach(() => {
  vi.unstubAllGlobals();
  writeText.mockClear();
  Reflect.deleteProperty(navigator, "clipboard");
});

describe("Gift", () => {
  it("신랑측·신부측 버튼을 키보드로 접근 가능한 button으로 노출한다", () => {
    renderWithProviders(<Gift />);

    /*
     * 기존 구현은 styled.div에 onClick만 달아, 계좌번호에 이르는 유일한
     * 경로가 마우스 클릭이었다. 키보드 사용자는 도달할 수 없었다.
     */
    expect(
      screen.getByRole("button", { name: /신랑측 계좌번호 확인/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /신부측 계좌번호 확인/ }),
    ).toBeInTheDocument();
  });

  it("버튼을 누르면 해당 측 계좌 목록이 담긴 모달이 열린다", async () => {
    const user = setupUser();
    renderWithProviders(<Gift />);

    await user.click(
      screen.getByRole("button", { name: /신랑측 계좌번호 확인/ }),
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAccessibleName("신랑측 계좌번호");
    /* 아버지 · 어머니 · 신랑 세 항목 */
    expect(
      within(dialog).getAllByRole("button", { name: /복사$/ }),
    ).toHaveLength(3);
  });

  it("한 번에 한 쪽 모달만 열린다", async () => {
    const user = setupUser();
    renderWithProviders(<Gift />);

    await user.click(
      screen.getByRole("button", { name: /신랑측 계좌번호 확인/ }),
    );
    await user.keyboard("{Escape}");
    await user.click(
      screen.getByRole("button", { name: /신부측 계좌번호 확인/ }),
    );

    /*
     * 열림 상태를 boolean 두 개가 아니라 "열린 그룹 하나"로 표현하므로
     * 두 모달이 동시에 뜨는 상태 자체가 만들어질 수 없다.
     */
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(screen.getByRole("dialog")).toHaveAccessibleName("신부측 계좌번호");
  });

  it("계좌번호를 누르면 은행명과 함께 클립보드에 복사한다", async () => {
    const user = setupUser();
    renderWithProviders(<Gift />);

    await user.click(
      screen.getByRole("button", { name: /신랑측 계좌번호 확인/ }),
    );
    const dialog = screen.getByRole("dialog");
    const [firstAccount] = within(dialog).getAllByRole("button", {
      name: /복사$/,
    });
    await user.click(firstAccount as HTMLElement);

    expect(writeText).toHaveBeenCalledWith(expect.stringMatching(/^○○은행 /));
  });

  it("복사에 성공하면 스크린 리더에도 결과를 알린다", async () => {
    const user = setupUser();
    renderWithProviders(<Gift />);

    await user.click(
      screen.getByRole("button", { name: /신랑측 계좌번호 확인/ }),
    );
    const dialog = screen.getByRole("dialog");
    const [firstAccount] = within(dialog).getAllByRole("button", {
      name: /복사$/,
    });
    await user.click(firstAccount as HTMLElement);

    expect(screen.getByRole("status")).toHaveTextContent(
      "계좌번호가 복사되었습니다.",
    );
  });

  it("복사에 실패하면 성공했다고 알리지 않는다", async () => {
    writeText.mockRejectedValueOnce(new Error("권한 거부"));
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn().mockReturnValue(false),
    });

    const user = setupUser();
    renderWithProviders(<Gift />);

    await user.click(
      screen.getByRole("button", { name: /신랑측 계좌번호 확인/ }),
    );
    const dialog = screen.getByRole("dialog");
    const [firstAccount] = within(dialog).getAllByRole("button", {
      name: /복사$/,
    });
    await user.click(firstAccount as HTMLElement);

    /*
     * 기존 구현은 CopyToClipboard의 onCopy가 아니라 자식 버튼의 onClick에
     * 토스트를 달아, 실패해도 항상 "복사되었습니다"를 띄웠다.
     * 계좌번호에서 이 구분은 금전 사고로 이어질 수 있다.
     */
    const status = screen.getByRole("status");
    expect(status).not.toHaveTextContent("계좌번호가 복사되었습니다.");
    expect(status).toHaveTextContent(/복사하지 못했습니다/);
  });

  it("계좌번호 버튼의 접근 이름에 관계·이름·은행·번호를 모두 담는다", async () => {
    const user = setupUser();
    renderWithProviders(<Gift />);

    await user.click(
      screen.getByRole("button", { name: /신랑측 계좌번호 확인/ }),
    );

    /* 스크린 리더 사용자가 어느 계좌를 복사하는지 알 수 있어야 한다. */
    expect(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: /^아버지 .*의 계좌번호 ○○은행 .* 복사$/,
      }),
    ).toBeInTheDocument();
  });
});
