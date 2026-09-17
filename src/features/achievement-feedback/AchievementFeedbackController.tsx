import type { FC } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { achievementKeys, postAchievementFeedbackClaimApi } from '@/entities/achievement';
import { isSuccessApi } from '@/shared/api';
import { showAppNotice } from '@/shared/ui/app-feedback';
import { REFRESH_EVENT } from './feedback-request';

export const AchievementFeedbackController: FC<{ sessionKey: string }> = ({ sessionKey }) => {
  const queryClient = useQueryClient();
  const claimedForTokenRef = useRef<string>();
  const retryTimerRef = useRef<number>();
  const claim = useCallback(() => postAchievementFeedbackClaimApi().then((response) => {
    if (!isSuccessApi(response) || !response.data.rewards.length)
      return false;
    void queryClient.invalidateQueries({ queryKey: achievementKeys.all });
    showAppNotice(`解锁了 ${response.data.rewards.length} 项新的航程成就`);
    return true;
  }).catch(() => false), [queryClient]);
  useEffect(() => {
    if (!sessionKey || claimedForTokenRef.current === sessionKey)
      return;
    claimedForTokenRef.current = sessionKey;
    void claim();
  }, [claim, sessionKey]);
  useEffect(() => {
    const refresh = () => {
      let attempts = 0;
      const retry = () => {
        void claim().then((claimed) => {
          attempts += 1;
          if (!claimed && attempts < 15)
            retryTimerRef.current = window.setTimeout(retry, 2000);
        });
      };
      retry();
    };
    window.addEventListener(REFRESH_EVENT, refresh);
    return () => {
      window.removeEventListener(REFRESH_EVENT, refresh);
      if (retryTimerRef.current !== undefined)
        window.clearTimeout(retryTimerRef.current);
    };
  }, [claim]);
  return null;
};
