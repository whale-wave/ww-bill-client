import type { UserNotification } from '../types';
import { Info, X } from 'lucide-react';
import { useTranslation } from '@/shared/i18n';
import { AppButton, AppModal } from '@/shared/ui';
import { NotificationDetailContent } from './NotificationDetailContent';

export interface NotificationDetailModalProps {
  notification: UserNotification | null;
  typeLabel: string;
  timeLabel: string;
  onClose: () => void;
}

export function NotificationDetailModal({ notification, onClose, timeLabel, typeLabel }: NotificationDetailModalProps) {
  const { t } = useTranslation('common');

  return (
    <AppModal
      actions={[]}
      bodyClassName="!box-border !max-h-[calc(100dvh-32px)] !max-w-full !p-0 [&_.adm-modal-content]:!p-0 [&_.adm-modal-footer]:!hidden"
      closeOnMaskClick
      content={notification
        ? (
            <article
              aria-labelledby="notification-detail-title"
              className="flex max-h-[min(86dvh,680px)] flex-col overflow-hidden"
              data-testid="notification-detail-modal"
            >
              <header className="shrink-0 px-[var(--ww-space-lg)] pb-[var(--ww-space-md)] pt-[var(--ww-space-lg)]">
                <div className="flex items-center gap-[var(--ww-space-md)]">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-solid border-border-primary bg-[var(--ww-component-sheet-subtle-background)] text-primary-deep">
                    <Info aria-hidden size={23} strokeWidth={1.8} />
                  </span>
                  <h2 className="min-w-0 flex-1 text-[18px] font-extrabold leading-[26px] text-ww-ink" id="notification-detail-title">
                    {notification.title}
                  </h2>
                  <button
                    aria-label={t('message.notificationCenter.closeDetail')}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-0 bg-[var(--ww-component-sheet-subtle-background)] p-0 text-ww-mid transition-transform active:scale-95"
                    onClick={onClose}
                    type="button"
                  >
                    <X aria-hidden size={21} strokeWidth={2.2} />
                  </button>
                </div>
                <div className="mt-[var(--ww-space-md)] flex items-center justify-between gap-[var(--ww-space-md)]">
                  <span className="max-w-[70%] truncate rounded-full bg-[var(--ww-component-sheet-subtle-background)] px-3 py-1 text-[12px] font-bold leading-4 text-ww-mid">
                    {typeLabel}
                  </span>
                  <time className="shrink-0 text-[12px] leading-5 text-ww-soft" dateTime={notification.createdAt}>{timeLabel}</time>
                </div>
              </header>

              <section className="min-h-0 flex-1 overflow-y-auto overscroll-contain border-y border-solid border-border-primary bg-[color-mix(in_srgb,var(--ww-surface-tint-color)_34%,var(--ww-material-overlay-background))] px-[var(--ww-space-lg)] py-[var(--ww-space-lg)]">
                <NotificationDetailContent content={notification.content} payload={notification.payload} />
              </section>

              <footer className="shrink-0 px-[var(--ww-space-lg)] pb-[max(var(--ww-space-lg),env(safe-area-inset-bottom))] pt-[var(--ww-space-md)]">
                <AppButton data-testid="notification-detail-confirm" fullWidth onClick={onClose} size="large">
                  {t('nav.confirm')}
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
