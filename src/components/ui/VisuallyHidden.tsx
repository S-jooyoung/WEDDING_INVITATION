import styled from "styled-components";

/**
 * 화면에서는 감추되 스크린 리더에는 읽히는 텍스트.
 *
 * display: none이나 visibility: hidden은 보조기술에서도 함께 제거되므로
 * 쓸 수 없다. 1px 영역으로 잘라 내는 방식이 표준적인 우회다.
 */
export const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  overflow: hidden;
  white-space: nowrap;
  clip-path: inset(50%);
`;
