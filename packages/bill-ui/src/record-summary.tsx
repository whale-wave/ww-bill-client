import type { ElementType, ReactNode } from 'react';
import './record-summary.scss';

export function RecordSummaryContent({ period, amountToggle, metrics, shortcuts, primitive: Box = 'div' }: { period: ReactNode; amountToggle?: ReactNode; metrics: ReactNode; shortcuts?: ReactNode; primitive?: ElementType }) {
  return (
    <>
      <Box className="bill-record-summary__period-row relative flex min-h-11 items-center justify-between gap-2">
        <Box className="bill-record-summary__period min-w-0 flex-1" data-record-overview-period>{period}</Box>
        {amountToggle}
      </Box>
      <Box data-record-overview-metrics>{metrics}</Box>
      {shortcuts}
    </>
  );
}

export function PageHeadingVisual({ title, icon, actions, className, primitive: Box = 'div' }: { title: ReactNode; icon?: ReactNode; actions?: ReactNode; className?: string; primitive?: ElementType }) {
  return (
    <Box className={`bill-page-heading${className ? ` ${className}` : ''}`}>
      <Box className="bill-page-heading__identity gap-2" data-record-overview-title-row>
        {icon}
        {title}
      </Box>
      {actions && <Box className="bill-page-heading__actions">{actions}</Box>}
    </Box>
  );
}
