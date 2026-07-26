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
import styled from "styled-components";

const AUTO_DISMISS_MS = 2500;

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * antd의 message를 대체하는 알림.
 *
 * 이전 구현은 화면 위에 잠깐 뜨는 상자였을 뿐이라, 스크린 리더 사용자는
 * "계좌번호가 복사되었습니다"라는 사실을 전혀 알 수 없었다. 복사 버튼을 눌러도
 * 아무 피드백이 없으니 동작했는지 알 방법이 없다.
 *
 * 알림 영역을 aria-live="polite"로 상시 렌더링해 두고 안의 텍스트만 바꾼다.
 * 영역 자체를 나중에 삽입하면 일부 스크린 리더가 변경을 놓치기 때문이다.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((next: string) => {
    setMessage(next);

    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setMessage(null), AUTO_DISMISS_MS);
  }, []);

  /* 언마운트 시 타이머를 정리해 사라진 컴포넌트의 상태를 갱신하지 않는다. */
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <LiveRegion role="status" aria-live="polite" aria-atomic="true">
        {message !== null && <Bubble>{message}</Bubble>}
      </LiveRegion>
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
  padding: ${({ theme }) => theme.space[3]} ${({ theme }) => theme.space[6]};
  border-radius: 999px;
  background-color: rgba(0, 0, 0, 0.82);
  color: #ffffff;
  font-size: ${({ theme }) => theme.fontSize.sm};
  white-space: nowrap;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
`;
