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
      bodyClassName="!box-border !max-h-[min(86dvh,720px)] !max-w-full !p-0 [&_.adm-modal-content]:!max-h-none [&_.adm-modal-content]:!overflow-hidden [&_.adm-modal-content]:!p-0 [&_.adm-modal-footer]:!hidden"
      closeOnMaskClick
      content={notification
        ? (
            <article
              aria-labelledby="notification-detail-title"
              className="flex max-h-[min(82dvh,680px)] flex-col overflow-hidden bg-white"
              data-testid="notification-detail-modal"
            >
              <header
                className="shrink-0 border-b border-solid border-border-primary bg-[color-mix(in_srgb,var(--ww-theme-color-light)_22%,white)] px-[var(--ww-space-xl)] pb-[var(--ww-space-xl)] pt-[var(--ww-space-lg)]"
                data-notification-detail-header
              >
                <div className="flex items-center justify-between gap-[var(--ww-space-lg)]">
                  <div className="flex min-w-0 items-center gap-[var(--ww-space-md)]">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[color-mix(in_srgb,var(--ww-theme-color-light)_68%,white)] text-primary-deep">
                      <Info aria-hidden size={18} strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-bold leading-5 text-primary-deep">{typeLabel}</p>
                      <time className="block text-[11px] leading-4 text-ww-soft" dateTime={notification.createdAt}>{timeLabel}</time>
                    </div>
                  </div>
                  <button
                    aria-label={t('message.notificationCenter.closeDetail')}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border-0 bg-white/70 p-0 text-ww-mid shadow-ww-xs transition-[color,background-color,transform] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-95 active:bg-white"
                    onClick={onClose}
                    type="button"
                  >
                    <X aria-hidden size={20} strokeWidth={2} />
                  </button>
                </div>
                <h2 className="mt-[var(--ww-space-lg)] text-pretty text-[21px] font-extrabold leading-[30px] text-ww-ink" id="notification-detail-title">
                  {notification.title}
                </h2>
              </header>

              <section
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white px-[var(--ww-space-xl)] pb-[var(--ww-space-2xl)] pt-[var(--ww-space-xl)] [-webkit-overflow-scrolling:touch]"
                data-notification-detail-scroll
              >
                <NotificationDetailContent content={notification.content} payload={notification.payload} />
              </section>

              <footer
                className="shrink-0 border-t border-solid border-border-primary bg-white/95 px-[var(--ww-space-xl)] pb-[var(--ww-space-xl)] pt-[var(--ww-space-lg)] backdrop-blur-xl"
                data-notification-detail-footer
              >
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
