import type {
  AgentCard,
  AgentConversation,
  AgentMessage,
  AgentPage,
  AgentRecordDraft,
  AgentStreamEvent,
} from './types';
import type { SuccessResponse } from '@/shared/api';
import { fetchAuthenticatedEventStream, request } from '@/shared/api';

export function getAgentConversationsApi(cursor?: string) {
  return request.get<unknown, SuccessResponse<AgentPage<AgentConversation>>>('/agent/conversations', {
    params: { limit: 20, ...(cursor ? { cursor } : {}) },
  });
}

export function postAgentConversationApi() {
  return request.post<unknown, SuccessResponse<AgentConversation>>('/agent/conversations');
}

export function getAgentMessagesApi(conversationId: string, cursor?: string) {
  return request.get<unknown, SuccessResponse<AgentPage<AgentMessage>>>(
    `/agent/conversations/${encodeURIComponent(conversationId)}/messages`,
    { params: { limit: 100, ...(cursor ? { cursor } : {}) } },
  );
}

export function postConfirmAgentActionApi(actionId: string, record?: AgentRecordDraft) {
  return request.post<unknown, SuccessResponse<AgentCard>>(
    `/agent/actions/${encodeURIComponent(actionId)}/confirm`,
    record ? { record: { ...record, categoryId: String(record.categoryId) } } : {},
  );
}

export function postCancelAgentActionApi(actionId: string) {
  return request.post<unknown, SuccessResponse<AgentMessage>>(
    `/agent/actions/${encodeURIComponent(actionId)}/cancel`,
  );
}

function parseEvent(block: string): AgentStreamEvent | undefined {
  let event = '';
  const data: string[] = [];
  for (const line of block.split('\n')) {
    if (line.startsWith('event:'))
      event = line.slice(6).trim();
    if (line.startsWith('data:'))
      data.push(line.slice(5).trim());
  }
  if (!event || data.length === 0)
    return;
  return { event, data: JSON.parse(data.join('\n')) } as AgentStreamEvent;
}

export async function streamAgentMessageApi(options: {
  content: string;
  conversationId: string;
  onEvent: (event: AgentStreamEvent) => void;
  signal?: AbortSignal;
}) {
  const responseBody = await fetchAuthenticatedEventStream(
    `/agent/conversations/${encodeURIComponent(options.conversationId)}/messages/stream`,
    {
      body: JSON.stringify({
        clientMessageId: crypto.randomUUID(),
        content: options.content,
        locale: navigator.language,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      signal: options.signal,
    },
  );
  const reader = responseBody.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, '\n');
    const blocks = buffer.split('\n\n');
    buffer = blocks.pop() ?? '';
    blocks.forEach((block) => {
      const event = parseEvent(block);
      if (event)
        options.onEvent(event);
    });
    if (done)
      break;
  }
  if (buffer.trim()) {
    const event = parseEvent(buffer);
    if (event)
      options.onEvent(event);
  }
}
