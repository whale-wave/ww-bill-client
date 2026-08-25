import { Toast } from 'antd-mobile';
import html2canvas from 'html2canvas';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMonthBillDetailQuery } from '@/entities/record';
import { useTranslation } from '@/shared/i18n';
import { downloadCanvas } from '@/shared/lib';
import { DesignIcon, IllustratedEmptyState, PageHeader, PageLoadingState, Button as WwButton } from '@/shared/ui';
import { formatMonthTitle } from './model/monthBillDetail';
import { MonthBillDetailRenderer } from './ui/MonthBillDetailRenderer';

const MONTH_PATTERN = /^\d{4}-(?:0[1-9]|1[0-2])$/;
const EXPORT_CHART_KEYS = new Set(['expense-pie', 'expense-daily', 'expense-monthly', 'income-monthly']);

type ExportStatus = 'idle' | 'preparing' | 'rendering';

function waitForImages(element: HTMLElement) {
  return Promise.all(Array.from(element.querySelectorAll('img')).map((image) => {
    if (image.complete)
      return typeof image.decode === 'function' ? image.decode().catch(() => undefined) : Promise.resolve();
    return new Promise<void>((resolve) => {
      image.addEventListener('load', () => resolve(), { once: true });
      image.addEventListener('error', () => resolve(), { once: true });
    });
  }));
}

function waitForFrames(count = 2) {
  return Array.from({ length: count }).reduce<Promise<void>>(
    promise => promise.then(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve()))),
    Promise.resolve(),
  );
}

function isValidMonth(month: string | undefined): month is string {
  if (!month || !MONTH_PATTERN.test(month))
    return false;
  const currentMonth = new Intl.DateTimeFormat('en-CA', {
    month: '2-digit',
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
  }).format(new Date());
  return month <= currentMonth;
}

export default function MonthBillDetailPage() {
  const { month } = useParams<{ month: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('bill');
  const isMonthValid = isValidMonth(month);
  const query = useMonthBillDetailQuery({
    month: month ?? '',
    queryOptions: { enabled: isMonthValid },
  });
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [exportMounted, setExportMounted] = useState(false);
  const [readyCharts, setReadyCharts] = useState<Set<string>>(() => new Set());
  const [qrCode, setQrCode] = useState<string>();
  const exportRef = useRef<HTMLDivElement>(null);
  const hasCapturedRef = useRef(false);

  useEffect(() => {
    if (!isMonthValid)
      navigate('/bill', { replace: true });
  }, [isMonthValid, navigate]);

  const handleChartReady = useCallback((chartKey: string) => {
    if (!EXPORT_CHART_KEYS.has(chartKey))
      return;
    setReadyCharts((previous) => {
      if (previous.has(chartKey))
        return previous;
      const next = new Set(previous);
      next.add(chartKey);
      return next;
    });
  }, []);

  const captureExport = useCallback(async () => {
    if (!exportRef.current || !query.data || hasCapturedRef.current)
      return;
    hasCapturedRef.current = true;
    try {
      await document.fonts.ready;
      await waitForImages(exportRef.current);
      await waitForFrames();
      setExportStatus('rendering');
      const width = exportRef.current.scrollWidth;
      const height = exportRef.current.scrollHeight;
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: null,
        height,
        logging: false,
        scale: Math.min(2, 16000 / Math.max(1, height)),
        scrollX: 0,
        scrollY: 0,
        useCORS: true,
        width,
        windowHeight: height,
        windowWidth: width,
      });
      downloadCanvas(canvas, `鲸浪账本_${query.data.month}月账单`);
      Toast.show({ content: t('exportSaved'), icon: 'success' });
    }
    catch {
      Toast.show({ content: t('exportSaveFailed'), icon: 'fail' });
    }
    finally {
      setExportMounted(false);
      setReadyCharts(new Set());
      setQrCode(undefined);
      setExportStatus('idle');
      hasCapturedRef.current = false;
    }
  }, [query.data, t]);

  useEffect(() => {
    if (exportMounted && readyCharts.size === EXPORT_CHART_KEYS.size)
      void captureExport();
  }, [captureExport, exportMounted, readyCharts.size]);

  const handleSave = useCallback(async () => {
    if (!query.data || exportStatus !== 'idle')
      return;
    setExportStatus('preparing');
    setReadyCharts(new Set());
    hasCapturedRef.current = false;
    await document.fonts.ready;
    const publicUrl = import.meta.env.VITE_PUBLIC_APP_URL;
    if (publicUrl) {
      try {
        const qrModule = await import('qrcode');
        const dataUrl = await qrModule.toDataURL(publicUrl, { margin: 1, width: 240 });
        setQrCode(dataUrl);
      }
      catch {
        setQrCode(undefined);
      }
    }
    setExportMounted(true);
  }, [exportStatus, query.data]);

  if (!isMonthValid)
    return null;

  return (
    <div className="page-new overflow-hidden">
      <PageHeader backLabel={t('common:nav.back')} onBack={() => navigate('/bill')} title={formatMonthTitle(month)} />
      <main className="min-h-0 flex-grow overflow-auto px-[18px] pb-28 pt-2" data-bill-detail-scroll>
        {query.isLoading && <PageLoadingState label={t('common:nav.loading')} testId="month-bill-detail-loading" />}
        {!query.isLoading && query.isError && (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-center">
            <div className="text-[15px] font-bold text-ww-ink">{t('detailLoadFailed')}</div>
            <button className="h-11 rounded-[16px] border border-border-primary bg-white/85 px-5 text-[13px] font-extrabold text-primary-deep shadow-ww-xs" onClick={() => void query.refetch()} type="button">{t('common:retry')}</button>
          </div>
        )}
        {!query.isLoading && !query.isError && query.data && query.data.summary.recordCount === 0 && (
          <IllustratedEmptyState
            accentIcon={<DesignIcon name="tab-add" size={20} />}
            actionLabel={t('emptyAction')}
            className="min-h-[320px]"
            description={t('emptyDescription')}
            icon={<DesignIcon name="shortcut-bill" size={46} />}
            onAction={() => navigate('/bookkeeping')}
            title={t('emptyTitle')}
          />
        )}
        {!query.isLoading && !query.isError && query.data && query.data.summary.recordCount > 0 && <MonthBillDetailRenderer data={query.data} mode="screen" />}
      </main>
      <div className="absolute bottom-0 left-0 right-0 z-20 shrink-0 bg-gradient-to-t from-[#f4fbff] via-[#f4fbff]/95 to-transparent px-[18px] pb-[max(12px,env(safe-area-inset-bottom))] pt-5">
        <WwButton className="!h-12 !rounded-[16px] !bg-[linear-gradient(135deg,#6fc2dc,#4aaac4)] !font-bold !text-white !shadow-ww" disabled={exportStatus !== 'idle'} loading={exportStatus !== 'idle'} onClick={() => void handleSave()} size="full">{exportStatus === 'idle' ? t('saveImage') : t('savingImage')}</WwButton>
      </div>
      {exportMounted && query.data && (
        <div aria-hidden="true" className="pointer-events-none fixed left-[-10000px] top-0" ref={exportRef}>
          <MonthBillDetailRenderer data={query.data} mode="export" onChartReady={handleChartReady} qrCode={qrCode} />
        </div>
      )}
    </div>
  );
}
