import type { ElementType, ReactNode } from "react";
import styled from "styled-components";
import { useInView } from "@/hooks/useInView";

export interface RevealProps {
  children: ReactNode;
  /** 여러 요소를 순차로 등장시킬 때 쓰는 지연 시간(ms). */
  delay?: number;
  as?: ElementType;
  className?: string;
}

/** 화면에 들어올 때 아래에서 떠오르는 등장 효과. */
export function Reveal({ children, delay = 0, as, className }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <Wrapper
      ref={ref}
      as={as}
      className={className}
      $visible={inView}
      $delay={delay}
    >
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
