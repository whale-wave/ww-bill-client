import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assertSuccessApi } from '@/shared/api';
import {
  claimShortcutDraftApi,
  confirmShortcutDraftApi,
  discardShortcutDraftApi,
  getShortcutAccessTokensApi,
  issueShortcutAccessTokenApi,
  revokeShortcutAccessTokenApi,
} from './api';
import { shortcutBookkeepingKeys } from './keys';

export function useShortcutAccessTokensQuery() {
  const { data: response, ...rest } = useQuery({
    queryFn: async () => assertSuccessApi(await getShortcutAccessTokensApi()),
    queryKey: shortcutBookkeepingKeys.tokens(),
  });
  return { data: response?.data ?? [], response, ...rest };
}

export function useIssueShortcutAccessTokenMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Parameters<typeof issueShortcutAccessTokenApi>[0]) =>
      assertSuccessApi(await issueShortcutAccessTokenApi(data)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: shortcutBookkeepingKeys.tokens() });
    },
  });
}

export function useRevokeShortcutAccessTokenMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tokenId: string) =>
      assertSuccessApi(await revokeShortcutAccessTokenApi(tokenId)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: shortcutBookkeepingKeys.tokens() });
    },
  });
}

export function useClaimShortcutDraftMutation() {
  return useMutation({
    mutationFn: async ({ code, draftId }: { code: string; draftId: string }) =>
      assertSuccessApi(await claimShortcutDraftApi(draftId, code)).data,
  });
}

export function useDiscardShortcutDraftMutation() {
  return useMutation({
    mutationFn: async ({ code, draftId }: { code: string; draftId: string }) =>
      assertSuccessApi(await discardShortcutDraftApi(draftId, code)).data,
  });
}

export function useConfirmShortcutDraftMutation() {
  return useMutation({
    mutationFn: async (data: Parameters<typeof confirmShortcutDraftApi>[0]) =>
      assertSuccessApi(await confirmShortcutDraftApi(data)).data,
  });
}
