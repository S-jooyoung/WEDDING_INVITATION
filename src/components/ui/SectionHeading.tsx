import type { ReactNode } from "react";
import styled from "styled-components";

export interface SectionHeadingProps {
  children: ReactNode;
  /** 문서 개요상의 위치. 기본값은 페이지 내 섹션 제목인 h2다. */
  as?: "h2" | "h3";
  id?: string;
}

/**
 * 좌우로 선이 뻗은 섹션 제목.
 *
 * 이전에는 antd의 <Divider plain>에 <p>를 넣어 만들었다. 시각적으로는
 * 제목이지만 마크업상으로는 문단이라, 스크린 리더 사용자가 제목 목록으로
 * 섹션을 건너뛸 수 없었다. 선은 장식이므로 aria-hidden으로 감추고
 * 텍스트만 진짜 heading으로 노출한다.
 */
export function SectionHeading({
  children,
  as = "h2",
  id,
}: SectionHeadingProps) {
  return (
    <Wrapper>
      <Rule aria-hidden="true" />
      <Heading as={as} id={id}>
        {children}
      </Heading>
      <Rule aria-hidden="true" />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[4]};
  margin-bottom: ${({ theme }) => theme.space[8]};
`;

const Rule = styled.span`
  flex: 1;
  height: 1px;
  background-color: ${({ theme }) => theme.color.border};
`;

const Heading = styled.h2`
  flex: 0 0 auto;
  color: ${({ theme }) => theme.color.accent};
  font-size: ${({ theme }) => theme.fontSize.md};
  font-weight: 700;
  letter-spacing: 0.02em;
`;
