import { afterEach, describe, expect, it, vi } from 'vitest';
import { streamAgentMessageApi } from '@/entities/agent';

const apiMocks = vi.hoisted(() => ({
  fetchAuthenticatedEventStream: vi.fn(),
}));

vi.mock('@/shared/api', () => ({
  fetchAuthenticatedEventStream: apiMocks.fetchAuthenticatedEventStream,
  request: {},
}));

afterEach(() => {
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
    vi.stubGlobal('crypto', { randomUUID: () => '11111111-1111-4111-8111-111111111111' });
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
});
