import type { FC, ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import { GradientPanel, IllustratedEmptyState, PageLoadingState } from '@/shared/ui';

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
    return <PageLoadingState className="min-h-[320px]" label={loadingLabel} testId="household-loading" />;
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-[520px] px-[18px] py-6" data-testid="household-error">
        <GradientPanel className="overflow-hidden" elevation="low" surface="glass">
          <IllustratedEmptyState
            actionLabel={onRetry ? retryLabel : undefined}
            description={errorDescription}
            icon={<CircleAlert className="text-primary-deep" size={38} strokeWidth={1.8} />}
            onAction={onRetry}
            title={errorTitle}
          />
        </GradientPanel>
      </div>
    );
  }

  return children;
};
