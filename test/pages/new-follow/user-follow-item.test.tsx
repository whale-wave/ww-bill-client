import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UserFollowItem } from '@/pages/new-follow/ui/user-follow-item';

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

let cleanup: (() => void) | undefined;

function renderItem(props: Partial<Parameters<typeof UserFollowItem>[0]> = {}) {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(createElement(UserFollowItem, {
    followTime: '刚刚',
    username: '鲸浪用户',
    ...props,
  })));
  cleanup = () => act(() => root.unmount());
  return container;
}

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('user follow item', () => {
  it('keeps avatar, profile, and follow actions as separate native buttons', () => {
    const onAvatar = vi.fn();
    const onClick = vi.fn();
    const onSubmit = vi.fn();
    const container = renderItem({ onAvatar, onClick, onSubmit });
    const buttons = container.querySelectorAll('button');

    expect(buttons).toHaveLength(3);
    expect([...buttons].every(button => button.type === 'button')).toBe(true);

    act(() => buttons[0].click());
    act(() => buttons[1].click());
    act(() => buttons[2].click());

    expect(onAvatar).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
