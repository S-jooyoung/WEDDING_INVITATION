import { useId, type ReactNode } from "react";
import styled from "styled-components";
import { SectionHeading } from "@/components/ui";
import Ornament from "@/assets/flower1.png";

export interface SectionProps {
  /** 섹션 제목. 생략하면 heading 없이 본문만 렌더링한다. */
  title?: string;
  /** 제목 아래 꽃 장식을 넣을지. */
  ornament?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * 청첩장의 한 단락을 이루는 공통 골격.
 *
 * 기존에는 각 컴포넌트가 Wrapper·Title·Image styled-component를 거의 동일한
 * 내용으로 따로 선언했다. 여기로 모으면서 두 가지를 함께 바로잡았다.
 *
 *   - <div>가 아니라 <section>으로 감싸고 제목과 aria-labelledby로 연결했다.
 *     스크린 리더가 "지역" 단위로 건너뛸 수 있게 된다.
 *   - 장식용 꽃 이미지에 alt=""를 부여했다. 기존에는 alt이 아예 없어
 *     스크린 리더가 파일명을 읽어 주었다. 의미가 없는 이미지는 이름을
 *     붙이는 게 아니라 접근성 트리에서 제외해야 한다.
 */
export function Section({
  title,
  ornament = false,
  children,
  className,
}: SectionProps) {
  const headingId = useId();

  return (
    <SectionElement
      className={className}
      aria-labelledby={title === undefined ? undefined : headingId}
    >
      {title !== undefined && (
        <SectionHeading id={headingId}>{title}</SectionHeading>
      )}
      {ornament && (
        <OrnamentImage src={Ornament} alt="" width={22} height={23} />
      )}
      {children}
    </SectionElement>
  );
}

const SectionElement = styled.section`
  padding-top: ${({ theme }) => theme.space[12]};
`;

const OrnamentImage = styled.img`
  width: 22px;
  height: auto;
  margin: 0 auto ${({ theme }) => theme.space[10]};
`;
