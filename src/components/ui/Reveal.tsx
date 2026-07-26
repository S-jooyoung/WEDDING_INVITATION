import type { ReactNode } from "react";
import styled from "styled-components";
import { useInView } from "@/hooks/useInView";

export interface RevealProps {
  children: ReactNode;
  /** 여러 요소를 순차로 등장시킬 때 쓰는 지연 시간(ms). */
  delay?: number;
}

/**
 * 화면에 들어올 때 아래에서 떠오르는 등장 효과.
 *
 * 렌더할 태그를 바꾸는 `as` prop은 일부러 두지 않았다. useInView가
 * HTMLDivElement로 고정된 ref를 만들기 때문에, `as`로 다른 요소를 렌더하면
 * ref 타입과 실제 DOM 요소가 조용히 어긋난다. 다른 태그가 필요해지면
 * useInView의 타입 파라미터와 함께 올바르게 열어야 한다.
 */
export function Reveal({ children, delay = 0 }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <Wrapper ref={ref} $visible={inView} $delay={delay}>
      {children}
    </Wrapper>
  );
}

const Wrapper = styled.div<{ $visible: boolean; $delay: number }>`
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: translateY(${({ $visible }) => ($visible ? "0" : "16px")});
  transition:
    opacity ${({ theme }) => theme.motion.duration.slow}
      ${({ theme }) => theme.motion.easing},
    transform ${({ theme }) => theme.motion.duration.slow}
      ${({ theme }) => theme.motion.easing};
  transition-delay: ${({ $delay }) => $delay}ms;

  /*
   * 동작 줄이기를 켠 사용자에게는 전환이 제거되므로(GlobalStyle) 초기값인
   * opacity: 0에 갇힐 수 있다. 항상 보이는 상태로 고정한다.
   */
  @media (prefers-reduced-motion: reduce) {
    opacity: 1;
    transform: none;
  }
`;
