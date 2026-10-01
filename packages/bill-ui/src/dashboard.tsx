import type { ElementType, ReactNode } from 'react';
import './dashboard.scss';
import './dashboard-categories.scss';

interface DashboardPrimitives { Box?: ElementType; Text?: ElementType; Title?: ElementType }

export function DashboardHeadingVisual({ title, actions, primitives = {} }: { title: ReactNode; actions?: ReactNode; primitives?: DashboardPrimitives }) {
  const { Box = 'header', Title = 'h1' } = primitives;
  return (
    <Box className="bill-dashboard-heading">
      <Title className="bill-dashboard-heading__title">{title}</Title>
      {actions}
    </Box>
  );
}

export function DashboardSummaryVisual({ title, period, items, primitives = {} }: {
  title: ReactNode;
  period: ReactNode;
  items: { key: string; label: ReactNode; amount: ReactNode; tone: 'income' | 'muted' | 'normal' }[];
  primitives?: DashboardPrimitives;
}) {
  const { Box = 'div', Text = 'div', Title = 'h2' } = primitives;
  return (
    <>
      <Box className="bill-dashboard-section__heading">
        <Title className="bill-dashboard-section__title">{title}</Title>
        <Text className="bill-dashboard-section__period">{period}</Text>
      </Box>
      <Box className="bill-dashboard-summary">
        {items.map(item => (
          <Box key={item.key} className={`ww-chart-summary-tile bill-dashboard-summary__tile bill-dashboard-summary__tile--${item.key}`} data-summary-metric={item.key}>
            <Text className="bill-dashboard-summary__label">{item.label}</Text>
            <Text className={`ww-chart-summary-amount bill-dashboard-summary__amount bill-dashboard-summary__amount--${item.tone}`}>{item.amount}</Text>
          </Box>
        ))}
      </Box>
    </>
  );
}

export function DashboardTrendVisual({ title, controls, chart, start, average, end, primitives = {} }: {
  title: ReactNode;
  controls: ReactNode;
  chart: ReactNode;
  start: ReactNode;
  average: ReactNode;
  end: ReactNode;
  primitives?: DashboardPrimitives;
}) {
  const { Box = 'div', Text = 'span', Title = 'h2' } = primitives;
  return (
    <>
      <Box className="bill-dashboard-section__heading bill-dashboard-section__heading--trend">
        <Title className="bill-dashboard-section__title">{title}</Title>
        {controls}
      </Box>
      <Box className="bill-dashboard-trend">{chart}</Box>
      <Box className="bill-dashboard-trend__legend">
        <Text>{start}</Text>
        <Text>{average}</Text>
        <Text>{end}</Text>
      </Box>
    </>
  );
}

export function DashboardSwitchVisual<T extends string>({ label, options, value, onChange, className = '', primitives = {} }: {
  label: string;
  options: { label: ReactNode; value: T }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  primitives?: { Box?: ElementType; Button?: ElementType; Text?: ElementType };
}) {
  const { Box = 'div', Button = 'button', Text = 'span' } = primitives;
  return (
    <Box aria-label={label} className={`bill-dashboard-switch ${className}`} role="group">
      <Text aria-hidden data-chart-switch-track className="bill-dashboard-switch__track" />
      {options.map(option => (
        <Button key={option.value} type="button" aria-pressed={value === option.value} className="bill-dashboard-switch__button" onClick={() => onChange(option.value)}>
          <Text data-chart-switch-option className={`bill-dashboard-switch__option${value === option.value ? ' bill-dashboard-switch__option--active' : ''}`}>{option.label}</Text>
        </Button>
      ))}
    </Box>
  );
}

export function DashboardCategoriesVisual({ title, donut, rows, other, empty, primitives = {} }: {
  title: ReactNode;
  donut: ReactNode;
  rows: ReactNode;
  other?: ReactNode;
  empty?: ReactNode;
  primitives?: DashboardPrimitives;
}) {
  const { Box = 'div', Title = 'h2' } = primitives;
  return (
    <>
      <Title className="bill-dashboard-section__title bill-dashboard-categories__title">{title}</Title>
      <Box className="bill-dashboard-categories">
        <Box className="bill-dashboard-donut">{donut}</Box>
        <Box className="bill-dashboard-categories__rows">{rows}</Box>
      </Box>
      {other && <Box className="bill-dashboard-categories__other">{other}</Box>}
      {empty && <Box className="bill-dashboard-categories__empty">{empty}</Box>}
    </>
  );
}

export function DashboardDonutLabel({ label, amount, primitives = {} }: { label: ReactNode; amount: ReactNode; primitives?: DashboardPrimitives }) {
  const { Box = 'div', Text = 'span' } = primitives;
  return (
    <Box className="bill-dashboard-donut__center">
      <Text className="bill-dashboard-donut__label">{label}</Text>
      <Text className="bill-dashboard-donut__amount">{amount}</Text>
    </Box>
  );
}

export function DashboardCategoryRowContent({ icon, label, amount, percentage, primitives = {} }: {
  icon: ReactNode;
  label: ReactNode;
  amount: ReactNode;
  percentage: ReactNode;
  primitives?: DashboardPrimitives;
}) {
  const { Text = 'span' } = primitives;
  return (
    <>
      {icon}
      <Text className="bill-dashboard-category-row__label">{label}</Text>
      <Text className="bill-dashboard-category-row__amount">{amount}</Text>
      <Text className="bill-dashboard-category-row__percentage">{percentage}</Text>
    </>
  );
}
