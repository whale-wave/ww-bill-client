import { useEffect, useRef } from 'react';
import { postAchievementMonthReviewApi } from '@/entities/achievement';

export function useMonthReview(options: { enabled: boolean; householdId?: string; ledgerId?: string; month?: string }) {
  const reportedRef = useRef(new Set<string>());
  useEffect(() => {
    if (!options.enabled || !options.month)
      return;
    const key = `${options.householdId ?? options.ledgerId ?? 'personal'}:${options.month}`;
    if (reportedRef.current.has(key))
      return;
    reportedRef.current.add(key);
    void postAchievementMonthReviewApi({ householdId: options.householdId, ledgerId: options.ledgerId, month: options.month }).catch(() => undefined);
  }, [options.enabled, options.householdId, options.ledgerId, options.month]);
}
