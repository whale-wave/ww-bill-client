import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Tabs from '@/pages/community/ui/Personal/Tabs';

vi.mock('@/entities/follow', () => ({
  CheckInfo: () => createElement('div'),
}));

vi.mock('@/entities/topic', () => ({
  TopicItem: () => createElement('article'),
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

let cleanup: (() => void) | undefined;

function renderTabs() {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(createElement(Tabs, { checkInfo: {}, topics: [] })));
  cleanup = () => act(() => root.unmount());
  return container;
}

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('community personal tabs', () => {
  it('uses pressed native buttons to switch active content', () => {
    const buttons = renderTabs().querySelectorAll('button');
    expect(buttons).toHaveLength(3);
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');

    act(() => buttons[1].click());
    expect(buttons[0].getAttribute('aria-pressed')).toBe('false');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
  });
});
