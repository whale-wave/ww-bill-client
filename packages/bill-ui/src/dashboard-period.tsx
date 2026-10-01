import type { ElementType, ReactNode } from 'react';
import './dashboard-period.scss';

/** Hosts own range selection, routing and platform picker behavior. */
export function DashboardPeriodToolbar({ children, primitive: Box = 'div' }: { children: ReactNode; primitive?: ElementType }) {
  return <Box className="bill-dashboard-period-toolbar">{children}</Box>;
}

export function DashboardPeriodContent({ title, start, end, chevron, selectable = false, primitives: { Box = 'span', Text = 'span' } = {} }: {
  title: ReactNode;
  start: ReactNode;
  end: ReactNode;
  chevron?: ReactNode;
  selectable?: boolean;
  primitives?: { Box?: ElementType; Text?: ElementType };
}) {
  return (
    <>
      <Box className={`bill-dashboard-period-title${selectable ? ' bill-dashboard-period-title--selectable' : ''}`}>
        {title}
        {chevron}
      </Box>
      <Text className="bill-dashboard-period-range">
        {start}
        {' '}
        —
        {' '}
        {end}
      </Text>
    </>
  );
}
