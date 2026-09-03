import type { FC, ReactNode } from 'react';
import type { MemberColorKey } from '@/shared/config/member-colors';
import { Toast } from 'antd-mobile';
import copy from 'copy-to-clipboard';
import { ChevronLeft, ChevronRight, Copy, Pencil, Share2, Trash2 } from 'lucide-react';
import { Fragment, useEffect, useRef } from 'react';
import { MEMBER_COLOR_PALETTE } from '@/shared/config/member-colors';
import { useTranslation } from '@/shared/i18n';
import { formatAmount } from '@/shared/lib';
import { Icon, Surface } from '@/shared/ui';

export interface RecordDetailRow {
  copyValue?: string;
  label: string;
  onClick?: () => void;
  testId?: string;
  value: string;
}

export interface RecordDetailAction {
  disabled?: boolean;
  label: string;
  onClick: () => void;
  testId?: string;
  tone?: 'danger' | 'primary';
}

export interface RecordDetailPresentationProps {
  amount?: string;
  amountType?: 'add' | 'sub';
  backLabel: string;
  category: {
    icon: string;
    name: string;
  };
  categoryIcon?: ReactNode;
  memberColorKey?: MemberColorKey;
  footerActions?: readonly RecordDetailAction[];
  onBack: () => void;
  pinnedAction?: RecordDetailAction;
  rows: readonly RecordDetailRow[];
  showNavigation?: boolean;
  supplementaryContent?: ReactNode;
  supplementaryRows?: readonly RecordDetailRow[];
}

function displayAmount(amount?: string) {
  if (amount === undefined || Number.isNaN(Number(amount)))
    return amount ?? '--';
  return formatAmount(Number(amount));
}

function DetailRows({ onCopy, rows }: { onCopy: (value: string) => void; rows: readonly RecordDetailRow[] }) {
  return rows.map(item => (
    <Fragment key={item.label}>
      {item.onClick
        ? (
            <button
              className="flex min-h-[62px] w-full items-center gap-4 border-0 border-b border-solid border-border-primary bg-transparent py-3.5 text-left last:border-b-0"
              data-record-detail-row
              data-testid={item.testId}
              onClick={item.onClick}
              type="button"
            >
              <span className="w-[72px] shrink-0 text-[12px] font-semibold text-ww-soft">{item.label}</span>
              <span className="min-w-0 flex-1 break-words text-[13px] font-bold leading-5 text-ww-ink">{item.value}</span>
              <ChevronRight className="shrink-0 text-ww-ghost" size={15} />
            </button>
          )
        : item.copyValue
          ? (
              <button
                aria-label={`Copy ${item.label}`}
                className="flex min-h-[62px] w-full items-center gap-4 border-0 border-b border-solid border-border-primary bg-transparent py-3.5 text-left last:border-b-0 active:bg-primary-light/20"
                data-record-detail-copyable
                data-record-detail-row
                data-testid={item.testId}
                onClick={() => onCopy(item.copyValue!)}
                type="button"
              >
                <span className="w-[72px] shrink-0 text-[12px] font-semibold text-ww-soft">{item.label}</span>
                <span className="min-w-0 flex-1 break-words text-[13px] font-bold leading-5 text-ww-ink">{item.value}</span>
                <Copy aria-hidden="true" className="shrink-0 text-primary-deep" size={15} strokeWidth={1.9} />
              </button>
            )
          : (
              <div
                className="flex min-h-[62px] w-full items-center gap-4 border-0 border-b border-solid border-border-primary py-3.5 last:border-b-0"
                data-record-detail-row
                data-testid={item.testId}
              >
                <span className="w-[72px] shrink-0 text-[12px] font-semibold text-ww-soft">{item.label}</span>
                <span className="min-w-0 flex-1 break-words text-[13px] font-bold leading-5 text-ww-ink">{item.value}</span>
              </div>
            )}
    </Fragment>
  ));
}

export const RecordDetailPresentation: FC<RecordDetailPresentationProps> = ({
  amount,
  amountType,
  backLabel,
  category,
  categoryIcon,
  memberColorKey,
  footerActions = [],
  onBack,
  pinnedAction,
  rows,
  showNavigation = true,
  supplementaryContent,
  supplementaryRows = [],
}) => {
  const { t } = useTranslation('common');
  const amountTone = amountType === 'add' ? 'text-finance-income' : 'text-ww-ink';
  const amountSign = amountType === 'add' ? '+' : amountType === 'sub' ? '-' : '';
  const mainRef = useRef<HTMLElement>(null);
  const amountValue = amount === undefined ? undefined : `${amountSign}¥${displayAmount(amount)}`;

  const handleCopy = async (value: string) => {
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        copied = true;
      }
    }
    catch {
      copied = false;
    }
    copied ||= copy(value);
    Toast.show({
      content: t(copied ? 'confirm.copySuccess' : 'api.requestFailed'),
      icon: copied ? 'success' : 'fail',
    });
  };

  useEffect(() => {
    mainRef.current?.scrollTo?.({ top: 0 });
  }, []);

  return (
    <div className="page-new relative overflow-hidden" data-record-detail-presentation>
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-20 h-52 w-52 rounded-full bg-primary-light/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-20 top-[54%] h-52 w-52 rounded-full bg-ww-pink-light/25 blur-3xl" />

      {showNavigation && (
        <header className="relative z-10 flex h-[60px] shrink-0 items-center justify-center px-[18px] pt-[max(8px,env(safe-area-inset-top))]" data-record-detail-navigation>
          <button
            aria-label={backLabel}
            className="absolute left-[18px] flex h-11 w-11 items-center justify-center rounded-full border border-solid border-border-primary bg-white/80 text-primary-deep shadow-ww-xs"
            onClick={onBack}
            type="button"
          >
            <ChevronLeft size={19} />
          </button>
          <h1 className="max-w-[220px] truncate text-[17px] font-extrabold text-ww-ink">{category.name}</h1>
        </header>
      )}

      <main
        className="relative z-[1] min-h-0 flex-grow overflow-y-auto px-[18px] pb-[calc(96px+env(safe-area-inset-bottom))] pt-1"
        ref={mainRef}
      >
        <div className="mx-auto w-full max-w-[520px] space-y-4">
          <Surface
            className="relative overflow-hidden px-5 py-5"
            data-record-detail-header
            material="raised"
          >
            <div aria-hidden="true" className="absolute -right-7 -top-9 h-32 w-32 rounded-full border-[22px] border-solid border-white/25" />
            <div className="relative flex items-center gap-3" data-record-detail-category>
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] border border-white/80 text-primary-deep shadow-ww-xs"
                data-category-icon={category.icon}
                style={memberColorKey
                  ? {
                      backgroundColor: MEMBER_COLOR_PALETTE[memberColorKey].background,
                      color: MEMBER_COLOR_PALETTE[memberColorKey].foreground,
                    }
                  : { backgroundColor: 'rgba(255,255,255,0.75)' }}
              >
                {categoryIcon ?? <Icon className="text-[26px]" name={category.icon} />}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-[18px] font-black leading-7 text-ww-ink">{category.name}</h2>
              </div>
              {pinnedAction && (
                <button
                  aria-label={pinnedAction.label}
                  className="flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-white/80 bg-white/65 px-3 text-[11px] font-bold text-primary-deep shadow-ww-xs backdrop-blur-sm disabled:opacity-50"
                  data-record-detail-pin
                  data-testid={pinnedAction.testId}
                  disabled={pinnedAction.disabled}
                  onClick={pinnedAction.onClick}
                  type="button"
                >
                  <Share2 size={14} strokeWidth={1.9} />
                  {pinnedAction.label}
                </button>
              )}
            </div>

            {amount !== undefined && (
              <div className="relative mt-6 border-0 border-t border-solid border-white/60 pt-4">
                <button
                  aria-label="Copy amount"
                  className={`-ml-2 flex items-center rounded-lg border-0 bg-transparent px-2 py-1 font-number text-[34px] font-black leading-10 tracking-[-0.8px] active:bg-white/40 ${amountTone}`}
                  data-record-detail-amount
                  data-record-detail-copyable
                  onClick={() => void handleCopy(amountValue!)}
                  type="button"
                >
                  <span className="mr-1 text-[17px] font-extrabold">
                    {amountSign}
                    ¥
                  </span>
                  {displayAmount(amount)}
                  <Copy aria-hidden="true" className="ml-2 shrink-0" size={16} strokeWidth={1.9} />
                </button>
              </div>
            )}
          </Surface>

          <Surface className="px-4 py-1" data-record-detail-information material="content">
            <DetailRows onCopy={value => void handleCopy(value)} rows={rows} />
          </Surface>

          {(supplementaryRows.length > 0 || supplementaryContent) && (
            <Surface className="overflow-hidden px-4 py-1" data-record-detail-supplementary material="content">
              <DetailRows onCopy={value => void handleCopy(value)} rows={supplementaryRows} />
              {supplementaryContent}
            </Surface>
          )}
        </div>
      </main>

      {footerActions.length > 0 && (
        <div className="fixed bottom-0 left-0 z-30 w-full px-[18px] pb-[max(14px,env(safe-area-inset-bottom))]" data-record-detail-footer>
          <div className="mx-auto flex h-[58px] w-full max-w-[520px] items-center gap-2 rounded-[22px] border border-border-primary bg-white/[0.9] p-1.5 shadow-ww-floating backdrop-blur-xl">
            {footerActions.map((action, index) => {
              const isDanger = action.tone === 'danger' || (footerActions.length > 1 && index === footerActions.length - 1);
              const ActionIcon = isDanger ? Trash2 : Pencil;
              return (
                <button
                  className={`flex h-full min-w-0 flex-1 items-center justify-center gap-2 rounded-[17px] border-0 text-[13px] font-extrabold transition active:scale-[0.98] disabled:opacity-45 ${isDanger ? 'bg-feedback-danger-surface/55 text-feedback-danger' : 'bg-primary text-white shadow-ww-xs'}`}
                  data-testid={action.testId}
                  disabled={action.disabled}
                  key={action.label}
                  onClick={action.onClick}
                  type="button"
                >
                  <ActionIcon size={16} strokeWidth={1.9} />
                  <span className="truncate">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
