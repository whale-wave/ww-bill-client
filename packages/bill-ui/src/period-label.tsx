import type { ElementType, ReactNode } from 'react';
import './period-label.scss';

export function PeriodLabel({ year, yearSuffix, month, monthSuffix, primitive: Text = 'span' }: {
  year: ReactNode;
  yearSuffix?: ReactNode;
  month?: ReactNode;
  monthSuffix?: ReactNode;
  primitive?: ElementType;
}) {
  return (
    <>
      <Text className="bill-period-label bill-period-label--muted">
        {year}
        {yearSuffix}
      </Text>
      {month !== undefined && (
        <Text className="bill-period-label">
          {month}
          {monthSuffix}
        </Text>
      )}
    </>
  );
}
