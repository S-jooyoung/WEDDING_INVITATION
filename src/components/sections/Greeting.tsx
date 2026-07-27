import styled from "styled-components";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui";
import { invitation } from "@/data/invitation";

/** 문단이 차례로 떠오르도록 주는 간격. */
const STAGGER_DELAY_MS = 80;

/** 인사말과 혼주 소개. */
export function Greeting() {
  const { greeting, couple } = invitation;

  return (
    <Container>
      <Section title={greeting.heading} ornament>
        <Message>
          {greeting.paragraphs.map((paragraph, index) => (
            <Reveal key={paragraph} delay={index * STAGGER_DELAY_MS}>
              <p>{paragraph}</p>
            </Reveal>
          ))}
        </Message>

        <Reveal delay={greeting.paragraphs.length * STAGGER_DELAY_MS}>
          <Families role="list">
            <li>
              {couple.groom.father.name} · {couple.groom.mother.name}의{" "}
              {couple.groom.childOrder} {couple.groom.name}
            </li>
            <li>
              {couple.bride.father.name} · {couple.bride.mother.name}의{" "}
              {couple.bride.childOrder} {couple.bride.name}
            </li>
          </Families>
        </Reveal>
      </Section>
    </Container>
  );
}

const Message = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[6]};
  margin-bottom: ${({ theme }) => theme.space[10]};
  color: ${({ theme }) => theme.color.textMuted};
  font-size: ${({ theme }) => theme.fontSize.sm};
  text-align: center;
`;

const Families = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[1]};
  color: ${({ theme }) => theme.color.text};
  font-size: ${({ theme }) => theme.fontSize.sm};
  text-align: center;
`;
