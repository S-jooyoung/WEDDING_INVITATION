import styled from "styled-components";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";
import { invitation } from "@/data/invitation";

/** 인사말과 혼주 소개. */
export function Greeting() {
  const { greeting, couple } = invitation;

  return (
    <Container>
      <Section title={greeting.heading} ornament>
        <Message>
          {greeting.paragraphs.map((paragraph, index) => (
            <Reveal key={paragraph} delay={index * 80}>
              <p>{paragraph}</p>
            </Reveal>
          ))}
        </Message>

        <Reveal delay={greeting.paragraphs.length * 80}>
          <Families>
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
