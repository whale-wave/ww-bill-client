import type { ElementType, ReactNode } from 'react';
import { Fragment } from 'react';
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
      <Box className="bill-overview-record__copy">
        <Text className="bill-overview-record__primary">{primary}</Text>
        {secondary && <Box className="bill-overview-record__secondary">{secondary}</Box>}
      </Box>
      <Box className={`bill-overview-record__amount font-number text-[15px] font-bold leading-[22.5px] bill-overview-record__amount--${amountTone}`} data-record-amount>
        <Text className="bill-overview-record__amount-value">{amount}</Text>
        {originalAmount && <Deleted className="bill-overview-record__original" data-record-original-amount>{originalAmount}</Deleted>}
      </Box>
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

export function RecordDateLabelVisual({ label, primitive: Text = 'span' }: { label: ReactNode; primitive?: ElementType }) {
  if (typeof label !== 'string')
    return label;
  const [date, ...detail] = label.split(' ');
  return (
    <>
      <Text className="bill-record-group__date">{date}</Text>
      {detail.length > 0 && (
        <>
          {' '}
          <Text className="bill-record-group__date-detail">{detail.join(' ')}</Text>
        </>
      )}
    </>
  );
}

export function RecordStateSurface({ children, primitive: Box = 'div' }: { children: ReactNode; primitive?: ElementType }) {
  return <Box className="bill-record-state-surface">{children}</Box>;
}

/** Keep the attachment marker readable when the explanation is truncated. */
export function RecordSecondaryContent({ copy, attachmentIcon, primitives = { Box: 'span', Text: 'span' } }: {
  copy?: ReactNode;
  attachmentIcon?: ReactNode;
  primitives?: { Box: ElementType; Text: ElementType };
}) {
  const { Box, Text } = primitives;
  return (
    <Fragment>
      {copy && <Text className="bill-record-secondary__copy">{copy}</Text>}
      {attachmentIcon && <Box className="bill-record-secondary__attachment">{attachmentIcon}</Box>}
    </Fragment>
  );
}
