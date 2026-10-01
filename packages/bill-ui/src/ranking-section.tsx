import type { ElementType, ReactNode } from 'react';
import './ranking-section.scss';

export function RankingSectionVisual({ title, children, primitives = { Section: 'section', Title: 'h2', Box: 'div' } }: { title: ReactNode; children: ReactNode; primitives?: { Section: ElementType; Title: ElementType; Box: ElementType } }) {
  const { Section, Title, Box } = primitives;
  return (
    <Section className="bill-ranking-section">
      <Title className="bill-ranking-section__title">{title}</Title>
      <Box className="bill-ranking-section__card">{children}</Box>
    </Section>
  );
}
