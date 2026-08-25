import { Toast } from 'antd-mobile';
import copy from 'copy-to-clipboard';
import html2canvas from 'html2canvas-pro';
import { ChevronLeft, ReceiptText } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import config from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { canvasToPngBlob, saveImageToGallery } from '@/shared/lib';
import { GradientPanel, IllustratedEmptyState } from '@/shared/ui';
import {
  buildShareUrl,
  getSourceFromSearchParams,
  isShareCancelError,
  normalizeShareData,
} from './model/shareUtils';
import ShareBtn from './ShareBtn';
import ShareCanvas from './ShareCanvas';

function getSourceFromState(state: unknown): Record<string, unknown> | undefined {
  if (typeof state !== 'object' || !state)
    return undefined;
  const s = state as Record<string, unknown>;
  if (typeof s.record === 'object' && s.record)
    return s.record as Record<string, unknown>;
  if (typeof s.shareData === 'object' && s.shareData)
    return s.shareData as Record<string, unknown>;
  return s;
}

async function waitForPosterImages(element: HTMLElement) {
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(images.map(image => image.complete
    ? Promise.resolve()
    : new Promise<void>((resolve) => {
        image.addEventListener('load', () => resolve(), { once: true });
        image.addEventListener('error', () => resolve(), { once: true });
      })));
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
}

function Share() {
  const { t } = useTranslation('community');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const canvasRef = useRef<HTMLDivElement>(null);

  const shareData = useMemo(() => {
    return normalizeShareData(getSourceFromState(location.state))
      || normalizeShareData(getSourceFromSearchParams(searchParams));
  }, [location.state, searchParams]);

  const saveCanvas = async () => {
    if (!canvasRef.current) {
      Toast.show({ content: t('share.noData'), icon: 'fail' });
      return;
    }
    try {
      await waitForPosterImages(canvasRef.current);
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: null,
        scale: Math.max(2, window.devicePixelRatio || 1),
        useCORS: true,
      });
      const blob = await canvasToPngBlob(canvas);
      await saveImageToGallery(blob, config.appName);
      Toast.show({ content: t('share.saved'), icon: 'success' });
    }
    catch {
      Toast.show({ content: t('share.saveFail'), icon: 'fail' });
    }
  };

  const handleShare = async () => {
    const title = `${config.appName}${t('share.billShare')}`;
    const text = shareData
      ? `${shareData.dateText} ${shareData.categoryName} ${shareData.type === 'add' ? t('common:amount.income') : t('common:amount.expend')} ${shareData.amount}`
      : title;
    const url = shareData ? buildShareUrl(shareData) : window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        Toast.show({ content: t('share.success'), icon: 'success' });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        Toast.show({ icon: 'success', content: t('share.copied') });
        return;
      }
      if (copy(url)) {
        Toast.show({ icon: 'success', content: t('share.copied') });
        return;
      }
      Toast.show({ icon: 'fail', content: t('share.unsupported') });
    }
    catch (error) {
      if (isShareCancelError(error)) {
        Toast.show({ content: t('share.cancelled') });
        return;
      }
      Toast.show({ icon: 'fail', content: t('share.fail') });
    }
  };

  if (!shareData) {
    return (
      <div className="page-new relative overflow-hidden">
        <header className="relative z-10 flex h-[60px] shrink-0 items-center justify-center px-[18px] pt-[max(8px,env(safe-area-inset-top))]">
          <button aria-label={t('common:nav.back')} className="absolute left-[18px] flex h-9 w-9 items-center justify-center rounded-full border border-solid border-border-primary bg-white/80 text-primary-deep shadow-ww-xs" onClick={() => navigate(-1)} type="button">
            <ChevronLeft size={19} />
          </button>
          <h1 className="text-[17px] font-extrabold text-ww-ink">{t('share.title')}</h1>
        </header>
        <main className="flex min-h-0 flex-grow items-center px-[18px] pb-10">
          <GradientPanel className="w-full" elevation="low" surface="glass">
            <IllustratedEmptyState description={t('share.emptyHint')} icon={<ReceiptText className="text-primary-deep" size={38} />} title={t('share.empty')} />
          </GradientPanel>
        </main>
      </div>
    );
  }

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-20 h-52 w-52 rounded-full bg-primary-light/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-20 bottom-24 h-52 w-52 rounded-full bg-ww-pink-light/30 blur-3xl" />
      <header className="relative z-10 flex h-[60px] shrink-0 items-center justify-center px-[18px] pt-[max(8px,env(safe-area-inset-top))]">
        <button aria-label={t('common:nav.back')} className="absolute left-[18px] flex h-9 w-9 items-center justify-center rounded-full border border-solid border-border-primary bg-white/80 text-primary-deep shadow-ww-xs" onClick={() => navigate(-1)} type="button">
          <ChevronLeft size={19} />
        </button>
        <h1 className="text-[17px] font-extrabold text-ww-ink">{t('share.title')}</h1>
      </header>
      <main className="relative z-[1] min-h-0 flex-grow overflow-y-auto px-[18px]">
        <ShareCanvas canvasRef={canvasRef} data={shareData} />
      </main>
      <div className="relative z-10 shrink-0">
        <ShareBtn onSave={saveCanvas} onShare={handleShare} />
      </div>
    </div>
  );
}

export default Share;
