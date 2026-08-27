import type { AvatarReadyState, ExportCopySnapshot, ExportUserSnapshot } from './model/monthBillDetail';
import type { MonthBillDetailResponse } from '@/entities/record';
import { Toast } from 'antd-mobile';
import html2canvas from 'html2canvas-pro';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMonthBillDetailQuery } from '@/entities/record';
import { useGetUserUserInfoQuery } from '@/entities/user';
import { useTranslation } from '@/shared/i18n';
import {
  canvasToPngBlob,
  GalleryPermissionDeniedError,
  getImageExportCaptureOptions,
  ImageShareCancelledError,
  saveImageToGallery,
  shareImage,
  waitForImageExportReady,
} from '@/shared/lib';
import { DesignIcon, IllustratedEmptyState, PageHeader, PageLoadingState, Button as WwButton } from '@/shared/ui';
import { formatMonthTitle } from './model/monthBillDetail';
import { MonthBillDetailRenderer } from './ui/MonthBillDetailRenderer';

const MONTH_PATTERN = /^\d{4}-(?:0[1-9]|1[0-2])$/;
const EXPORT_CHART_KEYS = new Set(['expense-pie', 'expense-daily', 'expense-monthly', 'income-monthly']);
const EXPORT_SESSION_WATCHDOG_MS = 30_000;

type ExportStatus = 'idle' | 'preparing' | 'rendering';
type TerminalState = 'success' | 'failure' | 'timeout' | 'cancelled';
type ExportAction = 'save' | 'share';

interface ExportSnapshot {
  bill: MonthBillDetailResponse;
  qrUrl: string;
  sessionId: number;
  user: ExportUserSnapshot;
  copy: ExportCopySnapshot;
}

interface AvatarBarrierState {
  sessionId: number;
  state: 'loading' | AvatarReadyState;
}

async function waitForStrictQr(element: HTMLElement) {
  const image = element.querySelector<HTMLImageElement>('[data-export-qr]');
  if (!image)
    throw new Error('QR image is missing');
  if (!image.complete) {
    await new Promise<void>((resolve, reject) => {
      image.addEventListener('load', () => resolve(), { once: true });
      image.addEventListener('error', () => reject(new Error('QR image failed to load')), { once: true });
    });
  }
  if (!image.complete || image.naturalWidth <= 0 || image.naturalHeight <= 0)
    throw new Error('QR image did not render');
  if (typeof image.decode !== 'function')
    throw new Error('QR image decode is unavailable');
  await image.decode();
  if (image.naturalWidth <= 0 || image.naturalHeight <= 0)
    throw new Error('QR image decode produced an empty image');
}

function getExportFontSample(snapshot: ExportSnapshot) {
  return [
    snapshot.user.displayName,
    snapshot.copy.monthTitle,
    snapshot.copy.reviewSubtitle,
    ...snapshot.bill.expense.categories.map(item => item.name),
    ...snapshot.bill.income.categories.map(item => item.name),
    snapshot.bill.month,
    snapshot.bill.summary.income,
    snapshot.bill.summary.expense,
    snapshot.bill.summary.balance,
    snapshot.bill.monthBillExportQrUrl,
    '收入支出账单月度概览其他分类 ¥￥0123456789.%+-↑↓',
  ].join(' ');
}

function isValidMonth(month: string | undefined): month is string {
  if (!month || !MONTH_PATTERN.test(month))
    return false;
  const currentMonth = new Intl.DateTimeFormat('en-CA', { month: '2-digit', timeZone: 'Asia/Shanghai', year: 'numeric' }).format(new Date());
  return month <= currentMonth;
}

export default function MonthBillDetailPage() {
  const { month } = useParams<{ month: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('bill');
  const isMonthValid = isValidMonth(month);
  const query = useMonthBillDetailQuery({ month: month ?? '', queryOptions: { enabled: isMonthValid } });
  const hasData = Boolean(query.data);
  const userQuery = useGetUserUserInfoQuery({ options: { enabled: isMonthValid } });
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [exportMounted, setExportMounted] = useState(false);
  const [chartsEnabled, setChartsEnabled] = useState(false);
  const [readyCharts, setReadyCharts] = useState<Set<string>>(() => new Set());
  const [qrCode, setQrCode] = useState<string>();
  const [avatarBarrier, setAvatarBarrier] = useState<AvatarBarrierState>();
  const exportRef = useRef<HTMLDivElement>(null);
  const activeSessionRef = useRef(0);
  const nextSessionIdRef = useRef(0);
  const inFlightRef = useRef(false);
  const terminalSessionsRef = useRef(new Set<number>());
  const snapshotRef = useRef<ExportSnapshot>();
  const watchdogRef = useRef<number>();
  const captureStartedRef = useRef(false);
  const exportActionRef = useRef<ExportAction>('save');

  useEffect(() => {
    if (!isMonthValid)
      navigate('/bill', { replace: true });
  }, [isMonthValid, navigate]);

  const finalizeSession = useCallback((sessionId: number, terminal: TerminalState, successMessage?: string) => {
    if (activeSessionRef.current !== sessionId || terminalSessionsRef.current.has(sessionId))
      return;
    terminalSessionsRef.current.add(sessionId);
    if (watchdogRef.current !== undefined)
      window.clearTimeout(watchdogRef.current);
    watchdogRef.current = undefined;
    activeSessionRef.current = 0;
    inFlightRef.current = false;
    snapshotRef.current = undefined;
    captureStartedRef.current = false;
    setExportMounted(false);
    setChartsEnabled(false);
    setReadyCharts(new Set());
    setQrCode(undefined);
    setAvatarBarrier(undefined);
    setExportStatus('idle');
    if (terminal === 'success')
      Toast.show({ content: successMessage || t('exportSaved'), icon: 'success' });
    else if (terminal === 'failure' || terminal === 'timeout')
      Toast.show({ content: successMessage || t('exportSaveFailed'), icon: 'fail' });
  }, [t]);

  useEffect(() => () => {
    if (activeSessionRef.current)
      finalizeSession(activeSessionRef.current, 'cancelled');
  }, [finalizeSession]);

  const handleChartReady = useCallback((sessionId: number, chartKey: string) => {
    if (activeSessionRef.current !== sessionId || terminalSessionsRef.current.has(sessionId) || !EXPORT_CHART_KEYS.has(chartKey))
      return;
    setReadyCharts((previous) => {
      if (previous.has(chartKey))
        return previous;
      const next = new Set(previous);
      next.add(chartKey);
      return next;
    });
  }, []);

  const handleChartError = useCallback((sessionId: number, _chartKey: string, _error: Error) => {
    finalizeSession(sessionId, 'failure');
  }, [finalizeSession]);

  const handleAvatarReady = useCallback((sessionId: number, state: AvatarReadyState) => {
    if (activeSessionRef.current !== sessionId || terminalSessionsRef.current.has(sessionId))
      return;
    setAvatarBarrier({ sessionId, state });
  }, []);

  const captureExport = useCallback(async () => {
    const sessionId = activeSessionRef.current;
    const snapshot = snapshotRef.current;
    const root = exportRef.current;
    const avatarIsReady = avatarBarrier?.sessionId === sessionId
      && (avatarBarrier.state === 'image-ready' || avatarBarrier.state === 'fallback-ready');
    if (!sessionId || !snapshot || !root || captureStartedRef.current || readyCharts.size !== EXPORT_CHART_KEYS.size || !avatarIsReady)
      return;
    const avatarElement = root.querySelector<HTMLElement>('[data-export-avatar]');
    if (!avatarElement || (avatarElement.dataset.exportAvatar !== 'image-ready' && avatarElement.dataset.exportAvatar !== 'fallback-ready'))
      return;
    captureStartedRef.current = true;
    try {
      await waitForImageExportReady(root, { fontSample: getExportFontSample(snapshot) });
      await waitForStrictQr(root);
      if (activeSessionRef.current !== sessionId || terminalSessionsRef.current.has(sessionId))
        return;
      setExportStatus('rendering');
      const canvas = await html2canvas(root, {
        backgroundColor: null,
        logging: false,
        useCORS: true,
        ...getImageExportCaptureOptions(root),
      });
      if (activeSessionRef.current !== sessionId || terminalSessionsRef.current.has(sessionId))
        return;
      const blob = await canvasToPngBlob(canvas);
      const fileName = `鲸浪账本_${snapshot.bill.month}月账单`;
      if (exportActionRef.current === 'share') {
        await shareImage(blob, fileName);
        finalizeSession(sessionId, 'success', t('exportShared'));
      }
      else {
        const result = await saveImageToGallery(blob, fileName);
        finalizeSession(sessionId, 'success', result === 'gallery' ? t('exportSaved') : t('exportDownloaded'));
      }
    }
    catch (error) {
      if (error instanceof ImageShareCancelledError) {
        finalizeSession(sessionId, 'cancelled');
        return;
      }
      console.error('[month-bill-export] image delivery failed', {
        action: exportActionRef.current,
        error,
        sessionId,
        stage: 'delivery',
      });
      const message = error instanceof GalleryPermissionDeniedError
        ? t('exportPermissionDenied')
        : exportActionRef.current === 'share' ? t('exportShareFailed') : t('exportSaveFailed');
      finalizeSession(sessionId, 'failure', message);
    }
  }, [avatarBarrier, finalizeSession, readyCharts.size, t]);

  useEffect(() => {
    if (!exportMounted || chartsEnabled || !snapshotRef.current || !activeSessionRef.current || !exportRef.current)
      return;
    const sessionId = activeSessionRef.current;
    const snapshot = snapshotRef.current;
    let cancelled = false;
    void (async () => {
      try {
        await Promise.all([
          waitForImageExportReady(exportRef.current!, { fontSample: getExportFontSample(snapshot) }),
          waitForStrictQr(exportRef.current!),
        ]);
        if (!cancelled && activeSessionRef.current === sessionId)
          setChartsEnabled(true);
      }
      catch {
        if (!cancelled)
          finalizeSession(sessionId, 'failure');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chartsEnabled, exportMounted, finalizeSession, qrCode]);

  useEffect(() => {
    const avatarIsReady = avatarBarrier?.state === 'image-ready' || avatarBarrier?.state === 'fallback-ready';
    if (exportMounted && chartsEnabled && readyCharts.size === EXPORT_CHART_KEYS.size && avatarIsReady)
      void captureExport();
  }, [avatarBarrier?.sessionId, avatarBarrier?.state, captureExport, chartsEnabled, exportMounted, readyCharts.size]);

  const handleExport = useCallback(async (action: ExportAction) => {
    if (!query.data || exportStatus !== 'idle' || inFlightRef.current)
      return;
    const sessionId = ++nextSessionIdRef.current;
    const displayName = userQuery.data?.name?.trim() || userQuery.data?.username?.trim() || t('exportUserFallbackName') || 'Ledger user';
    const [year, monthNumber] = query.data.month.split('-');
    const snapshot: ExportSnapshot = {
      bill: query.data,
      copy: {
        monthTitle: t('exportMonthTitle', { month: Number(monthNumber), year }),
        reviewSubtitle: t('monthlyIncomeExpenseReview'),
      },
      qrUrl: query.data.monthBillExportQrUrl,
      sessionId,
      user: {
        avatar: userQuery.data?.avatar?.trim() || undefined,
        displayName,
      },
    };
    activeSessionRef.current = sessionId;
    exportActionRef.current = action;
    inFlightRef.current = true;
    snapshotRef.current = snapshot;
    terminalSessionsRef.current.delete(sessionId);
    captureStartedRef.current = false;
    setExportStatus('preparing');
    setReadyCharts(new Set());
    setAvatarBarrier({ sessionId, state: 'loading' });
    setChartsEnabled(false);
    watchdogRef.current = window.setTimeout(finalizeSession, EXPORT_SESSION_WATCHDOG_MS, sessionId, 'timeout');
    try {
      const qrModule = await import('qrcode');
      const dataUrl = await qrModule.toDataURL(snapshot.qrUrl, { margin: 1, width: 240 });
      if (activeSessionRef.current !== sessionId)
        return;
      setQrCode(dataUrl);
      setExportMounted(true);
    }
    catch (error) {
      console.error('[month-bill-export] preparation failed', { action, error, sessionId, stage: 'preparation' });
      finalizeSession(sessionId, 'failure');
    }
  }, [exportStatus, finalizeSession, query.data, t, userQuery.data]);

  if (!isMonthValid)
    return null;

  return (
    <div className="page-new overflow-hidden">
      <PageHeader backLabel={t('common:nav.back')} onBack={() => navigate('/bill', { replace: true })} title={formatMonthTitle(month)} />
      <main className="min-h-0 flex-grow overflow-auto px-[18px] pb-28 pt-2" data-bill-detail-scroll>
        {query.isLoading && !hasData && <PageLoadingState label={t('common:nav.loading')} testId="month-bill-detail-loading" />}
        {query.isError && !hasData && (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-center">
            <div className="text-[15px] font-bold text-ww-ink">{t('detailLoadFailed')}</div>
            <button className="h-11 rounded-[16px] border border-border-primary bg-white/85 px-5 text-[13px] font-extrabold text-primary-deep shadow-ww-xs" onClick={() => void query.refetch()} type="button">{t('common:retry')}</button>
          </div>
        )}
        {query.data && query.data.summary.recordCount === 0 && <IllustratedEmptyState accentIcon={<DesignIcon name="tab-add" size={20} />} actionLabel={t('emptyAction')} className="min-h-[320px]" description={t('emptyDescription')} icon={<DesignIcon name="shortcut-bill" size={46} />} onAction={() => navigate('/bookkeeping')} title={t('emptyTitle')} />}
        {query.data && query.data.summary.recordCount > 0 && <MonthBillDetailRenderer data={query.data} mode="screen" />}
      </main>
      <div className="absolute bottom-0 left-0 right-0 z-20 flex shrink-0 gap-3 bg-gradient-to-t from-[#f4fbff] via-[#f4fbff]/95 to-transparent px-[18px] pb-[max(12px,env(safe-area-inset-bottom))] pt-5">
        <WwButton className="!h-12 !flex-1 !rounded-[16px] !border !border-primary/25 !bg-white/90 !font-bold !text-primary-deep" onClick={() => void handleExport('share')} size="full">{exportStatus === 'idle' ? t('shareImage') : t('savingImage')}</WwButton>
        <WwButton className="!h-12 !flex-1 !rounded-[16px] !bg-[linear-gradient(135deg,#6fc2dc,#4aaac4)] !font-bold !text-white !shadow-ww" onClick={() => void handleExport('save')} size="full">{exportStatus === 'idle' ? t('saveImage') : t('savingImage')}</WwButton>
      </div>
      {exportMounted && snapshotRef.current && qrCode && <div aria-hidden="true" className="pointer-events-none fixed left-[-10000px] top-0" ref={exportRef}><MonthBillDetailRenderer chartsEnabled={chartsEnabled} data={snapshotRef.current.bill} exportCopy={snapshotRef.current.copy} exportSessionId={snapshotRef.current.sessionId} exportUser={snapshotRef.current.user} mode="export" onAvatarReady={handleAvatarReady} onChartError={handleChartError} onChartReady={handleChartReady} qrCode={qrCode} /></div>}
    </div>
  );
}
