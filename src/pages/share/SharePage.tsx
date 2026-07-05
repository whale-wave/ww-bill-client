import { ErrorBlock, Toast } from 'antd-mobile';
import copy from 'copy-to-clipboard';
import html2canvas from 'html2canvas';
import { useMemo, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import config from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { downloadCanvas } from '@/shared/lib';
import { NavBar } from '@/shared/ui';
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
      const canvas = await html2canvas(canvasRef.current);
      downloadCanvas(canvas);
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
      <div className="page">
        <NavBar back={t('common:nav.back')} backArrow={false} onBack={() => navigate(-1)}>
          {t('share.title')}
        </NavBar>
        <div className="flex-grow flex justify-center items-center px-[24px]">
          <ErrorBlock status="empty" title={t('share.empty')} description={t('share.emptyHint')} />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <NavBar back={t('common:nav.back')} backArrow={false} onBack={() => navigate(-1)}>
        {t('share.title')}
      </NavBar>
      <ShareCanvas canvasRef={canvasRef} data={shareData} />
      <ShareBtn onSave={saveCanvas} onShare={handleShare} />
    </div>
  );
}

export default Share;
