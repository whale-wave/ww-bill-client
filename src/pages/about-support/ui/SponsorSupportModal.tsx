import type { FC, KeyboardEvent, RefObject } from 'react';
import { Toast } from 'antd-mobile';
import { Download, Heart, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import sponsorQr from '@/assets/support/sponsor-alipay.png';
import { useTranslation } from '@/shared/i18n';
import { saveImageToGallery } from '@/shared/lib';
import { AppButton, AppModal, Surface } from '@/shared/ui';

interface SponsorSupportModalProps {
  onClose: () => void;
  returnFocusRef: RefObject<HTMLButtonElement>;
  visible: boolean;
}

export const SponsorSupportModal: FC<SponsorSupportModalProps> = ({
  onClose,
  returnFocusRef,
  visible,
}) => {
  const { t } = useTranslation('settings');
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!visible)
      return;
    const returnFocusElement = returnFocusRef.current;
    dialogRef.current?.focus();
    return () => returnFocusElement?.focus();
  }, [returnFocusRef, visible]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(sponsorQr);
      if (!response.ok)
        throw new Error('Sponsor QR code could not be loaded');
      await saveImageToGallery(await response.blob(), '鲸浪记账-支付宝赞助二维码.png');
      Toast.show({ content: t('aboutSupport.sponsorQrSaved'), icon: 'success' });
    }
    catch {
      Toast.show({ content: t('aboutSupport.sponsorQrSaveFailed'), icon: 'fail' });
    }
    finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && !isSaving) {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== 'Tab')
      return;

    const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusableElements?.length) {
      event.preventDefault();
      dialogRef.current?.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    if (event.shiftKey && (document.activeElement === firstElement || document.activeElement === dialogRef.current)) {
      event.preventDefault();
      lastElement.focus();
    }
    else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  return (
    <AppModal
      actions={[]}
      bodyClassName="!box-border !max-h-[calc(100dvh-32px)] !max-w-full !p-0 [&_.adm-modal-content]:!p-0 [&_.adm-modal-footer]:!hidden"
      closeOnMaskClick={!isSaving}
      content={(
        <div
          aria-labelledby="sponsor-modal-title"
          aria-modal="true"
          className="px-5 pb-5 pt-4"
          onKeyDown={handleKeyDown}
          ref={dialogRef}
          role="dialog"
          tabIndex={-1}
        >
          <div className="flex items-start justify-between gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--ww-component-overlay-icon-radius)] bg-[var(--ww-component-sheet-icon-background)] text-primary-deep">
              <Heart size={20} strokeWidth={1.8} />
            </span>
            <button
              aria-label={t('aboutSupport.closeSponsor')}
              className="flex h-11 w-11 items-center justify-center rounded-[var(--ww-component-sheet-close-radius)] border-0 bg-[var(--ww-component-sheet-icon-background)] text-ww-mid active:scale-95"
              disabled={isSaving}
              onClick={onClose}
              type="button"
            >
              <X size={19} strokeWidth={1.8} />
            </button>
          </div>
          <p className="mt-3 text-[11px] font-extrabold text-primary-deep">{t('aboutSupport.sponsorKicker')}</p>
          <h2 className="mt-1 text-[18px] font-extrabold leading-7 text-ww-ink" id="sponsor-modal-title">{t('aboutSupport.sponsorTitle')}</h2>
          <p className="mt-1 text-[12px] leading-5 text-ww-mid">{t('aboutSupport.sponsorModalDesc')}</p>
          <Surface className="mt-4 flex justify-center overflow-hidden p-2" material="raised">
            <img
              alt={t('aboutSupport.sponsorQrAlt')}
              className="max-h-[48dvh] w-auto max-w-full object-contain"
              src={sponsorQr}
            />
          </Surface>
          <AppButton
            className="mt-4"
            fullWidth
            loading={isSaving}
            loadingLabel={t('aboutSupport.savingSponsorQr')}
            onClick={() => void handleSave()}
          >
            <Download size={17} strokeWidth={1.8} />
            {t('aboutSupport.saveSponsorQr')}
          </AppButton>
        </div>
      )}
      onClose={onClose}
      visible={visible}
    />
  );
};
