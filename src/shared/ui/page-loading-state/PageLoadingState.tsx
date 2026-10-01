import type { ReactNode } from 'react';
import { PageLoadingVisual } from '@ww-bill/bill-ui';
import whaleLoading from '@ww-bill/bill-ui/whale-loading.png';

export interface PageLoadingStateProps {
  className?: string;
  compact?: boolean;
  label: ReactNode;
  testId?: string;
}

export function PageLoadingState({ className, compact = false, label, testId }: PageLoadingStateProps) {
  return <PageLoadingVisual className={className} compact={compact} label={label} testId={testId} image={<img alt="" className="bill-page-loading__image" src={whaleLoading} />} />;
}
