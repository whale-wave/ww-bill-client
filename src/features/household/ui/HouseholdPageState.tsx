import type { FC, ReactNode } from 'react';
import { Button, ErrorBlock, SpinLoading } from 'antd-mobile';

interface HouseholdPageStateProps {
  children: ReactNode;
  errorDescription: string;
  errorTitle: string;
  isError: boolean;
  isLoading: boolean;
  loadingLabel: string;
  onRetry?: () => void;
  retryLabel: string;
}

export const HouseholdPageState: FC<HouseholdPageStateProps> = ({
  children,
  errorDescription,
  errorTitle,
  isError,
  isLoading,
  loadingLabel,
  onRetry,
  retryLabel,
}) => {
  if (isLoading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-sm text-font-gray" data-testid="household-loading">
        <SpinLoading />
        <span>{loadingLabel}</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 px-4" data-testid="household-error">
        <ErrorBlock description={errorDescription} status="default" title={errorTitle} />
        {onRetry && (
          <Button color="primary" onClick={onRetry}>{retryLabel}</Button>
        )}
      </div>
    );
  }

  return children;
};
