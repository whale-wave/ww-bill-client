import type { CSSProperties, HTMLAttributes, KeyboardEvent, PointerEvent } from 'react';
import type { LedgerListItem } from '../types';
import { Tag } from 'antd-mobile';
import { PayCircleOutline } from 'antd-mobile-icons';
import { useEffect, useRef } from 'react';
import { useTranslation } from '@/shared/i18n';
import { LedgerStatus } from '../types';

const LONG_PRESS_DELAY = 420;
const LONG_PRESS_MOVE_TOLERANCE = 8;

type LedgerTagStyle = CSSProperties & Partial<Record<
  '--background-color' | '--border-color' | '--text-color',
  string
>>;

const WHITE_TAG_STYLE: LedgerTagStyle = {
  '--background-color': 'rgb(255 255 255 / 92%)',
  '--border-color': 'transparent',
  '--text-color': 'color-mix(in srgb, var(--ww-theme-color) 54%, var(--ww-theme-text-color))',
};

export interface LedgerCoverCardProps {
  interactionProps?: HTMLAttributes<HTMLButtonElement>;
  isDragging?: boolean;
  ledger: LedgerListItem;
  onEnterSortMode?: () => void;
  onOpen?: () => void;
  sorting?: boolean;
  style?: CSSProperties;
}

export function LedgerCoverCard({
  interactionProps,
  isDragging = false,
  ledger,
  onEnterSortMode,
  onOpen,
  sorting = false,
  style,
}: LedgerCoverCardProps) {
  const { t } = useTranslation('ledger');
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const longPressOriginRef = useRef<{ x: number; y: number }>();
  const didLongPressRef = useRef(false);

  const clearLongPress = () => {
    if (longPressTimerRef.current)
      clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = undefined;
    longPressOriginRef.current = undefined;
  };

  useEffect(() => clearLongPress, []);

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    interactionProps?.onPointerDown?.(event);
    if (
      sorting
      || event.button !== 0
      || event.defaultPrevented
      || !onEnterSortMode
    ) {
      return;
    }

    didLongPressRef.current = false;
    clearLongPress();
    longPressOriginRef.current = { x: event.clientX, y: event.clientY };
    longPressTimerRef.current = setTimeout(() => {
      didLongPressRef.current = true;
      longPressOriginRef.current = undefined;
      onEnterSortMode();
    }, LONG_PRESS_DELAY);
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    interactionProps?.onPointerMove?.(event);
    const origin = longPressOriginRef.current;
    if (
      sorting
      || !origin
      || Math.hypot(event.clientX - origin.x, event.clientY - origin.y)
      <= LONG_PRESS_MOVE_TOLERANCE
    ) {
      return;
    }
    clearLongPress();
  };

  const handlePointerEnd = () => clearLongPress();

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    interactionProps?.onKeyDown?.(event);
    if (sorting || event.defaultPrevented)
      return;

    if (event.key === ' ') {
      event.preventDefault();
      onEnterSortMode?.();
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      onOpen?.();
    }
  };

  const handleClick = () => {
    clearLongPress();
    if (didLongPressRef.current) {
      didLongPressRef.current = false;
      return;
    }
    if (!sorting)
      onOpen?.();
  };

  const accessibleDetails = [
    ledger.name,
    ledger.activeMemberCount > 1
      ? t('center.sharedMemberCount', { count: ledger.activeMemberCount })
      : undefined,
    ledger.status === LedgerStatus.SUSPENDED ? t('center.suspendedShort') : undefined,
    sorting ? t('center.sortable') : undefined,
  ].filter(Boolean).join(t('common.listSeparator'));

  return (
    <button
      {...interactionProps}
      aria-label={accessibleDetails}
      className={`ledger-cover-card${isDragging ? ' ledger-cover-card--dragging' : ''}`}
      data-ledger-id={ledger.id}
      data-ledger-status={ledger.status}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onPointerCancel={handlePointerEnd}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerEnd}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      style={style}
      type="button"
    >
      <span aria-hidden="true" className="ledger-cover-card__motif">
        <PayCircleOutline />
        <PayCircleOutline />
        <PayCircleOutline />
      </span>
      <PayCircleOutline aria-hidden="true" className="ledger-cover-card__currency" />
      <span className="ledger-cover-card__meta">
        {ledger.activeMemberCount > 1 && (
          <Tag
            className="ledger-cover-card__tag"
            fill="solid"
            style={WHITE_TAG_STYLE}
          >
            {t('center.memberCount', { count: ledger.activeMemberCount })}
          </Tag>
        )}
        {ledger.status === LedgerStatus.SUSPENDED && (
          <Tag
            className="ledger-cover-card__status"
            fill="solid"
            style={WHITE_TAG_STYLE}
          >
            {t('center.suspendedShort')}
          </Tag>
        )}
      </span>
      <span className="ledger-cover-card__title">{ledger.name}</span>
    </button>
  );
}
