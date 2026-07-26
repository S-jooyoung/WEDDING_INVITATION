import styled from "styled-components";

/**
 * 본문 가로 폭을 제한하는 컨테이너.
 *
 * 기존에는 각 섹션이 width: 70%; margin: 0 auto만 지정했다. 비율만 있고
 * 상한이 없어 데스크톱에서는 한 줄이 지나치게 길어지고, 좁은 화면에서는
 * 양옆 여백이 과했다. 최대 폭과 안쪽 여백을 함께 고정한다.
 */
export const Container = styled.div`
  width: 100%;
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.layout.contentInset};
`;
