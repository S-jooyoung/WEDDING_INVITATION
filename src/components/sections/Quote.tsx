import styled from "styled-components";
import QuotePaper from "@/assets/Quote.png";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui";
import { invitation } from "@/data/invitation";

/**
 * 시 인용 섹션.
 *
 * 기존에는 <span> 안에 <br>로 줄을 나누고 출처까지 같은 덩어리에 넣었다.
 * 인용문은 blockquote, 출처는 cite로 표시해 문서 구조에 의미를 남긴다.
 */
export function Quote() {
  const { quote } = invitation;

  return (
    <Container>
      <Section ornament>
        <Reveal>
          <Figure>
            <Blockquote>
              {quote.lines.map((line) => (
                <Line key={line}>{line}</Line>
              ))}
            </Blockquote>
            <Caption>
              <cite>{quote.source}</cite>
            </Caption>
          </Figure>
        </Reveal>
      </Section>
    </Container>
  );
}

const Figure = styled.figure`
  margin: 0;
  padding: ${({ theme }) => theme.space[8]} 0;
  background-image: url(${QuotePaper});
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  text-align: center;
`;

const Blockquote = styled.blockquote`
  margin: 0;
  color: ${({ theme }) => theme.color.accent};
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.display};
  line-height: 2.25;
`;

const Line = styled.span`
  display: block;
`;

const Caption = styled.figcaption`
  margin-top: ${({ theme }) => theme.space[6]};
  color: ${({ theme }) => theme.color.textMuted};
  font-size: ${({ theme }) => theme.fontSize.sm};

  cite {
    font-style: normal;
  }
`;
