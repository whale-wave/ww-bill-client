import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Share from '@/shared/ui/share';

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

let cleanup: (() => void) | undefined;

function renderShare(props: Partial<Parameters<typeof Share>[0]> = {}) {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(createElement(Share, {
    shares: [],
    visible: true,
    ...props,
  })));
  cleanup = () => act(() => root.unmount());
  return container;
}

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('share panel', () => {
  it('uses a native button only for destinations with an action', () => {
    const onShare = vi.fn();
    const container = renderShare({
      shares: [{ id: 1, name: 'WeChat', onClick: onShare }],
    });
    const shareButton = [...container.querySelectorAll('button')]
      .find(button => button.textContent === 'WeChat');

    expect(shareButton?.type).toBe('button');
    expect(container.querySelectorAll('.bwm-share-opt:not(button)')).toHaveLength(3);

    act(() => shareButton?.click());
    expect(onShare).toHaveBeenCalledOnce();
  });
});
