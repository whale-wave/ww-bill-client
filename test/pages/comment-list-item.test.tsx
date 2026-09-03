import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CommentListItem } from '@/pages/comment-list/ui/comment-list-item';

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

let cleanup: (() => void) | undefined;

function renderItem(props: Partial<Parameters<typeof CommentListItem>[0]> = {}) {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(createElement(CommentListItem, {
    content: '评论内容',
    name: '鲸浪用户',
    time: '刚刚',
    ...props,
  })));
  cleanup = () => act(() => root.unmount());
  return container;
}

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('comment list item', () => {
  it('uses an accessible full-card button only when navigation is available', () => {
    const onClick = vi.fn();
    const container = renderItem({ onClick });
    const button = container.querySelector('button');

    expect(button?.type).toBe('button');
    expect(button?.getAttribute('aria-label')).toBe('鲸浪用户: 评论内容');
    act(() => button?.click());
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('keeps a display-only item unfocusable', () => {
    expect(renderItem().querySelector('button')).toBeNull();
  });
});
