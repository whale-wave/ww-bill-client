import type { FC } from 'react';
import type { AssetRecord } from '@/entities/asset';
import { DatePicker, Skeleton } from 'antd-mobile';
import dayjs from 'dayjs';
import { CalendarDays, ChevronDown, ReceiptText, RefreshCcw } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useGetAssetRecordQuery } from '@/entities/asset';
import { useTranslation } from '@/shared/i18n';
import { formatAmount, formatLocalizedMonthDay } from '@/shared/lib';
import { GradientPanel, IllustratedEmptyState, showAppInfoDialog } from '@/shared/ui';

interface RecordGroup {
  date: string;
  key: string;
  list: AssetRecord[];
}

export const AssetRecordList: FC<{ assetId: string }> = ({ assetId }) => {
  const { i18n, t } = useTranslation('asset');
  const [selectMonth, setSelectMonth] = useState(() => dayjs());
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const startTime = useMemo(() => selectMonth.startOf('month').valueOf(), [selectMonth]);
  const endTime = useMemo(() => selectMonth.endOf('month').valueOf(), [selectMonth]);
  const query = useGetAssetRecordQuery({
    params: { assetId, startTime, endTime },
    options: { enabled: Boolean(assetId) },
  });

  const groups = useMemo<RecordGroup[]>(() => {
    const recordsByDay = query.data.reduce((acc, record) => {
      const key = dayjs(record.createdAt).startOf('day').format('YYYY-MM-DD');
      const records = acc.get(key) ?? [];
      records.push(record);
      acc.set(key, records);
      return acc;
    }, new Map<string, AssetRecord[]>());

    return [...recordsByDay.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, list]) => ({
        date: formatLocalizedMonthDay(`${key}T12:00:00`, locale),
        key,
        list,
      }));
  }, [locale, query.data]);

  const monthLabel = useMemo(() => new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(selectMonth.toDate()), [locale, selectMonth]);

  const handleSelectMonth = useCallback(async () => {
    const value = await DatePicker.prompt({
      className: 'ww-app-date-picker',
      defaultValue: selectMonth.toDate(),
      precision: 'month',
      title: t('detail.selectMonth'),
    });
    if (value)
      setSelectMonth(dayjs(value));
  }, [selectMonth, t]);

  const handleRecord = useCallback((record: AssetRecord) => {
    const sign = record.type === 'sub' ? '-' : '+';
    void showAppInfoDialog({
      confirmText: t('common:nav.confirm'),
      description: (
        <span className="block whitespace-pre-line">
          {record.comment || t('detail.noRemark')}
          {'\n'}
          {t('detail.recordAmountChange', {
            after: formatAmount(Number(record.afterAmount)),
            before: formatAmount(Number(record.beforeAmount)),
            change: `${sign}¥${formatAmount(Number(record.amount))}`,
          })}
        </span>
      ),
      icon: <RefreshCcw size={22} strokeWidth={1.8} />,
      title: record.name,
    });
  }, [t]);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-[14px] font-black leading-5 text-ww-ink">{t('detail.recordList')}</h2>
          <p className="mt-0.5 text-[10px] font-semibold text-ww-soft">{t('detail.recordListDescription')}</p>
        </div>
        <button
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-[13px] border border-solid border-border-primary bg-white/78 px-3 font-number text-[11px] font-bold text-primary-deep shadow-ww-xs"
          onClick={() => void handleSelectMonth()}
          type="button"
        >
          <CalendarDays size={14} strokeWidth={1.9} />
          {monthLabel}
          <ChevronDown size={13} strokeWidth={2.2} />
        </button>
      </div>

      {query.isLoading && (
        <GradientPanel className="p-5" elevation="low" surface="glass">
          <Skeleton.Title animated />
          <Skeleton.Paragraph animated lineCount={4} />
        </GradientPanel>
      )}

      {!query.isLoading && query.isError && (
        <GradientPanel elevation="low" surface="glass">
          <IllustratedEmptyState
            actionLabel={t('retry')}
            className="min-h-[260px]"
            description={t('detail.recordsLoadErrorDescription')}
            icon={<ReceiptText className="text-primary-deep" size={40} strokeWidth={1.6} />}
            onAction={() => void query.refetch()}
            title={t('detail.recordsLoadError')}
          />
        </GradientPanel>
      )}

      {!query.isLoading && !query.isError && groups.length === 0 && (
        <GradientPanel elevation="low" surface="glass">
          <IllustratedEmptyState
            className="min-h-[260px]"
            description={t('detail.emptyRecordsDescription')}
            icon={<ReceiptText className="text-primary-deep" size={40} strokeWidth={1.6} />}
            title={t('detail.emptyRecords')}
          />
        </GradientPanel>
      )}

      {!query.isLoading && !query.isError && groups.length > 0 && (
        <div className="space-y-3">
          {groups.map(group => (
            <GradientPanel className="overflow-hidden" elevation="low" key={group.key} surface="glass">
              <header className="border-0 border-b border-solid border-border-primary bg-[linear-gradient(90deg,rgba(226,246,255,0.72),rgba(255,242,247,0.35))] px-4 py-2.5 text-[10px] font-extrabold text-ww-mid">
                {group.date}
              </header>
              <div>
                {group.list.map((record, index) => {
                  const isExpense = record.type === 'sub';
                  return (
                    <button
                      className={`flex min-h-[68px] w-full items-center gap-3 border-0 bg-transparent px-4 text-left active:bg-primary-light/20 ${index ? 'border-t border-solid border-border-primary' : ''}`}
                      key={record.id}
                      onClick={() => handleRecord(record)}
                      type="button"
                    >
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] ${isExpense ? 'bg-ww-pink-light/60 text-[#b24f71]' : 'bg-primary-light/65 text-primary-deep'}`}>
                        <RefreshCcw size={18} strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-black text-ww-ink">{record.name}</span>
                        <span className="mt-0.5 block truncate text-[10px] font-semibold text-ww-soft">{record.comment || t('detail.noRemark')}</span>
                      </span>
                      <span className={`shrink-0 font-number text-[14px] font-black ${isExpense ? 'text-[#c04870]' : 'text-[#2a9460]'}`}>
                        {isExpense ? '-' : '+'}
                        ¥
                        {formatAmount(Number(record.amount))}
                      </span>
                    </button>
                  );
                })}
              </div>
            </GradientPanel>
          ))}
        </div>
      )}
    </section>
  );
};
