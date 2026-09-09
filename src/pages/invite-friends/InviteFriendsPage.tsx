import { Toast } from 'antd-mobile';
import copy from 'copy-to-clipboard';
import html2canvas from 'html2canvas-pro';
import { Link2, Save, Share2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetUserUserInfoQuery } from '@/entities/user';
import { APP_INFO } from '@/shared/config/app-info';
import { useTranslation } from '@/shared/i18n';
import {
  canvasToPngBlob,
  getImageExportCaptureOptions,
  saveImageToGallery,
  shareSavedImage,
  waitForImageExportReady,
} from '@/shared/lib/image-export';
import { AppButton, AppSheet, PageHeader } from '@/shared/ui';
import { InvitePoster } from './ui/InvitePoster';

interface SavedPosterPreview {
  uri: string;
  url: string;
}

function isShareCancelError(error: unknown) {
  if (typeof error !== 'object' || error === null)
    return false;
  const candidate = error as { name?: string; message?: string };
  return candidate.name === 'AbortError'
    || candidate.name === 'NotAllowedError'
    || (typeof candidate.message === 'string'
      && (candidate.message.includes('AbortError') || candidate.message.includes('cancel')));
}

function InviteFriendsPage() {
  const { t } = useTranslation('user');
  const navigate = useNavigate();
  const userQuery = useGetUserUserInfoQuery();
  const exportRef = useRef<HTMLDivElement>(null);
  const [qrCode, setQrCode] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);
  const [savedPosterPreview, setSavedPosterPreview] = useState<SavedPosterPreview>();
  const displayName = useMemo(
    () => userQuery.data?.name?.trim() || userQuery.data?.username?.trim() || t('inviteFriends.defaultName'),
    [t, userQuery.data?.name, userQuery.data?.username],
  );
  const posterDisplayName = useMemo(() => {
    const characters = Array.from(displayName);
    return characters.length > 12 ? `${characters.slice(0, 11).join('')}…` : displayName;
  }, [displayName]);
  const shareText = t('inviteFriends.shareText', { name: displayName });
  const qrGenerationErrorMessage = t('inviteFriends.saveFailed');

  useEffect(() => {
    let active = true;
    void import('qrcode')
      .then(module => module.toDataURL(APP_INFO.officialWebsiteUrl, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 240,
      }))
      .then((dataUrl) => {
        if (active)
          setQrCode(dataUrl);
      })
      .catch((error) => {
        console.error('[invite-friends] QR generation failed', { error });
        if (active)
          Toast.show({ content: qrGenerationErrorMessage, icon: 'fail' });
      });
    return () => {
      active = false;
    };
  }, [qrGenerationErrorMessage]);

  const closeSavedPosterPreview = useCallback(() => {
    setSavedPosterPreview((current) => {
      if (current)
        URL.revokeObjectURL(current.url);
      return undefined;
    });
  }, []);

  useEffect(() => () => {
    if (savedPosterPreview)
      URL.revokeObjectURL(savedPosterPreview.url);
  }, [savedPosterPreview]);

  const copyInvite = useCallback(() => {
    const content = `${shareText}\n${APP_INFO.officialWebsiteUrl}`;
    if (copy(content))
      Toast.show({ content: t('inviteFriends.linkCopied'), icon: 'success' });
    else
      Toast.show({ content: t('inviteFriends.copyFailed'), icon: 'fail' });
  }, [shareText, t]);

  const handleShareLink = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          text: shareText,
          title: t('inviteFriends.shareTitle'),
          url: APP_INFO.officialWebsiteUrl,
        });
        return;
      }
      copyInvite();
    }
    catch (error) {
      if (!isShareCancelError(error))
        copyInvite();
    }
  }, [copyInvite, shareText, t]);

  const handleSavePoster = useCallback(async () => {
    const root = exportRef.current;
    if (!root || !qrCode || isSaving)
      return;
    setIsSaving(true);
    try {
      await waitForImageExportReady(root, {
        fontSample: `${posterDisplayName}${t('inviteFriends.headline', { name: posterDisplayName })}`,
      });
      const canvas = await html2canvas(root, {
        backgroundColor: null,
        logging: false,
        useCORS: true,
        ...getImageExportCaptureOptions(root),
      });
      const blob = await canvasToPngBlob(canvas);
      const result = await saveImageToGallery(blob, `${APP_INFO.appName}-邀请好友海报`);
      if (result.destination === 'gallery') {
        setSavedPosterPreview({ uri: result.uri, url: URL.createObjectURL(blob) });
      }
      else {
        Toast.show({ content: t('inviteFriends.posterDownloaded'), icon: 'success' });
      }
    }
    catch (error) {
      console.error('[invite-friends] poster export failed', { error });
      Toast.show({ content: t('inviteFriends.saveFailed'), icon: 'fail' });
    }
    finally {
      setIsSaving(false);
    }
  }, [isSaving, posterDisplayName, qrCode, t]);

  const handleShareSavedPoster = useCallback(async () => {
    if (!savedPosterPreview)
      return;
    try {
      await shareSavedImage(savedPosterPreview.uri);
    }
    catch (error) {
      console.error('[invite-friends] poster share failed', { error });
      Toast.show({ content: t('inviteFriends.shareFailed'), icon: 'fail' });
    }
  }, [savedPosterPreview, t]);

  return (
    <div className="page-new overflow-hidden">
      <PageHeader backLabel={t('common:nav.back')} onBack={() => navigate(-1)} title={t('inviteFriends.title')} />
      <main className="min-h-0 flex-grow overflow-auto px-[18px] pb-[112px] pt-2">
        <div className="mx-auto w-full max-w-[375px]">
          {qrCode
            ? <InvitePoster displayName={posterDisplayName} mode="screen" qrCode={qrCode} />
            : <div className="min-h-[610px] animate-pulse rounded-[20px] bg-ww-surface-raised motion-reduce:animate-none" />}
          <div className="mt-3 flex items-center justify-center gap-2 text-center text-[11px] font-semibold text-ww-mid">
            <Link2 size={14} />
            <span>{APP_INFO.officialWebsiteUrl.replace('https://', '')}</span>
          </div>
        </div>
      </main>
      <div className="absolute bottom-0 left-0 right-0 z-20 flex gap-3 bg-ww-surface-raised px-[18px] pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
        <AppButton aria-label={t('inviteFriends.shareLink')} className="flex-1" onClick={() => void handleShareLink()} size="large" variant="secondary">
          <Link2 size={18} />
          {t('inviteFriends.shareLink')}
        </AppButton>
        <AppButton className="flex-1" disabled={!qrCode} loading={isSaving} loadingLabel={t('inviteFriends.savingPoster')} onClick={() => void handleSavePoster()} size="large">
          <Save size={18} />
          {t('inviteFriends.savePoster')}
        </AppButton>
      </div>
      <AppSheet destroyOnClose onClose={closeSavedPosterPreview} onMaskClick={closeSavedPosterPreview} position="bottom" showCloseButton visible={Boolean(savedPosterPreview)}>
        {savedPosterPreview && (
          <div className="px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-12">
            <h2 className="text-center text-[17px] font-black text-ww-ink">{t('inviteFriends.previewTitle')}</h2>
            <p className="mt-2 text-center text-[13px] font-semibold text-ww-mid">{t('inviteFriends.previewDescription')}</p>
            <div className="mt-4 max-h-[52dvh] overflow-hidden rounded-[18px] bg-ww-surface-tint shadow-ww-xs">
              <img alt={t('inviteFriends.previewTitle')} className="max-h-[52dvh] w-full object-contain" src={savedPosterPreview.url} />
            </div>
            <AppButton className="mt-5" fullWidth onClick={() => void handleShareSavedPoster()} size="large">
              <Share2 size={18} />
              {t('inviteFriends.sharePoster')}
            </AppButton>
          </div>
        )}
      </AppSheet>
      {qrCode && (
        <div aria-hidden="true" className="pointer-events-none fixed left-[-10000px] top-0" ref={exportRef}>
          <InvitePoster displayName={posterDisplayName} mode="export" qrCode={qrCode} />
        </div>
      )}
    </div>
  );
}

export default InviteFriendsPage;
