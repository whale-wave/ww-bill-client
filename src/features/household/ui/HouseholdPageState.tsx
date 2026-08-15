import type { FC, ReactNode } from 'react';
import { SpinLoading } from 'antd-mobile';
import { CircleAlert } from 'lucide-react';
import { GradientPanel, IllustratedEmptyState } from '@/shared/ui';

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
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4" data-testid="household-loading">
        <span className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-white/70 bg-white/85 text-primary-deep shadow-ww-lg backdrop-blur-xl">
          <SpinLoading color="primary" />
        </span>
        <span className="text-[13px] font-semibold text-ww-mid">{loadingLabel}</span>
      </div>
    );
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
