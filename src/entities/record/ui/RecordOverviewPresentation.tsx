import type { FC, ReactNode } from 'react';
import type { RecordOverviewHeaderProps } from './RecordOverviewHeader';
import type { RecordOverviewListGroup } from './RecordOverviewList';
import { CircleAlert, Plus, RefreshCw } from 'lucide-react';
import { useTranslation } from '@/shared/i18n';
import { AppButton, DesignIcon, IllustratedEmptyState, PageLoadingState } from '@/shared/ui';
import { RecordOverviewHeader } from './RecordOverviewHeader';
import { RecordOverviewList } from './RecordOverviewList';

export type RecordOverviewState = 'error' | 'loading' | 'ready';

export interface RecordOverviewPresentationProps {
  emptyActionLabel?: ReactNode;
  emptyDescription?: ReactNode;
  emptyTitle?: ReactNode;
  errorDescription?: ReactNode;
  errorTitle?: ReactNode;
  groups: RecordOverviewListGroup[];
  hasMore?: boolean;
  header: RecordOverviewHeaderProps;
  isLoadingMore?: boolean;
  loadMoreLabel?: ReactNode;
  loadMoreTestId?: string;
  onLoadMore?: () => void;
  onEmptyAction?: () => void;
  onRetry?: () => void;
  retryLabel?: ReactNode;
  renderCategoryIcon?: (item: { categoryName?: string; iconName: string }) => ReactNode;
  state: RecordOverviewState;
}

export const RecordOverviewPresentation: FC<RecordOverviewPresentationProps> = ({
  emptyActionLabel,
  emptyDescription,
  emptyTitle,
  errorDescription,
  errorTitle,
  groups,
  hasMore,
  header,
  isLoadingMore = false,
  loadMoreLabel,
  loadMoreTestId,
  onLoadMore,
  onEmptyAction,
  onRetry,
  retryLabel,
  renderCategoryIcon,
  state,
}) => {
  const { t } = useTranslation('common');
  const canLoadMore = hasMore ?? onLoadMore !== undefined;
  const shouldShowLoadMore = loadMoreLabel !== undefined
    && (hasMore !== undefined || onLoadMore !== undefined);
  return (
    <>
      <RecordOverviewHeader {...header} />
      <main
        className="flex min-h-0 flex-grow flex-col overflow-auto px-[18px]"
        data-record-overview-content
      >
        {state === 'loading' && (
          <PageLoadingState compact label={t('nav.loading')} testId="record-overview-loading" />
        )}
        {state === 'error' && (
          <div
            className="flex min-h-[320px] flex-grow items-center justify-center py-3"
            data-record-overview-state="error"
          >
            <div className="w-full rounded-[24px] border border-solid border-border-primary bg-white/65 shadow-ww-xs backdrop-blur-xl">
              <IllustratedEmptyState
                accentIcon={<RefreshCw size={18} strokeWidth={2.2} />}
                actionLabel={retryLabel ?? t('error.loadFail')}
                className="min-h-[320px]"
                description={errorDescription ?? t('error.networkError')}
                icon={<CircleAlert className="text-ww-pink" size={46} strokeWidth={1.8} />}
                onAction={onRetry}
                testId="record-overview-error-state"
                title={errorTitle ?? t('error.loadFail')}
              />
            </div>
          </div>
        )}
        {state === 'ready' && groups.length === 0 && (
          <div
            className="flex min-h-[320px] flex-grow items-center justify-center py-3"
            data-record-overview-state="empty"
          >
            <div className="w-full rounded-[24px] border border-solid border-border-primary bg-white/65 shadow-ww-xs backdrop-blur-xl">
              <IllustratedEmptyState
                accentIcon={onEmptyAction ? <Plus size={19} strokeWidth={2.2} /> : undefined}
                actionLabel={emptyActionLabel}
                className="min-h-[330px]"
                description={emptyDescription}
                icon={<DesignIcon name="tab-detail-active" size={46} />}
                onAction={onEmptyAction}
                testId="record-overview-empty-state"
                title={emptyTitle ?? emptyDescription}
              />
            </div>
          </div>
        )}
        {state === 'ready' && groups.length > 0 && (
          <>
            <RecordOverviewList groups={groups} renderCategoryIcon={renderCategoryIcon} variant="overview" />
            {shouldShowLoadMore && (
              <div className="py-3" data-record-overview-load-more>
                <AppButton
                  className="h-12 rounded-[16px] py-0 text-[13px] leading-5 shadow-ww-xs"
                  data-testid={loadMoreTestId}
                  disabled={isLoadingMore || !canLoadMore}
                  fullWidth
                  loading={isLoadingMore}
                  loadingLabel={t('nav.loading')}
                  onClick={onLoadMore}
                  variant="secondary"
                >
                  {loadMoreLabel}
                </AppButton>
              </div>
            )}
            <div
              aria-hidden="true"
              className="h-[calc(126px+env(safe-area-inset-bottom))] shrink-0"
              data-record-overview-tab-bar-spacer
            />
          </>
        )}
      </main>
    </>
  );
};
