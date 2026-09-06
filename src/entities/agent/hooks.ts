import type { AgentConversation, AgentMessage, AgentPage } from './types';
import type { SuccessResponse } from '@/shared/api';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assertSuccessApi } from '@/shared/api';
import {
  getAgentConversationsApi,
  getAgentMessagesApi,
  postAgentConversationApi,
  postCancelAgentActionApi,
  postConfirmAgentActionApi,
} from './api';
import { agentKeys } from './keys';

export function useAgentConversationsQuery() {
  const query = useInfiniteQuery<SuccessResponse<AgentPage<AgentConversation>>>({
    getNextPageParam: lastPage => lastPage.data.nextCursor,
    queryFn: async ({ pageParam }) => assertSuccessApi(await getAgentConversationsApi(
      typeof pageParam === 'string' ? pageParam : undefined,
    )),
    queryKey: agentKeys.conversations(),
  });
  return {
    ...query,
    data: query.data?.pages?.flatMap(page => page.data.data) ?? [],
    response: query.data,
  };
}

export function useAgentMessagesQuery(conversationId?: string) {
  const query = useInfiniteQuery<SuccessResponse<AgentPage<AgentMessage>>>({
    enabled: Boolean(conversationId),
    getNextPageParam: lastPage => lastPage.data.nextCursor,
    queryFn: async ({ pageParam }) => assertSuccessApi(await getAgentMessagesApi(
      conversationId!,
      typeof pageParam === 'string' ? pageParam : undefined,
    )),
    queryKey: agentKeys.messages(conversationId ?? ''),
  });
  return {
    ...query,
    data: query.data?.pages?.slice().reverse().flatMap(page => page.data.data) ?? [],
    response: query.data,
  };
}

export function useCreateAgentConversationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => assertSuccessApi(await postAgentConversationApi()).data,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: agentKeys.conversations() }),
  });
}

export function useConfirmAgentActionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (options: { actionId: string; record?: Parameters<typeof postConfirmAgentActionApi>[1] }) =>
      assertSuccessApi(await postConfirmAgentActionApi(options.actionId, options.record)).data,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: agentKeys.messagesRoot() }),
  });
}

export function useCancelAgentActionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (actionId: string) => assertSuccessApi(await postCancelAgentActionApi(actionId)).data,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: agentKeys.messagesRoot() }),
  });
}
