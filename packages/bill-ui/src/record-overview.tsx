import type { ElementType, ReactNode } from 'react';
import './record-overview.scss';

export function RecordOverviewRowContent({ amount, amountTone = 'neutral', icon, originalAmount, primary, secondary, primitives = { Box: 'div', Text: 'span', Deleted: 'del' } }: {
  amount: ReactNode;
  amountTone?: 'expense' | 'income' | 'neutral';
  icon: ReactNode;
  originalAmount?: ReactNode;
  primary: ReactNode;
  secondary?: ReactNode;
  primitives?: { Box: ElementType; Text: ElementType; Deleted: ElementType };
}) {
  const { Box, Text, Deleted } = primitives;
  return (
    <Box className={`bill-overview-record__content flex h-full w-full min-w-0 items-center gap-[13px] px-[18px]${secondary ? ' bill-overview-record__content--secondary' : ''}`} data-record-content>
      {icon}
      <Text className="bill-overview-record__copy">
        <Text className="bill-overview-record__primary">{primary}</Text>
        {secondary && <Text className="bill-overview-record__secondary">{secondary}</Text>}
      </Text>
      <Text className={`bill-overview-record__amount font-number text-[15px] font-bold leading-[22.5px] bill-overview-record__amount--${amountTone}`} data-record-amount>
        <Text className="bill-overview-record__amount-value">{amount}</Text>
        {originalAmount && <Deleted className="bill-overview-record__original" data-record-original-amount>{originalAmount}</Deleted>}
      </Text>
    </Box>
  );
}

export function RecordDateGroupHeader({ date, summaries, variant = 'overview', primitives = { Header: 'header', Text: 'span' } }: {
  date: ReactNode;
  variant?: 'overview' | 'search';
  summaries?: ReactNode;
  primitives?: { Header: ElementType; Text: ElementType; Box?: ElementType };
}) {
  const { Header, Text } = primitives;
  const Box = primitives.Box ?? Text;
  return (
    <Header className={`bill-record-group__header bill-record-group__header--${variant}`}>
      {date}
      <Box className="bill-record-group__summaries">{summaries}</Box>
    </Header>
  );
}

export function RecordGroupSurface({ children, single = false, variant = 'overview', primitive: Box = 'div' }: { children: ReactNode; single?: boolean; variant?: 'overview' | 'search'; primitive?: ElementType }) {
  return <Box className={`${variant === 'overview' ? 'bill-record-group__surface overflow-hidden rounded-[20px] border border-border-primary bg-ww-surface-raised py-0.5' : ''}${single ? ' bill-record-group__surface--single' : ''}`}>{children}</Box>;
}
