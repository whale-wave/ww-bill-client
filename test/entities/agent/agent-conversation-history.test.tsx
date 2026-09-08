import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AgentChatPage from '@/pages/agent-chat/AgentChatPage';

const mocks = vi.hoisted(() => ({
  confirmDangerousAction: vi.fn(),
  deleteConversation: vi.fn(),
  invalidateQueries: vi.fn(),
  navigate: vi.fn(),
  setSearchParams: vi.fn(),
}));

vi.mock('@tanstack/react-query', async importOriginal => ({
  ...await importOriginal<typeof import('@tanstack/react-query')>(),
  useQueryClient: () => ({ invalidateQueries: mocks.invalidateQueries }),
}));

vi.mock('react-router-dom', async importOriginal => ({
  ...await importOriginal<typeof import('react-router-dom')>(),
  useNavigate: () => mocks.navigate,
  useSearchParams: () => [new URLSearchParams('conversationId=conversation-1'), mocks.setSearchParams],
}));

vi.mock('@/entities/agent', () => ({
  agentKeys: {
    conversations: () => ['agent', 'conversations'],
    messages: (id: string) => ['agent', 'messages', id],
  },
  createAgentRecordEditorState: vi.fn(),
  streamAgentMessageApi: vi.fn(),
  useAgentConversationsQuery: () => ({
    data: [
      { createdAt: '2026-09-06T02:00:00Z', id: 'conversation-1', lastMessageAt: '2026-09-06T03:00:00Z', ledgerId: 'ledger-1', title: '午餐 25 元' },
      { createdAt: '2026-09-05T02:00:00Z', id: 'conversation-2', lastMessageAt: '2026-09-05T03:00:00Z', ledgerId: 'ledger-1', title: '昨天支出' },
    ],
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isError: false,
    isFetchingNextPage: false,
    isLoading: false,
  }),
  useAgentMessagesQuery: () => ({
    data: [],
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    isLoading: false,
  }),
  useCancelAgentActionMutation: () => ({ isLoading: false, mutateAsync: vi.fn() }),
  useConfirmAgentActionMutation: () => ({ isLoading: false, mutateAsync: vi.fn() }),
  useCreateAgentConversationMutation: () => ({ isLoading: false, mutateAsync: vi.fn() }),
  useDeleteAgentConversationMutation: () => ({
    isLoading: false,
    mutateAsync: mocks.deleteConversation,
  }),
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { title?: string }) => ({
      deleteConversationLabel: `删除对话 ${options?.title ?? ''}`,
      history: '历史对话',
      newConversation: '新建对话',
    })[key] ?? key,
  }),
}));

vi.mock('@/shared/ui', () => ({
  AppSheet: ({ children, visible }: { children: React.ReactNode; visible: boolean }) => visible ? <div>{children}</div> : null,
  PageHeader: ({ right, title }: { right: React.ReactNode; title: React.ReactNode }) => (
    <header>
      <h1>{title}</h1>
      {right}
    </header>
  ),
  PageLoadingState: () => null,
  confirmDangerousAction: mocks.confirmDangerousAction,
}));

let cleanup: (() => void) | undefined;

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  vi.clearAllMocks();
});

describe('agent conversation history', () => {
  it('requires confirmation before deleting a historical conversation', async () => {
    mocks.confirmDangerousAction.mockResolvedValue(true);
    mocks.deleteConversation.mockResolvedValue({ id: 'conversation-2' });
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(<AgentChatPage />));
    cleanup = () => act(() => root.unmount());

    act(() => container.querySelector<HTMLButtonElement>('button[aria-label="历史对话"]')!.click());
    const deleteButton = container.querySelector<HTMLButtonElement>('button[aria-label="删除对话 昨天支出"]');

    expect(deleteButton).not.toBeNull();
    await act(async () => deleteButton!.click());
    expect(mocks.confirmDangerousAction).toHaveBeenCalledWith(expect.objectContaining({
      description: 'deleteConversationDescription',
    }));
    expect(mocks.deleteConversation).toHaveBeenCalledWith('conversation-2');
  });

  it('selects the next conversation after deleting the active one', async () => {
    mocks.confirmDangerousAction.mockResolvedValue(true);
    mocks.deleteConversation.mockResolvedValue({ id: 'conversation-1' });
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(<AgentChatPage />));
    cleanup = () => act(() => root.unmount());

    act(() => container.querySelector<HTMLButtonElement>('button[aria-label="历史对话"]')!.click());
    await act(async () => container.querySelector<HTMLButtonElement>('button[aria-label="删除对话 午餐 25 元"]')!.click());

    expect(mocks.deleteConversation).toHaveBeenCalledWith('conversation-1');
    expect(mocks.setSearchParams).toHaveBeenCalledWith(
      { conversationId: 'conversation-2' },
      { replace: true },
    );
  });

  it('keeps the conversation when deletion is cancelled', async () => {
    mocks.confirmDangerousAction.mockResolvedValue(false);
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(<AgentChatPage />));
    cleanup = () => act(() => root.unmount());

    act(() => container.querySelector<HTMLButtonElement>('button[aria-label="历史对话"]')!.click());
    await act(async () => container.querySelector<HTMLButtonElement>('button[aria-label="删除对话 昨天支出"]')!.click());

    expect(mocks.deleteConversation).not.toHaveBeenCalled();
  });
});
