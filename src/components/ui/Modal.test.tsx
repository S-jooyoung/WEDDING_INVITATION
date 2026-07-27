import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "@/components/ui/Modal";
import { renderWithProviders, screen } from "@/test/render";

function openModal(overrides: Partial<Parameters<typeof Modal>[0]> = {}) {
  const onClose = vi.fn();
  const result = renderWithProviders(
    <Modal open onClose={onClose} title="신랑측 계좌번호" {...overrides}>
      <button type="button">첫 번째</button>
      <button type="button">두 번째</button>
    </Modal>,
  );

  return { onClose, ...result };
}

describe("Modal", () => {
  it("닫혀 있으면 아무것도 렌더링하지 않는다", () => {
    renderWithProviders(
      <Modal open={false} onClose={vi.fn()} title="신랑측 계좌번호">
        <p>내용</p>
      </Modal>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("보조기술에 dialog로 노출되고 제목과 연결된다", () => {
    openModal();

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName("신랑측 계좌번호");
  });

  it("description을 주면 dialog의 설명으로 연결한다", () => {
    openModal({ description: "계좌번호를 누르면 복사됩니다." });

    expect(screen.getByRole("dialog")).toHaveAccessibleDescription(
      "계좌번호를 누르면 복사됩니다.",
    );
  });

  it("열리면 포커스가 모달 안 첫 요소로 들어간다", () => {
    openModal();

    /* DOM 순서상 헤더의 닫기 버튼이 첫 포커스 대상이다. */
    expect(screen.getByRole("button", { name: "닫기" })).toHaveFocus();
  });

  it("ESC를 누르면 닫는다", async () => {
    const user = userEvent.setup();
    const { onClose } = openModal();

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("닫기 버튼을 누르면 닫는다", async () => {
    const user = userEvent.setup();
    const { onClose } = openModal();

    await user.click(screen.getByRole("button", { name: "닫기" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("배경을 누르면 닫지만 내용을 눌렀을 때는 닫지 않는다", async () => {
    const user = userEvent.setup();
    const { onClose } = openModal();

    await user.click(screen.getByRole("dialog"));
    expect(onClose).not.toHaveBeenCalled();

    /* dialog의 부모가 오버레이다. */
    const overlay = screen.getByRole("dialog").parentElement;
    expect(overlay).not.toBeNull();
    await user.click(overlay as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  describe("포커스 트랩", () => {
    it("마지막 요소에서 Tab을 누르면 첫 요소로 돌아온다", async () => {
      const user = userEvent.setup();
      openModal();

      /* 포커스 순서: 닫기 → 첫 번째 → 두 번째 → (순환) 닫기 */
      await user.tab();
      expect(screen.getByRole("button", { name: "첫 번째" })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole("button", { name: "두 번째" })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole("button", { name: "닫기" })).toHaveFocus();
    });

    it("첫 요소에서 Shift+Tab을 누르면 마지막 요소로 간다", async () => {
      const user = userEvent.setup();
      openModal();

      /* 열린 직후 포커스는 첫 포커서블 요소인 닫기 버튼에 있다. */
      await user.tab({ shift: true });

      expect(screen.getByRole("button", { name: "두 번째" })).toHaveFocus();
    });

    /*
     * 아래 두 건은 실제로 트랩이 뚫렸던 경로다. 다이얼로그는 tabIndex={-1}이라
     * 여백을 클릭하면 컨테이너 자신이 포커스를 받는데, 이 상태는 first도
     * last도 아니어서 Tab이 그대로 통과해 포커스가 모달 밖으로 나갔다.
     */
    it("여백을 클릭해 컨테이너가 포커스를 받아도 Tab이 밖으로 나가지 않는다", async () => {
      const user = userEvent.setup();
      openModal();

      const dialog = screen.getByRole("dialog");
      dialog.focus();
      expect(dialog).toHaveFocus();

      await user.tab();

      const active = document.activeElement;
      expect(active).not.toBe(document.body);
      expect(dialog.contains(active)).toBe(true);
    });

    it("여백을 클릭해 컨테이너가 포커스를 받아도 Shift+Tab이 밖으로 나가지 않는다", async () => {
      const user = userEvent.setup();
      openModal();

      const dialog = screen.getByRole("dialog");
      dialog.focus();

      await user.tab({ shift: true });

      expect(dialog.contains(document.activeElement)).toBe(true);
    });
  });

  it("포커스가 모달 밖으로 벗어난 뒤에도 ESC가 동작한다", async () => {
    const user = userEvent.setup();
    const { onClose } = openModal();

    /*
     * 키 핸들러가 다이얼로그 요소에 달려 있으면, 포커스가 밖으로 나간 순간
     * ESC까지 발화하지 않아 키보드 사용자가 모달을 닫을 수단을 잃는다.
     */
    document.body.focus();
    (document.activeElement as HTMLElement | null)?.blur();

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("열려 있는 동안 알림 영역을 다이얼로그 안으로 옮긴다", () => {
    openModal();

    /*
     * aria-modal="true"는 다이얼로그 바깥을 보조기술에서 제외시킨다.
     * 알림이 밖에 남아 있으면 모달 안에서 일어난 복사 결과가 전달되지 않는다.
     */
    const dialog = screen.getByRole("dialog");
    expect(dialog).toContainElement(screen.getByRole("status"));
  });

  it("닫히면 열기 직전에 포커스가 있던 요소로 되돌린다", async () => {
    const user = userEvent.setup();

    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            계좌번호 보기
          </button>
          <Modal open={open} onClose={() => setOpen(false)} title="계좌번호">
            <p>내용</p>
          </Modal>
        </>
      );
    }

    renderWithProviders(<Harness />);

    const trigger = screen.getByRole("button", { name: "계좌번호 보기" });
    await user.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    /* 복원하지 않으면 키보드 사용자는 문서 맨 앞으로 튕긴다. */
    expect(trigger).toHaveFocus();
  });

  it("열려 있는 동안 배경 스크롤을 잠그고 닫으면 되돌린다", async () => {
    const user = userEvent.setup();

    function Harness() {
      const [open, setOpen] = useState(true);
      return (
        <Modal open={open} onClose={() => setOpen(false)} title="계좌번호">
          <p>내용</p>
        </Modal>
      );
    }

    renderWithProviders(<Harness />);
    expect(document.body.style.overflow).toBe("hidden");

    await user.keyboard("{Escape}");
    expect(document.body.style.overflow).toBe("");
  });
});
