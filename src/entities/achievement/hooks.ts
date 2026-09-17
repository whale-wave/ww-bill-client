import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { isSuccessApi } from '@/shared/api';
import { getAchievementBadgesApi, getAchievementSummaryApi, putAchievementDisplayApi } from './api';
import { achievementKeys } from './keys';

export function useAchievementSummaryQuery() {
  const { data: response, ...rest } = useQuery({ queryFn: getAchievementSummaryApi, queryKey: achievementKeys.summary() });
  const data = useMemo(() => isSuccessApi(response) ? response.data : undefined, [response]);
  return { data, response, ...rest };
}

export function useAchievementBadgesQuery() {
  const { data: response, ...rest } = useQuery({ queryFn: getAchievementBadgesApi, queryKey: achievementKeys.badges() });
  const data = useMemo(() => isSuccessApi(response) ? response.data : [], [response]);
  return { data, response, ...rest };
}

export function useUpdateAchievementDisplayMutation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({ mutationFn: putAchievementDisplayApi, onSuccess: async () => Promise.all([queryClient.invalidateQueries({ queryKey: achievementKeys.summary() }), queryClient.invalidateQueries({ queryKey: achievementKeys.badges() })]) });
  return [mutation.mutateAsync, mutation] as const;
}
