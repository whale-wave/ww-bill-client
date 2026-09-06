export const agentKeys = {
  all: ['agent', 'conversation-api-v1'] as const,
  conversations: () => [...agentKeys.all, 'conversations'] as const,
  messagesRoot: () => [...agentKeys.all, 'messages'] as const,
  messages: (conversationId: string) => [...agentKeys.messagesRoot(), conversationId] as const,
};
