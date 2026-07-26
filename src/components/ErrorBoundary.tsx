import { Component, type ErrorInfo, type ReactNode } from "react";
import styled from "styled-components";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * 렌더링 중 예외를 잡아 최소한의 안내를 남긴다.
 *
 * 이 청첩장은 카카오맵과 카카오 SDK라는 두 개의 서드파티에 의존한다.
 * 경계가 없으면 그중 하나가 렌더 중에 예외를 던지는 순간 React가 트리
 * 전체를 언마운트해 흰 화면만 남는다. 하객은 예식장 위치도, 계좌번호도
 * 볼 수 없고, 무엇이 잘못됐는지도 알 수 없다.
 *
 * 클래스 컴포넌트인 이유는 componentDidCatch에 해당하는 훅이 아직 없기
 * 때문이다. React가 제공하는 유일한 방법이다.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    /* 배포 환경에서 원인을 추적할 수 있도록 콘솔에는 남긴다. */
    console.error("청첩장 렌더링 중 오류가 발생했습니다.", error, info);
  }

  override render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <Fallback role="alert">
        <Title>일시적인 오류가 발생했습니다</Title>
        <Message>
          페이지를 새로고침하면 정상적으로 보일 수 있습니다.
          <br />
          문제가 계속되면 신랑 신부에게 알려 주세요.
        </Message>
        <RetryButton type="button" onClick={() => window.location.reload()}>
          새로고침
        </RetryButton>
      </Fallback>
    );
  }
}

const Fallback = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: ${({ theme }) => theme.layout.contentInset};
  background-color: ${({ theme }) => theme.color.background};
  text-align: center;
`;

const Title = styled.h1`
  margin-bottom: ${({ theme }) => theme.space[4]};
  color: ${({ theme }) => theme.color.accent};
  font-size: ${({ theme }) => theme.fontSize.lg};
`;

const Message = styled.p`
  margin-bottom: ${({ theme }) => theme.space[8]};
  color: ${({ theme }) => theme.color.textMuted};
  font-size: ${({ theme }) => theme.fontSize.sm};
`;

const RetryButton = styled.button`
  min-height: 44px;
  padding: 0 ${({ theme }) => theme.space[6]};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.color.accentSurface};
  color: ${({ theme }) => theme.color.accent};
  font-size: ${({ theme }) => theme.fontSize.sm};
  cursor: pointer;
`;
