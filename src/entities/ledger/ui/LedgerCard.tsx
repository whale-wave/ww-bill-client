import type { FC } from 'react';
import type { Ledger } from '../types';
import { RightOutline } from 'antd-mobile-icons';
import { LedgerVisualIcon } from './LedgerVisualIcon';

interface LedgerCardProps {
  ledger: Ledger;
  kindLabel: string;
  roleLabel: string;
  statusLabel: string;
  templateLabel: string;
  themeLabel: string;
  onClick: () => void;
}

export const LedgerCard: FC<LedgerCardProps> = ({
  kindLabel,
  ledger,
  onClick,
  roleLabel,
  statusLabel,
  templateLabel,
  themeLabel,
}) => {
  return (
    <button
      className="card-rounded flex w-full items-center border-0 bg-white px-4 py-3 text-left active:bg-slate-50"
      data-ledger-id={ledger.id}
      data-ledger-theme={ledger.themeKey}
      onClick={onClick}
      type="button"
    >
      <span className="mr-3 flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-full bg-primary text-xl text-font-black">
        <LedgerVisualIcon iconKey={ledger.iconKey} kind={ledger.kind} templateKey={ledger.templateKey} />
      </span>
      <span className="min-w-0 flex-grow">
        <span className="one-line block text-base font-medium text-font-black">
          {ledger.name}
        </span>
        <span className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-font-gray">
          <span>{kindLabel}</span>
          <span>{templateLabel}</span>
          <span>{themeLabel}</span>
        </span>
        <span className="mt-1 flex gap-2 text-xs text-font-gray">
          <span>{roleLabel}</span>
          <span aria-hidden>·</span>
          <span>{statusLabel}</span>
        </span>
      </span>
      <RightOutline className="ml-3 flex-shrink-0 text-font-gray" />
    </button>
  );
};
