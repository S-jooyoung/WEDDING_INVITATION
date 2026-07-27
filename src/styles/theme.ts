/**
 * 디자인 토큰.
 *
 * 이전에는 같은 값(색상 #d97d83, 여백 42px, font-size 0.875rem, opacity 0.75)이
 * 컴포넌트 7곳에 각각 복사돼 있었다. 한 곳을 고치면 나머지가 남는 구조였다.
 */

const color = {
  background: "#efebe9",
  surface: "#ffffff",
  overlay: "rgba(0, 0, 0, 0.45)",

  /**
   * 강조색. 기존 값 #d97d83은 배경 #efebe9 대비 2.46:1로,
   * WCAG AA 본문 기준(4.5:1)은 물론 큰 글씨 기준(3:1)에도 미달했다.
   * 같은 색조를 유지하면서 명도만 낮춰 4.97:1을 확보한 값이다.
   */
  accent: "#a8434a",
  /** 텍스트가 아닌 장식(구분선, 테두리, 배경)에만 쓰는 연한 색. */
  accentSoft: "#d97d83",
  accentSurface: "rgba(168, 67, 74, 0.08)",

  /**
   * 본문 색. 기존에는 opacity로 톤을 조절했는데, opacity는 자식 요소까지
   * 함께 흐려지고 겹칠수록 대비가 예측 불가능해진다. 색상 자체로 표현한다.
   */
  text: "rgba(0, 0, 0, 0.82)",
  textMuted: "rgba(0, 0, 0, 0.62)",
  textSubtle: "rgba(0, 0, 0, 0.45)",
  border: "rgba(0, 0, 0, 0.12)",

  kakao: "#fee500",
  kakaoText: "#181600",
  focusRing: "#1a73e8",
} as const;

const font = {
  body: '"Noto Serif KR", "Apple SD Gothic Neo", "Malgun Gothic", serif',
  /** 인용구 전용 손글씨체. 해당 섹션에서만 로드된다. */
  display: '"mom_to_daughter", "Noto Serif KR", serif',
} as const;

const fontSize = {
  xs: "0.75rem",
  sm: "0.875rem",
  md: "1rem",
  lg: "1.25rem",
  xl: "1.5rem",
  display: "1.375rem",
} as const;

/** 4px 배수 스케일. 기존의 42px는 40px(space.10)으로 정규화했다. */
const space = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
} as const;

const layout = {
  /**
   * 모바일 청첩장이지만 데스크톱에서도 열린다. 기존에는 width: 70%만
   * 지정해 넓은 화면에서 한 줄이 지나치게 길어졌다.
   */
  maxWidth: "480px",
  contentInset: "clamp(20px, 8vw, 48px)",
} as const;

const motion = {
  duration: { fast: "150ms", base: "300ms", slow: "900ms" },
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;

const zIndex = {
  /* 본문 위에 떠 있는 컨트롤(배경음악 토글 등) */
  floating: 50,
  modal: 100,
  toast: 200,
} as const;

export const theme = {
  color,
  font,
  fontSize,
  space,
  layout,
  motion,
  zIndex,
} as const;

export type Theme = typeof theme;
