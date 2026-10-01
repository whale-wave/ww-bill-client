import type { ElementType, ReactNode, Ref } from 'react';
import './record-entry.scss';

export interface RecordEntryRowProps {
  amountControl: ReactNode;
  caption: ReactNode;
  className?: string;
  noteInput: ReactNode;
  primitives?: { Box: ElementType; Note: ElementType; Text: ElementType };
}

export function RecordEntryRow({ amountControl, caption, className = '', noteInput, primitives = { Box: 'div', Note: 'label', Text: 'div' } }: RecordEntryRowProps) {
  const { Box, Note, Text } = primitives;
  return (
    <Box className={`bill-record-entry record-editor-entry-row ${className}`} data-record-editor-entry-row>
      <Note className="bill-record-entry__note flex h-full min-w-0 flex-1 flex-col justify-center" data-record-editor-note>
        <Text className="bill-record-entry__caption record-editor-amount-caption truncate text-[10px] font-semibold leading-4 text-primary-deep">{caption}</Text>
        {noteInput}
      </Note>
      {amountControl}
    </Box>
  );
}

export interface RecordAmountVisualProps<Element = unknown> {
  digits?: ReactNode | ((fontSize: number) => ReactNode);
  digitsRef?: Ref<Element>;
  primitives?: { Box: ElementType; Text: ElementType };
  value: string;
}

export function RecordAmountVisual<Element = unknown>({ digits, digitsRef, primitives = { Box: 'span', Text: 'span' }, value }: RecordAmountVisualProps<Element>) {
  const { Box, Text } = primitives;
  const size = value.length > 11 ? 23 : value.length > 8 ? 28 : 34;
  const sizeClassName = size === 23 ? 'text-[23px]' : size === 28 ? 'text-[28px]' : 'text-[34px]';
  return (
    <Box className={`bill-record-amount record-editor-total bill-record-amount--${size} flex max-w-full min-w-0 items-center whitespace-nowrap font-number font-black leading-[44px] tracking-[-1px] text-ww-ink ${sizeClassName}`} data-record-editor-total>
      <Text className="bill-record-amount__currency mr-0.5 shrink-0 text-[18px] font-bold tracking-normal text-ww-soft">¥</Text>
      <Box className="bill-record-amount__digits min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" data-record-editor-amount-digits ref={digitsRef}>{typeof digits === 'function' ? digits(size) : digits ?? value}</Box>
    </Box>
  );
}
