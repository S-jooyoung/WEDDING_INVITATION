import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";

const AUTO_DISMISS_MS = 2500;

interface Toast {
  /**
   * 같은 문구를 연달아 알릴 때 노드를 교체하기 위한 식별자.
   *
   * 문구만 상태에 두면 React가 같은 값에서 리렌더를 건너뛰어 DOM이 그대로
   * 남는다. 스크린 리더는 live region의 변경을 신호로 읽으므로, 변경이
   * 없으면 아무것도 읽지 않는다. 계좌를 연달아 복사하는 것이 이 화면의
   * 정상 흐름이고 성공 문구는 매번 동일하다.
   */
  readonly id: number;
  readonly message: string;
}

interface ToastContextValue {
  showToast: (message: string) => void;
  /**
   * 알림을 렌더링할 위치를 지정한다.
   *
   * aria-modal="true"인 다이얼로그는 자기 바깥 전체를 보조기술에서 제외시킨다.
   * 알림 영역이 앱 트리에 그대로 있으면 모달 안에서 일어난 복사 결과가
   * 스크린 리더에 닿지 않으므로, 모달이 열려 있는 동안에는 다이얼로그
   * 내부로 옮겨 렌더한다.
   */
  setLiveRegionHost: (host: HTMLElement | null) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * antd의 message를 대체하는 알림.
 *
 * 이전 구현은 화면 위에 잠깐 뜨는 상자였을 뿐이라, 스크린 리더 사용자는
 * "계좌번호가 복사되었습니다"라는 사실을 전혀 알 수 없었다. 복사 버튼을 눌러도
 * 아무 피드백이 없으니 동작했는지 알 방법이 없다.
 *
 * 알림 영역을 aria-live="polite"로 상시 렌더링해 두고 안의 내용만 바꾼다.
 * 영역 자체를 나중에 삽입하면 일부 스크린 리더가 변경을 놓치기 때문이다.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextIdRef = useRef(0);

  const showToast = useCallback((message: string) => {
    nextIdRef.current += 1;
    setToast({ id: nextIdRef.current, message });

    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), AUTO_DISMISS_MS);
  }, []);

  const setLiveRegionHost = useCallback((next: HTMLElement | null) => {
    setHost(next);
  }, []);

  /* 언마운트 시 타이머를 정리해 사라진 컴포넌트의 상태를 갱신하지 않는다. */
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, []);

  const value = useMemo(
    () => ({ showToast, setLiveRegionHost }),
    [showToast, setLiveRegionHost],
  );

  const liveRegion = (
    <LiveRegion role="status" aria-live="polite" aria-atomic="true">
      {toast !== null && <Bubble key={toast.id}>{toast.message}</Bubble>}
    </LiveRegion>
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {host === null ? liveRegion : createPortal(liveRegion, host)}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (context === null) {
    throw new Error("useToast는 ToastProvider 안에서만 사용할 수 있습니다.");
  }

  return context;
}

const LiveRegion = styled.div`
  position: fixed;
  top: ${({ theme }) => theme.space[6]};
  left: 50%;
  transform: translateX(-50%);
  z-index: ${({ theme }) => theme.zIndex.toast};
  /* 알림이 없을 때 투명한 상자가 클릭을 가로채지 않도록 한다. */
  pointer-events: none;
`;

const Bubble = styled.div`
  /*
   * 실패 안내 문구는 30자에 이르므로 한 줄로 고정하면 좁은 화면에서 잘린다.
   * 하필 잘려 나가는 쪽이 "무엇을 대신 하면 되는지" 알려 주는 문장이다.
   */
  max-width: calc(100vw - ${({ theme }) => theme.space[8]});
  padding: ${({ theme }) => theme.space[3]} ${({ theme }) => theme.space[6]};
  border-radius: 16px;
  background-color: rgba(0, 0, 0, 0.82);
  color: #ffffff;
  font-size: ${({ theme }) => theme.fontSize.sm};
  text-align: center;
  word-break: keep-all;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
`;
