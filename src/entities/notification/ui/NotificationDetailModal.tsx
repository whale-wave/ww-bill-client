import type { UserNotification } from '../types';
import { Info, X } from 'lucide-react';
import { useTranslation } from '@/shared/i18n';
import { AppButton, AppModal } from '@/shared/ui';
import { NotificationDetailContent } from './NotificationDetailContent';

export interface NotificationDetailModalProps {
  confirmText?: string;
  notification: UserNotification | null;
  typeLabel: string;
  timeLabel: string;
  onClose: () => void;
  onConfirm?: () => void;
}

export function NotificationDetailModal({ confirmText, notification, onClose, onConfirm, timeLabel, typeLabel }: NotificationDetailModalProps) {
  const { t } = useTranslation('common');

  return (
    <AppModal
      actions={[]}
      bodyClassName="!box-border !max-h-[calc(100dvh-32px)] !max-w-full !border-[var(--ww-border-color)] !bg-white !p-0 !shadow-[0_18px_44px_rgb(15_23_42/0.18)] !backdrop-blur-none [&_.adm-modal-content]:!p-0 [&_.adm-modal-footer]:!hidden"
      closeOnMaskClick
      content={notification
        ? (
            <article
              aria-labelledby="notification-detail-title"
              className="flex max-h-[min(86dvh,680px)] flex-col overflow-hidden bg-white"
              data-testid="notification-detail-modal"
            >
              <header className="shrink-0 bg-white px-5 pb-4 pt-5">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-solid border-[color-mix(in_srgb,var(--ww-theme-color)_28%,transparent)] bg-[color-mix(in_srgb,var(--ww-theme-color-light)_52%,white)] text-primary">
                    <Info aria-hidden size={22} strokeWidth={1.8} />
                  </span>
                  <h2 className="min-w-0 flex-1 text-[18px] font-extrabold leading-[26px] text-ww-ink" id="notification-detail-title">
                    {notification.title}
                  </h2>
                  <button
                    aria-label={t('message.notificationCenter.closeDetail')}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-0 bg-[#f3f4f6] p-0 text-ww-mid transition-transform active:scale-95"
                    onClick={onClose}
                    type="button"
                  >
                    <X aria-hidden size={21} strokeWidth={2.2} />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="max-w-[70%] truncate rounded-full bg-[#f2f3f5] px-3 py-1 text-[12px] font-bold leading-4 text-ww-mid">
                    {typeLabel}
                  </span>
                  <time className="shrink-0 text-[12px] leading-5 text-ww-soft" dateTime={notification.createdAt}>{timeLabel}</time>
                </div>
              </header>

              <section className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white px-5 py-[18px]">
                <NotificationDetailContent content={notification.content} payload={notification.payload} />
              </section>

              <footer className="shrink-0 bg-white px-5 py-4">
                <AppButton className="!shadow-none" data-testid="notification-detail-confirm" fullWidth onClick={onConfirm ?? onClose} size="large">
                  {confirmText ?? t('nav.confirm')}
                </AppButton>
              </footer>
            </article>
          )
        : null}
      onClose={onClose}
      visible={Boolean(notification)}
    />
  );
}
