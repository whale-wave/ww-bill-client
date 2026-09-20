import type { VersionUpdate } from '../model/release-prompt';
import { ChevronDown } from 'lucide-react';
import { NotificationDetailContent } from '@/entities/notification';
import { useTranslation } from '@/shared/i18n';
import { AppButton, AppModal } from '@/shared/ui';

export function VersionUpdateModal({ update, onClose, onConfirm }: {
  update: VersionUpdate | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation('settings');
  const hasDetails = Boolean(update?.title.trim() || update?.content.trim() || update?.images.length);

  return (
    <AppModal
      actions={[]}
      bodyClassName="!box-border !max-h-[calc(100dvh-32px)] !max-w-full !bg-white !p-0"
      content={update
        ? (
            <article className="flex max-h-[min(86dvh,680px)] flex-col overflow-hidden bg-white" data-testid="version-update-modal">
              <header className="shrink-0 px-5 pb-3 pt-6 text-left">
                <p className="text-xs font-bold text-primary">{t('aboutSupport.versionUpdate')}</p>
                <h2 className="mt-2 text-xl font-extrabold text-ww-ink">
                  v
                  {update.versionName}
                </h2>
              </header>
              {hasDetails && (
                <details className="min-h-0 overflow-auto border-t border-border-primary px-5 py-4" key={`${update.platform}:${update.buildId ?? update.versionName}`}>
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-ww-ink">
                    {t('aboutSupport.updateDetails')}
                    <ChevronDown aria-hidden size={16} />
                  </summary>
                  <div className="pt-4">
                    {update.title.trim() && <p className="mb-3 text-sm font-bold text-ww-ink">{update.title}</p>}
                    <NotificationDetailContent content={update.content} images={update.images} />
                  </div>
                </details>
              )}
              <footer className="flex shrink-0 gap-3 border-t border-border-primary px-5 py-4">
                <AppButton className="flex-1" onClick={onClose} variant="secondary">{t('aboutSupport.later')}</AppButton>
                <AppButton className="flex-1" data-testid="version-update-confirm" onClick={onConfirm}>{t('aboutSupport.updateNow')}</AppButton>
              </footer>
            </article>
          )
        : null}
      onClose={onClose}
      visible={Boolean(update)}
    />
  );
}
