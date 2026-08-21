import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { LedgerUserAvatar } from '@/entities/ledger';
import { MemberCardsPresentation, MemberEditorPresentation } from '@/features/workspace-settings';

let cleanup: (() => void) | undefined;

function render(element: React.ReactNode) {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(element));
  cleanup = () => act(() => root.unmount());
  return container;
}

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('ledgerUserAvatar primitive', () => {
  it('renders single image avatar as a strictly bounded 1:1 circle with object-fit cover and flex-none', () => {
    const container = render(createElement(LedgerUserAvatar, {
      size: 48,
      user: {
        avatar: 'https://cdn.example.com/avatar1.png',
        id: 1,
        name: '王小波',
      },
    }));

    const img = container.querySelector<HTMLImageElement>('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('https://cdn.example.com/avatar1.png');
    expect(img?.classList.contains('rounded-full')).toBe(true);
    expect(img?.classList.contains('overflow-hidden')).toBe(true);
    expect(img?.classList.contains('object-cover')).toBe(true);
    expect(img?.classList.contains('flex-none')).toBe(true);
    expect(img?.classList.contains('aspect-square')).toBe(true);
    expect(img?.style.width).toBe('48px');
    expect(img?.style.height).toBe('48px');
    expect(img?.style.minWidth).toBe('48px');
    expect(img?.style.minHeight).toBe('48px');
    expect(img?.style.maxWidth).toBe('48px');
    expect(img?.style.maxHeight).toBe('48px');
    expect(img?.style.aspectRatio).toBe('1 / 1');
    expect(img?.style.flex).toMatch(/^(?:none|0 0 auto)$/);
  });

  it('renders initial-letter fallback as a strictly bounded 1:1 circle without avatar URL', () => {
    const container = render(createElement(LedgerUserAvatar, {
      size: 56,
      user: {
        id: 2,
        name: '李银河',
      },
    }));

    const span = container.querySelector<HTMLSpanElement>('span');
    expect(span).not.toBeNull();
    expect(span?.textContent).toBe('李');
    expect(span?.classList.contains('rounded-full')).toBe(true);
    expect(span?.classList.contains('overflow-hidden')).toBe(true);
    expect(span?.classList.contains('flex-none')).toBe(true);
    expect(span?.classList.contains('aspect-square')).toBe(true);
    expect(span?.style.width).toBe('56px');
    expect(span?.style.height).toBe('56px');
    expect(span?.style.minWidth).toBe('56px');
    expect(span?.style.minHeight).toBe('56px');
    expect(span?.style.aspectRatio).toBe('1 / 1');
    expect(span?.style.flex).toMatch(/^(?:none|0 0 auto)$/);
  });

  it('does not compress avatar dimensions when rendered alongside extremely long nicknames in flex containers', () => {
    const container = render(createElement(
      'div',
      { className: 'flex w-[200px] items-center' },
      createElement(LedgerUserAvatar, {
        size: 48,
        user: {
          avatar: 'https://cdn.example.com/long.png',
          id: 3,
          nickname: '超级无敌长长长长长长长长长长长长长长长长长长长的昵称',
        },
      }),
      createElement(
        'span',
        { className: 'min-w-0 flex-grow truncate' },
        '超级无敌长长长长长长长长长长长长长长长长长长长的昵称',
      ),
    ));

    const img = container.querySelector<HTMLImageElement>('img');
    expect(img).not.toBeNull();
    expect(img?.style.width).toBe('48px');
    expect(img?.style.height).toBe('48px');
    expect(img?.style.minWidth).toBe('48px');
    expect(img?.style.minHeight).toBe('48px');
    expect(img?.style.flex).toMatch(/^(?:none|0 0 auto)$/);
  });

  it('ensures both member list and member detail use the same avatar primitive and render all member avatars as circles', () => {
    const listContainer = render(createElement(MemberCardsPresentation, {
      current: {
        avatar: 'https://example.com/me.png',
        id: 'me',
        name: '我自己',
        user: { avatar: 'https://example.com/me.png', id: 1, name: '我自己' },
        userId: 1,
      },
      others: [
        {
          avatar: 'https://example.com/user2.png',
          id: 'user2',
          name: '伙伴A',
          user: { avatar: 'https://example.com/user2.png', id: 2, name: '伙伴A' },
          userId: 2,
        },
        {
          id: 'user3',
          name: '伙伴B',
          user: { id: 3, name: '伙伴B' },
          userId: 3,
        },
      ],
      othersLabel: '其他成员',
    }));

    const listImages = listContainer.querySelectorAll('img[data-avatar-type="image"]');
    const listFallbacks = listContainer.querySelectorAll('span[data-avatar-type="fallback"]');
    expect(listImages).toHaveLength(2);
    expect(listFallbacks).toHaveLength(1);
    listImages.forEach((img) => {
      expect(img.classList.contains('rounded-full')).toBe(true);
      expect((img as HTMLElement).style.aspectRatio).toBe('1 / 1');
      expect((img as HTMLElement).style.flex).toMatch(/^(?:none|0 0 auto)$/);
    });
    listFallbacks.forEach((span) => {
      expect(span.classList.contains('rounded-full')).toBe(true);
      expect((span as HTMLElement).style.aspectRatio).toBe('1 / 1');
      expect((span as HTMLElement).style.flex).toMatch(/^(?:none|0 0 auto)$/);
    });

    cleanup?.();
    cleanup = undefined;

    const detailContainer = render(createElement(
      MemberEditorPresentation,
      {
        member: {
          avatar: 'https://example.com/detail.png',
          id: 'detail-user',
          name: '详情用户',
          user: { avatar: 'https://example.com/detail.png', id: 9, name: '详情用户' },
          userId: 9,
        },
      },
      createElement('div', null, 'content'),
    ));

    const detailImg = detailContainer.querySelector('img[data-avatar-type="image"]');
    expect(detailImg).not.toBeNull();
    expect(detailImg?.classList.contains('rounded-full')).toBe(true);
    expect((detailImg as HTMLElement).style.aspectRatio).toBe('1 / 1');
    expect((detailImg as HTMLElement).style.flex).toMatch(/^(?:none|0 0 auto)$/);
  });
});
