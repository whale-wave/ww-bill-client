import type { FC, ReactNode } from 'react';
import type { RecordOverviewListGroup } from './RecordOverviewList';
import type { RecordSearchHeaderProps } from '@/shared/ui';
import { Button, ErrorBlock, SpinLoading } from 'antd-mobile';
import { RecordSearchHeader } from '@/shared/ui';
import { RecordOverviewList } from './RecordOverviewList';

export type RecordSearchState = 'error' | 'idle' | 'loading' | 'ready';

interface RecordSearchPresentationProps {
  action?: RecordSearchHeaderProps['action'];
  autoFocus?: boolean;
  errorDescription?: ReactNode;
  groups: RecordOverviewListGroup[];
  onBack: () => void;
  onKeywordChange: (value: string) => void;
  onRetry?: () => void;
  placeholder: string;
  retryLabel?: ReactNode;
  state: RecordSearchState;
  value: string;
}

export const RecordSearchPresentation: FC<RecordSearchPresentationProps> = ({
  action,
  autoFocus,
  errorDescription,
  groups,
  onBack,
  onKeywordChange,
  onRetry,
  placeholder,
  retryLabel,
  state,
  value,
}) => (
  <div className="page-new overflow-hidden" data-record-search-page-shell>
    <RecordSearchHeader
      action={action}
      autoFocus={autoFocus}
      onBack={onBack}
      onChange={onKeywordChange}
      placeholder={placeholder}
      value={value}
    />
    <main className="flex min-h-0 flex-grow flex-col overflow-auto pb-4 pt-[48px]">
      {state === 'loading' && (
        <div
          className="flex flex-grow items-center justify-center"
          data-record-search-state="loading"
        >
          <SpinLoading />
        </div>
      )}
      {(state === 'idle' || (state === 'ready' && groups.length === 0)) && (
        <div
          className="flex flex-grow items-center justify-center"
          data-record-search-state="idle"
        >
          <ErrorBlock status="empty" />
        </div>
      )}
      {state === 'error' && (
        <div
          className="flex flex-grow flex-col items-center justify-center"
          data-record-search-state="error"
        >
          <ErrorBlock description={errorDescription} />
          {onRetry && (
            <Button className="mt-3" onClick={onRetry} size="small">
              {retryLabel}
            </Button>
          )}
        </div>
      )}
      {state === 'ready' && groups.length > 0 && (
        <RecordOverviewList groups={groups} variant="search" />
      )}
    </main>
  </div>
);
