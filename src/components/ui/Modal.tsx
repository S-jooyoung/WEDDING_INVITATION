import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { useToast } from "@/components/ui/Toast";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** 본문 아래 회색 보조 설명. */
  description?: string;
}

/** Tab 순환 대상이 되는 요소들. */
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

/**
 * 접근성 요구사항을 직접 구현한 모달.
 *
 * antd Modal을 걷어내면서 antd가 대신 해주던 것들을 명시적으로 구현했다.
 * 모달은 "떠 있는 상자"가 아니라 아래 규약을 지켜야 비로소 모달이다.
 *
 *   - 열리면 포커스가 모달 안으로 들어가고, Tab이 모달 밖으로 새지 않는다.
 *   - ESC로 닫힌다.
 *   - 닫히면 포커스가 열기 직전의 요소로 돌아간다.
 *     (돌아가지 않으면 키보드 사용자는 문서 맨 앞으로 튕긴다.)
 *   - 열려 있는 동안 뒤 배경이 스크롤되지 않는다.
 *   - 보조기술에 dialog로 인식되고, 제목과 연결된다.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  description,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const { setLiveRegionHost } = useToast();

  /* Gatsby는 빌드 시 서버에서 렌더링하므로 document가 없다. */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /* 열기 직전의 포커스를 기억했다가 닫을 때 되돌린다. */
  useEffect(() => {
    if (!open) return;

    lastFocusedRef.current = document.activeElement as HTMLElement | null;

    return () => {
      lastFocusedRef.current?.focus();
    };
  }, [open]);

  /*
   * 열리면 포커스를 모달 안으로 옮긴다.
   *
   * mounted를 의존성에 반드시 포함해야 한다. 첫 렌더에서는 mounted가 false라
   * portal이 만들어지지 않아 dialogRef가 비어 있고, mounted가 true로 바뀌며
   * 실제 DOM이 생긴다. open만 의존성에 두면 이 두 번째 렌더에서 effect가
   * 다시 돌지 않아 포커스가 영영 body에 머문다.
   */
  useEffect(() => {
    if (!open || !mounted) return;

    const dialog = dialogRef.current;
    if (dialog === null) return;

    const first = dialog.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    (first ?? dialog).focus();
  }, [open, mounted]);

  /* 배경 스크롤을 잠근다. */
  useEffect(() => {
    if (!open || !mounted) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, mounted]);

  /*
   * ESC와 Tab 트랩을 document에서 가로챈다.
   *
   * 이전에는 두 핸들러가 다이얼로그 요소의 onKeyDown에 달려 있었다. 그런데
   * 다이얼로그는 tabIndex={-1}이라 여백을 클릭하면 컨테이너 자신이 포커스를
   * 받고, 그 상태는 first도 last도 아니므로 Tab이 그대로 통과해 포커스가
   * 모달 밖으로 나갔다. 포커스가 나가면 다이얼로그의 onKeyDown은 더 이상
   * 발화하지 않으므로 ESC까지 죽어, 키보드만 쓰는 사용자는 모달을 닫을
   * 수단이 완전히 사라졌다.
   *
   * 캡처 단계에서 듣기 때문에 포커스가 어디에 있든 항상 동작한다.
   */
  useEffect(() => {
    if (!open || !mounted) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (dialog === null) return;

      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      /* 포커스를 줄 자식이 없으면 컨테이너 자신에 묶어 둔다. */
      if (first === undefined || last === undefined) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const active = document.activeElement;
      const isInsideChild =
        active instanceof Node && active !== dialog && dialog.contains(active);

      /* 포커스가 모달 밖이거나 컨테이너 자신에 있으면 안쪽 끝으로 되돌린다. */
      if (!isInsideChild) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }

      /* 양 끝에서 Tab이 모달 밖으로 나가지 않도록 반대편으로 감는다. */
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [open, mounted, onClose]);

  /*
   * 알림 영역을 다이얼로그 안으로 옮긴다.
   *
   * aria-modal="true"는 다이얼로그 바깥 전체를 보조기술에서 제외하도록
   * 지시한다. 계좌번호 복사는 전부 이 모달 안에서 일어나므로, 알림이 앱
   * 트리에 그대로 있으면 성공도 실패도 스크린 리더에 전달되지 않는다.
   */
  useEffect(() => {
    if (!open || !mounted) return;

    const dialog = dialogRef.current;
    if (dialog === null) return;

    setLiveRegionHost(dialog);
    return () => setLiveRegionHost(null);
  }, [open, mounted, setLiveRegionHost]);

  if (!mounted || !open) return null;

  return createPortal(
    <Overlay
      /* 배경을 눌러도 닫히지만, 이는 마우스 사용자를 위한 부가 수단이다.
         키보드 사용자에게는 ESC와 닫기 버튼이 동등한 경로로 제공된다. */
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <Dialog
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description === undefined ? undefined : descriptionId}
        tabIndex={-1}
      >
        <Header>
          <Title id={titleId}>{title}</Title>
          <CloseButton type="button" onClick={onClose} aria-label="닫기">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M2 2L14 14M14 2L2 14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </CloseButton>
        </Header>

        <Body>{children}</Body>

        {description !== undefined && (
          <Description id={descriptionId}>{description}</Description>
        )}
      </Dialog>
    </Overlay>,
    document.body,
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => theme.zIndex.modal};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.space[4]};
  background-color: ${({ theme }) => theme.color.overlay};
`;

const Dialog = styled.div`
  width: 100%;
  max-width: 360px;
  max-height: 85vh;
  overflow-y: auto;
  padding: ${({ theme }) => theme.space[6]};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.color.surface};
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space[4]};
  margin-bottom: ${({ theme }) => theme.space[6]};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSize.md};
  font-weight: 700;
  color: ${({ theme }) => theme.color.text};
`;

const CloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* 아이콘은 16px이지만 누를 수 있는 영역은 44px로 확보한다. */
  width: 44px;
  height: 44px;
  margin: -14px;
  padding: 0;
  border: 0;
  background: none;
  color: ${({ theme }) => theme.color.textMuted};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.color.text};
  }
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[4]};
`;

const Description = styled.p`
  margin-top: ${({ theme }) => theme.space[6]};
  color: ${({ theme }) => theme.color.textMuted};
  font-size: ${({ theme }) => theme.fontSize.xs};
  text-align: center;
`;
