import type {
  AgentCard,
  AgentConversation,
  AgentMessage,
  AgentPage,
  AgentRecordDraft,
  AgentStreamEvent,
  AgentTurn,
} from './types';
import type { SuccessResponse } from '@/shared/api';
import { v4 as uuidv4 } from 'uuid';
import { assertSuccessApi, fetchAuthenticatedEventStream, request } from '@/shared/api';

export interface AgentRuntime {
  displayModeStandalone: boolean;
  maxTouchPoints: number;
  userAgent: string;
}

interface AgentMessagePayload {
  clientMessageId: string;
  content: string;
  locale: string;
  timeZone: string;
}

function getAgentRuntime(): AgentRuntime {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return {
    displayModeStandalone: navigatorWithStandalone.standalone === true
      || window.matchMedia?.('(display-mode: standalone)').matches === true,
    maxTouchPoints: navigator.maxTouchPoints ?? 0,
    userAgent: navigator.userAgent,
  };
}

export function isIosStandaloneAgentRuntime(runtime: AgentRuntime) {
  if (!runtime.displayModeStandalone)
    return false;
  return /iPad|iPhone|iPod/i.test(runtime.userAgent)
    || (/Macintosh/i.test(runtime.userAgent) && runtime.maxTouchPoints > 1);
}

function createAgentMessagePayload(content: string): AgentMessagePayload {
  return {
    clientMessageId: uuidv4(),
    content,
    locale: navigator.language || 'zh-CN',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai',
  };
}

export function getAgentConversationsApi(cursor?: string) {
  return request.get<unknown, SuccessResponse<AgentPage<AgentConversation>>>('/agent/conversations', {
    params: { limit: 20, ...(cursor ? { cursor } : {}) },
  });
}

export function postAgentConversationApi() {
  return request.post<unknown, SuccessResponse<AgentConversation>>('/agent/conversations');
}

export function deleteAgentConversationApi(conversationId: string) {
  return request.delete<unknown, SuccessResponse<{ id: string }>>(
    `/agent/conversations/${encodeURIComponent(conversationId)}`,
  );
}

export function getAgentMessagesApi(conversationId: string, cursor?: string) {
  return request.get<unknown, SuccessResponse<AgentPage<AgentMessage>>>(
    `/agent/conversations/${encodeURIComponent(conversationId)}/messages`,
    { params: { limit: 100, ...(cursor ? { cursor } : {}) } },
  );
}

export function postAgentMessageApi(conversationId: string, data: AgentMessagePayload) {
  return request.post<AgentMessagePayload, SuccessResponse<AgentTurn>>(
    `/agent/conversations/${encodeURIComponent(conversationId)}/messages`,
    data,
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
  const payload = createAgentMessagePayload(options.content);
  const responseBody = await fetchAuthenticatedEventStream(
    `/agent/conversations/${encodeURIComponent(options.conversationId)}/messages/stream`,
    {
      body: JSON.stringify({
        ...payload,
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

export async function sendAgentMessageApi(options: {
  content: string;
  conversationId: string;
  onEvent: (event: AgentStreamEvent) => void;
  runtime?: AgentRuntime;
  signal?: AbortSignal;
}) {
  if (!isIosStandaloneAgentRuntime(options.runtime ?? getAgentRuntime())) {
    return streamAgentMessageApi(options);
  }

  const turn = assertSuccessApi(await postAgentMessageApi(
    options.conversationId,
    createAgentMessagePayload(options.content),
  )).data;
  options.onEvent({
    data: { assistantMessageId: turn.assistantMessage.id, userMessage: turn.userMessage },
    event: 'message.started',
  });
  if (turn.assistantMessage.content)
    options.onEvent({ data: { delta: turn.assistantMessage.content }, event: 'text.delta' });
  if (turn.assistantMessage.card)
    options.onEvent({ data: { card: turn.assistantMessage.card }, event: 'card.ready' });
  options.onEvent({ data: { message: turn.assistantMessage }, event: 'message.completed' });
}
