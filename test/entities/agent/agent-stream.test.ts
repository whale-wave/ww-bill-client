import { afterEach, describe, expect, it, vi } from 'vitest';
import { isIosStandaloneAgentRuntime, sendAgentMessageApi, streamAgentMessageApi } from '@/entities/agent';

const apiMocks = vi.hoisted(() => ({
  fetchAuthenticatedEventStream: vi.fn(),
  post: vi.fn(),
  uuid: vi.fn(() => '11111111-1111-4111-8111-111111111111'),
}));

vi.mock('@/shared/api', () => ({
  assertSuccessApi: <T>(response: T) => response,
  fetchAuthenticatedEventStream: apiMocks.fetchAuthenticatedEventStream,
  request: { post: apiMocks.post },
}));

vi.mock('uuid', () => ({ v4: apiMocks.uuid }));

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe('agent message stream', () => {
  it('reassembles SSE events split across network chunks', async () => {
    const encoder = new TextEncoder();
    const chunks = [
      'event: text.delta\r\ndata: {"delta":"你',
      '好"}\r\n\r\nevent: message.completed\ndata: {"message":{"id":"assistant-1","conversationId":"conversation-1","role":"ASSISTANT","status":"COMPLETE","content":"你好","createdAt":"2026-09-06T00:00:00.000Z"}}\n\n',
    ].map(value => encoder.encode(value));
    let readIndex = 0;
    apiMocks.fetchAuthenticatedEventStream.mockResolvedValue({
      getReader: () => ({
        read: async () => readIndex < chunks.length
          ? { done: false, value: chunks[readIndex++] }
          : { done: true, value: undefined },
      }),
    });
    const events: unknown[] = [];

    await streamAgentMessageApi({
      content: '午饭 25 元',
      conversationId: 'conversation-1',
      onEvent: event => events.push(event),
    });

    expect(events).toEqual([
      { event: 'text.delta', data: { delta: '你好' } },
      { event: 'message.completed', data: { message: expect.objectContaining({ id: 'assistant-1' }) } },
    ]);
    expect(apiMocks.fetchAuthenticatedEventStream).toHaveBeenCalledWith(
      '/agent/conversations/conversation-1/messages/stream',
      expect.objectContaining({ headers: { 'Content-Type': 'application/json' } }),
    );
  });

  it('uses a JSON reply in an iOS standalone web app', async () => {
    apiMocks.post.mockResolvedValue({
      data: {
        assistantMessage: {
          content: '已经按你的条件完成统计。',
          conversationId: 'conversation-1',
          createdAt: '2026-09-16T09:30:00.000Z',
          id: 'assistant-1',
          role: 'ASSISTANT',
          status: 'COMPLETE',
        },
        userMessage: {
          content: '本月餐饮花了多少',
          conversationId: 'conversation-1',
          createdAt: '2026-09-16T09:30:00.000Z',
          id: 'user-1',
          role: 'USER',
          status: 'COMPLETE',
        },
      },
      message: '操作成功',
      statusCode: 200,
    });
    vi.stubGlobal('navigator', { language: 'zh-CN' });
    const events: unknown[] = [];

    await sendAgentMessageApi({
      content: '本月餐饮花了多少',
      conversationId: 'conversation-1',
      onEvent: event => events.push(event),
      runtime: { displayModeStandalone: true, maxTouchPoints: 1, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)' },
    });

    expect(apiMocks.fetchAuthenticatedEventStream).not.toHaveBeenCalled();
    expect(apiMocks.post).toHaveBeenCalledWith(
      '/agent/conversations/conversation-1/messages',
      expect.objectContaining({
        clientMessageId: '11111111-1111-4111-8111-111111111111',
        content: '本月餐饮花了多少',
      }),
    );
    expect(events).toEqual([
      { event: 'message.started', data: { assistantMessageId: 'assistant-1', userMessage: expect.objectContaining({ id: 'user-1' }) } },
      { event: 'text.delta', data: { delta: '已经按你的条件完成统计。' } },
      { event: 'message.completed', data: { message: expect.objectContaining({ id: 'assistant-1' }) } },
    ]);
  });

  it('recognizes iPad desktop mode as iOS standalone', () => {
    expect(isIosStandaloneAgentRuntime({
      displayModeStandalone: true,
      maxTouchPoints: 5,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15',
    })).toBe(true);
  });
});
