import type { ButtonHTMLAttributes, ReactNode } from "react";
import styled, { css } from "styled-components";

export type ButtonVariant = "kakao" | "outline";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  /** 버튼 텍스트 앞에 놓이는 장식 아이콘. 의미는 텍스트가 전달한다. */
  icon?: ReactNode;
}

/**
 * antd의 Button을 대체한다.
 *
 * 이전 구현은 antd Button을 styled()로 감싼 뒤 !important를 8번 써서
 * 기본 스타일을 덮어썼다. 전체 antd CSS를 받아 놓고 대부분을 무효화하는
 * 구조였으므로, 필요한 것만 직접 만드는 편이 단순하고 가볍다.
 */
export function Button({
  variant = "outline",
  fullWidth = false,
  icon,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <StyledButton
      type={type}
      $variant={variant}
      $fullWidth={fullWidth}
      {...rest}
    >
      {/* 아이콘 SVG 자체가 이미 aria-hidden이므로 여기서 또 감추지 않는다. */}
      {icon !== undefined && <IconSlot>{icon}</IconSlot>}
      {children}
    </StyledButton>
  );
}

const variantStyles = {
  kakao: css`
    background-color: ${({ theme }) => theme.color.kakao};
    color: ${({ theme }) => theme.color.kakaoText};
    border-color: ${({ theme }) => theme.color.kakao};

    &:hover:not(:disabled) {
      filter: brightness(0.95);
    }
  `,
  outline: css`
    background-color: ${({ theme }) => theme.color.accentSurface};
    color: ${({ theme }) => theme.color.accent};
    border-color: ${({ theme }) => theme.color.accentSurface};

    &:hover:not(:disabled) {
      filter: brightness(0.95);
    }
  `,
} as const satisfies Record<ButtonVariant, ReturnType<typeof css>>;

const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $fullWidth: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.space[2]};
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "auto")};
  /* 손가락으로 정확히 누를 수 있는 최소 크기 (WCAG 2.5.8) */
  min-height: 44px;
  padding: ${({ theme }) => theme.space[3]} ${({ theme }) => theme.space[4]};
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: ${({ theme }) => theme.fontSize.sm};
  line-height: 1.4;
  cursor: pointer;
  transition:
    filter ${({ theme }) => theme.motion.duration.fast} ease,
    background-color ${({ theme }) => theme.motion.duration.fast} ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ $variant }) => variantStyles[$variant]}
`;

const IconSlot = styled.span`
  display: inline-flex;
  font-size: 1.1em;
`;
