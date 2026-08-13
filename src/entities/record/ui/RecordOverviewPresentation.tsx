import type { FC, ReactNode } from 'react';
import type { RecordOverviewHeaderProps } from './RecordOverviewHeader';
import type { RecordOverviewListGroup } from './RecordOverviewList';
import { Button, ErrorBlock, SpinLoading } from 'antd-mobile';
import { Plus } from 'lucide-react';
import { DesignIcon, IllustratedEmptyState } from '@/shared/ui';
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
}) => (
  <>
    <RecordOverviewHeader {...header} />
    <main
      className="ww-tab-bar-scroll-padding flex min-h-0 flex-grow flex-col overflow-auto px-[18px]"
      data-record-overview-content
    >
      {state === 'loading' && (
        <div
          className="flex min-h-[240px] flex-grow items-center justify-center"
          data-record-overview-state="loading"
        >
          <SpinLoading />
        </div>
      )}
      {state === 'error' && (
        <div
          className="flex min-h-[240px] flex-grow flex-col items-center justify-center"
          data-record-overview-state="error"
        >
          <ErrorBlock description={errorDescription} title={errorTitle} />
          {onRetry && (
            <Button className="mt-3" onClick={onRetry} size="small">
              {retryLabel}
            </Button>
          )}
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
          {onLoadMore && (
            <Button
              className="mx-3 mt-3"
              data-testid={loadMoreTestId}
              loading={isLoadingMore}
              onClick={onLoadMore}
            >
              {loadMoreLabel}
            </Button>
          )}
        </>
      )}
    </main>
  </>
);
