import type { CategoryIconCatalogItem } from '@/entities/category';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CategoryEmojiPicker } from '@/features/category-management/ui/CategoryEmojiPicker';

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({
    i18n: { resolvedLanguage: 'zh-CN' },
    t: (key: string) => key,
  }),
}));

afterEach(() => vi.unstubAllGlobals());

describe('category emoji picker', () => {
  it('loads the next page when the end of the list enters the scroll area', () => {
    const callbacks: IntersectionObserverCallback[] = [];
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: IntersectionObserverCallback) {
        callbacks.push(callback);
      }

      observe() {}
      disconnect() {}
    });

    const icons: CategoryIconCatalogItem[] = Array.from({ length: 101 }, (_, index) => ({
      group: 'emoji-food',
      key: `emoji:${String.fromCodePoint(0x1F600 + index)}`,
      name: { en: `Emoji ${index}`, zh: `表情 ${index}` },
    }));
    const container = document.createElement('div');
    const root = createRoot(container);
    try {
      act(() => root.render(<CategoryEmojiPicker icons={icons} onSelect={vi.fn()} />));
      const foodTab = [...container.querySelectorAll<HTMLButtonElement>('button')]
        .find(button => button.textContent === 'categories.emojiGroups.emoji-food');
      act(() => foodTab?.click());

      expect(container.querySelector('button[aria-label="表情 99"]')).not.toBeNull();
      expect(container.querySelector('button[aria-label="表情 100"]')).toBeNull();
      expect([...container.querySelectorAll('button')].some(button => button.textContent === 'categories.emojiShowMore')).toBe(false);
      act(() => callbacks.at(-1)?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
      expect(container.querySelector('button[aria-label="表情 100"]')).not.toBeNull();
    }
    finally {
      act(() => root.unmount());
    }
  });
});
