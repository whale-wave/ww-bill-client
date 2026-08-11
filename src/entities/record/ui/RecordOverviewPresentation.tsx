import type { FC, ReactNode } from 'react';
import type { RecordOverviewHeaderProps } from './RecordOverviewHeader';
import type { RecordOverviewListGroup } from './RecordOverviewList';
import { Button, ErrorBlock, SpinLoading } from 'antd-mobile';
import { PackageOpen } from 'lucide-react';
import { RecordOverviewHeader } from './RecordOverviewHeader';
import { RecordOverviewList } from './RecordOverviewList';

export type RecordOverviewState = 'error' | 'loading' | 'ready';

export interface RecordOverviewPresentationProps {
  emptyDescription?: ReactNode;
  errorDescription?: ReactNode;
  errorTitle?: ReactNode;
  groups: RecordOverviewListGroup[];
  header: RecordOverviewHeaderProps;
  isLoadingMore?: boolean;
  loadMoreLabel?: ReactNode;
  loadMoreTestId?: string;
  onLoadMore?: () => void;
  onRetry?: () => void;
  retryLabel?: ReactNode;
  renderCategoryIcon?: (item: { categoryName?: string; iconName: string }) => ReactNode;
  state: RecordOverviewState;
}

export const RecordOverviewPresentation: FC<RecordOverviewPresentationProps> = ({
  emptyDescription,
  errorDescription,
  errorTitle,
  groups,
  header,
  isLoadingMore = false,
  loadMoreLabel,
  loadMoreTestId,
  onLoadMore,
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
          className="flex min-h-[240px] flex-grow flex-col items-center justify-center text-base text-[#e0e0e0]"
          data-record-overview-state="empty"
        >
          <PackageOpen className="text-[#e0e0e0]" size={100} strokeWidth={1.5} />
          <span>{emptyDescription}</span>
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
