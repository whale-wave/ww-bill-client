import type { FC } from 'react';
import { MonitorDown, X } from 'lucide-react';

import { useState } from 'react';
import { useTranslation } from '@/shared/i18n';
import { AppModal, ImagePreview } from '@/shared/ui';

const guideImages = [
  '/ios-install-guide/step-1-browser.jpg',
  '/ios-install-guide/step-2-url.jpg',
  '/ios-install-guide/step-3-more.jpg',
  '/ios-install-guide/step-4-share.jpg',
  '/ios-install-guide/step-5-more.jpg',
  '/ios-install-guide/step-6-add.jpg',
  '/ios-install-guide/step-7-done.jpg',
] as const;

interface IosHomeScreenGuideModalProps {
  onClose: () => void;
  visible: boolean;
}

export const IosHomeScreenGuideModal: FC<IosHomeScreenGuideModalProps> = ({ onClose, visible }) => {
  const { t } = useTranslation('settings');
  const [previewImage, setPreviewImage] = useState<string>();

  const close = () => {
    setPreviewImage(undefined);
    onClose();
  };

  return (
    <>
      <AppModal
        actions={[]}
        bodyClassName="!box-border !max-h-[calc(100dvh-24px)] !max-w-[min(100vw-24px,480px)] !p-0 [&_.adm-modal-content]:!p-0 [&_.adm-modal-footer]:!hidden"
        content={(
          <div aria-labelledby="ios-home-screen-guide-title" className="max-h-[calc(100dvh-24px)] overflow-y-auto px-5 pb-5 pt-4">
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--ww-component-overlay-icon-radius)] bg-[var(--ww-component-sheet-icon-background)] text-primary-deep">
                <MonitorDown size={20} strokeWidth={1.8} />
              </span>
              <button
                aria-label={t('iosHomeScreenGuide.close')}
                className="flex h-11 w-11 items-center justify-center rounded-[var(--ww-component-sheet-close-radius)] border-0 bg-[var(--ww-component-sheet-icon-background)] text-ww-mid active:scale-95"
                onClick={close}
                type="button"
              >
                <X size={19} strokeWidth={1.8} />
              </button>
            </div>
            <p className="mt-3 text-[11px] font-extrabold text-primary-deep">{t('iosHomeScreenGuide.kicker')}</p>
            <h2 className="mt-1 text-[18px] font-extrabold leading-7 text-ww-ink" id="ios-home-screen-guide-title">
              {t('iosHomeScreenGuide.title')}
            </h2>
            <p className="mt-1 text-[12px] leading-5 text-ww-mid">{t('iosHomeScreenGuide.description')}</p>
            <p className="mt-3 rounded-xl bg-primary-light/40 px-3 py-2 text-[11px] leading-4 text-primary-deep">
              {t('iosHomeScreenGuide.previewHint')}
            </p>
            <ol className="mt-4 space-y-3">
              {guideImages.map((image, index) => {
                const step = index + 1;
                return (
                  <li className="overflow-hidden rounded-[16px] border border-border-primary bg-ww-surface-raised" key={image}>
                    <div className="px-3 pb-2 pt-3">
                      <div className="flex items-start gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-extrabold text-white">
                          {String(step).padStart(2, '0')}
                        </span>
                        <div>
                          <h3 className="text-[13px] font-extrabold leading-5 text-ww-ink">
                            {t(`iosHomeScreenGuide.steps.${step}.title`)}
                          </h3>
                          <p className="mt-0.5 text-[11px] leading-4 text-ww-mid">
                            {t(`iosHomeScreenGuide.steps.${step}.description`)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      aria-label={t('iosHomeScreenGuide.previewImage', { step })}
                      className="block w-full border-0 border-t border-solid border-border-primary bg-ww-surface-tint/30 p-2"
                      onClick={() => setPreviewImage(image)}
                      type="button"
                    >
                      <img
                        alt={t(`iosHomeScreenGuide.steps.${step}.imageAlt`)}
                        className="h-[164px] w-full rounded-[10px] object-contain"
                        src={image}
                      />
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
        onClose={close}
        visible={visible}
      />
      <ImagePreview image={previewImage} onClose={() => setPreviewImage(undefined)} visible={Boolean(previewImage)} />
    </>
  );
};
