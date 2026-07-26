import { Link } from "gatsby";
import styled from "styled-components";
import { Seo } from "@/components/Seo";

/**
 * 404 페이지.
 *
 * 기존에는 Gatsby 기본 템플릿이 그대로 있었다. 한국어 청첩장에 영어로
 * "Sorry 😔 we couldn't find what you were looking for."가 뜨고,
 * 개발자용 안내문("Try creating a page in src/pages/")이 방문자에게 노출됐다.
 * padding이 96px로 고정돼 좁은 화면에서는 글자가 세로로 쪼개졌다.
 */
export default function NotFoundPage() {
  return (
    <Main>
      <Title>페이지를 찾을 수 없습니다</Title>
      <Message>
        주소가 잘못되었거나 삭제된 페이지입니다.
        <br />
        청첩장은 아래에서 확인하실 수 있습니다.
      </Message>
      <HomeLink to="/">청첩장으로 이동</HomeLink>
    </Main>
  );
}

export function Head() {
  return <Seo title="페이지를 찾을 수 없습니다" pathname="/404" />;
}

const Main = styled.main`
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
  font-weight: 700;
`;

const Message = styled.p`
  margin-bottom: ${({ theme }) => theme.space[8]};
  color: ${({ theme }) => theme.color.textMuted};
  font-size: ${({ theme }) => theme.fontSize.sm};
`;

const HomeLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 ${({ theme }) => theme.space[6]};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.color.accentSurface};
  color: ${({ theme }) => theme.color.accent};
  font-size: ${({ theme }) => theme.fontSize.sm};
  text-decoration: none;
`;
