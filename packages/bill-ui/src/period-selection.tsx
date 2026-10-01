import type { CSSProperties, ElementType, ReactNode } from 'react';
import './period-selection.scss';

export function PeriodSelectionPanel({ header, year, previous, next, choices, selectedStart, selectedIcon, onSelect, scrollStyle, ariaLabel, primitives: { Box = 'div', Text = 'span', Button = 'button', Scroll = 'div' } = {} }: {
  header: ReactNode;
  year: ReactNode;
  previous: ReactNode;
  next: ReactNode;
  choices: Array<{ anchorDate: string; startDate: string; endDate: string; title: ReactNode }>;
  selectedStart: string;
  selectedIcon: ReactNode;
  scrollStyle?: CSSProperties;
  ariaLabel?: string;
  onSelect: (anchorDate: string) => void;
  primitives?: { Box?: ElementType; Text?: ElementType; Button?: ElementType; Scroll?: ElementType };
}) {
  return (
    <Box className="bill-period-selection" aria-label={ariaLabel} data-tab-swipe-ignore>
      {header}
      <Box className="bill-period-selection__year-row">
        {previous}
        <Text className="bill-period-selection__year">{year}</Text>
        {next}
      </Box>
      <Scroll className="bill-period-selection__scroll" style={scrollStyle}>
        <Box className="bill-period-selection__grid">
          {choices.map(choice => (
            <Button type="button" key={choice.anchorDate} aria-pressed={choice.startDate === selectedStart} className={`bill-period-selection__choice${choice.startDate === selectedStart ? ' bill-period-selection__choice--selected' : ''}`} onClick={() => onSelect(choice.anchorDate)}>
              <Box className="bill-period-selection__content">
                <Text className="bill-period-selection__title">{choice.title}</Text>
                <Text className="bill-period-selection__range">
                  {choice.startDate}
                  {' '}
                  —
                  {' '}
                  {choice.endDate}
                </Text>
              </Box>
              {choice.startDate === selectedStart && selectedIcon}
            </Button>
          ))}
        </Box>
      </Scroll>
    </Box>
  );
}
