import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AgentCardView } from '@/pages/agent-chat/ui/AgentCardView';

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => ({
      deletedRecord: '记录已删除',
      editRecord: '编辑记录',
      expense: '支出',
    })[key] ?? key,
  }),
}));

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('agent record result card', () => {
  it('shows a deleted record as read-only without an edit action', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(
      <AgentCardView
        card={{
          actionId: 'action-1',
          category: { icon: 'catering', id: 3, name: '餐饮', type: 'sub' },
          kind: 'RECORD_RESULT',
          record: {
            amount: '25.00',
            categoryId: 3,
            id: 91,
            remark: '午饭',
            time: '2026-09-06T11:00:00+08:00',
            type: 'sub',
            version: 2,
          },
          status: 'DELETED',
          version: 1,
        }}
        onCancelDraft={vi.fn()}
        onConfirmDraft={vi.fn()}
        onEditDraft={vi.fn()}
        onEditRecord={vi.fn()}
        onViewRecords={vi.fn()}
      />,
    ));
    cleanup = () => act(() => root.unmount());

    expect(container.textContent).toContain('记录已删除');
    expect(Array.from(container.querySelectorAll('button')).some(button => button.textContent?.includes('编辑记录'))).toBe(false);
  });
});
