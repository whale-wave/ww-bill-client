import { DatePicker, Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import { ArrowRight, CalendarDays, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecordApi } from '@/entities/record';
import { useTranslation } from '@/shared/i18n';
import { exportData } from '@/shared/lib/export-data';
import { PageHeader, Surface } from '@/shared/ui';

enum ChangeType {
  START,
  END,
}
function ExportData() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [exportTimeRange, setExportTimeRange] = useState(() => ({
    endTime: dayjs().format('YYYY-MM-DD'),
    startTime: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
  }));
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    if (isExporting)
      return;
    setIsExporting(true);
    const { startTime, endTime } = exportTimeRange;
    try {
      const res = await getRecordApi({
        startDate: startTime,
        endDate: endTime,
      });

      if (res.statusCode !== 200) {
        Toast.show(res.message);
        return;
      }

      exportData(res.data.data);

      Toast.show(t('common:export.exportSuccess'));
    }
    finally {
      setIsExporting(false);
    }
  };

  const handleChangeTime = async (type: ChangeType) => {
    const max = new Date();
    const { startTime, endTime } = exportTimeRange;
    const selectTime = await DatePicker.prompt({
      cancelText: t('common:nav.cancel'),
      className: 'ww-app-date-picker',
      confirmText: t('common:nav.confirm'),
      max,
      defaultValue: new Date(type === ChangeType.START ? startTime : endTime),
      title: type === ChangeType.START
        ? t('common:export.selectStartTime')
        : t('common:export.selectEndTime'),
    });

    if (!selectTime)
      return;

    const setTimeValue = dayjs(selectTime).format('YYYY-MM-DD');

    switch (type) {
      case ChangeType.START:
        setExportTimeRange({
          ...exportTimeRange,
          startTime: setTimeValue,
        });
        break;
      case ChangeType.END:
        setExportTimeRange({
          ...exportTimeRange,
          endTime: setTimeValue,
        });
        break;
      default:
        break;
    }
  };

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-24 h-52 w-52 rounded-full bg-primary-light/35 blur-3xl" />
      <PageHeader backLabel={t('common:nav.back')} onBack={() => navigate(-1)} title={t('common:export.title')} />
      <main className="relative z-[1] min-h-0 flex-grow overflow-y-auto px-[18px] pb-[max(28px,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-[420px]">
          <Surface className="mb-5 flex items-center gap-3.5 px-4 py-4" material="raised">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-white/80 bg-white/65 text-primary-deep shadow-ww-xs">
              <FileSpreadsheet size={22} strokeWidth={1.8} />
            </span>
            <div>
              <h2 className="text-[14px] font-extrabold text-ww-ink">{t('common:export.rangeTitle')}</h2>
              <p className="mt-0.5 text-[11px] leading-4 text-ww-mid">{t('common:export.description')}</p>
            </div>
          </Surface>

          <Surface className="overflow-hidden px-4 py-1" material="content">
            {([
              [ChangeType.START, t('common:export.startTime'), exportTimeRange.startTime || t('common:placeholder.selectStartTime')],
              [ChangeType.END, t('common:export.endTime'), exportTimeRange.endTime || t('common:placeholder.selectEndTime')],
            ] as const).map(([type, label, value]) => (
              <button className="flex min-h-[72px] w-full items-center gap-3 border-0 border-b border-solid border-border-primary bg-transparent px-0 text-left last:border-b-0" key={type} onClick={() => void handleChangeTime(type)} type="button">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-primary-light/55 text-primary-deep"><CalendarDays size={18} /></span>
                <span className="min-w-0 flex-1">
                  <small className="block text-[10px] font-semibold text-ww-soft">{label}</small>
                  <strong className="mt-1 block text-[14px] text-ww-ink">{value}</strong>
                </span>
                <ArrowRight className="text-ww-soft" size={17} />
              </button>
            ))}
          </Surface>

          <p className="mb-6 mt-3 px-1 text-[10px] leading-4 text-ww-soft">{t('common:export.fileHint')}</p>
          <button className="h-[52px] w-full rounded-[18px] border-0 bg-primary text-[14px] font-extrabold text-white shadow-ww disabled:opacity-45" disabled={isExporting} onClick={() => void handleExportData()} type="button">
            {isExporting ? t('common:nav.loading') : t('common:action.export')}
          </button>
        </div>
      </main>
    </div>
  );
}

export default ExportData;
