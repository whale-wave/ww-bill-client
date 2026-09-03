import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  MemberCardsPresentation,
  MemberEditorPresentation,
  SettingsOverviewPresentation,
} from '@/features/workspace-settings';

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

describe('workspace settings presentations', () => {
  it('renders fixed setting row kinds and keeps placeholder actions real', () => {
    const placeholder = vi.fn();
    const toggle = vi.fn();
    const container = render(createElement(SettingsOverviewPresentation, {
      sections: [{
        id: 'main',
        rows: [
          {
            checked: true,
            icon: 'record',
            id: 'switch',
            kind: 'switch',
            label: '金额显示',
            onChange: toggle,
          },
          {
            icon: 'help',
            id: 'help',
            kind: 'placeholder',
            label: '使用帮助',
            onClick: placeholder,
          },
        ],
      }],
    }));

    expect(container.querySelector('[data-settings-overview]')).not.toBeNull();
    act(() => container.querySelector<HTMLButtonElement>('[data-settings-row="switch"] [role="switch"]')?.click());
    expect(toggle).toHaveBeenCalledWith(false);
    act(() => container.querySelector<HTMLButtonElement>('[data-settings-row="help"]')?.click());
    expect(placeholder).toHaveBeenCalledOnce();
  });

  it('keeps the current member in the first card and others in a separate group', () => {
    const container = render(createElement(MemberCardsPresentation, {
      current: {
        badge: '管理员',
        id: 'me',
        isCurrent: true,
        name: '我',
        userId: 1,
      },
      others: [{
        badge: '成员',
        id: 'other',
        name: '同事',
        userId: 2,
      }],
      othersLabel: '其他成员',
    }));
    const cards = [...container.querySelectorAll('[data-member-id]')];
    expect(cards.map(card => card.getAttribute('data-member-id'))).toEqual([
      'me',
      'other',
    ]);
    expect(container.textContent).toContain('其他成员');
  });

  it('renders MemberCards avatars as circles, with or without an avatar URL', () => {
    const withAvatar = render(createElement(MemberCardsPresentation, {
      current: {
        avatar: 'https://example.com/me.png',
        id: 'me',
        name: '我',
        userId: 1,
      },
      others: [{
        avatar: 'https://example.com/other.png',
        id: 'other',
        name: '同事',
        userId: 2,
      }],
      othersLabel: '其他成员',
    }));
    const avatars = [...withAvatar.querySelectorAll('[data-member-id] img')];
    expect(avatars).toHaveLength(2);
    expect(avatars.every(img => img.classList.contains('rounded-full'))).toBe(true);

    const withoutAvatar = render(createElement(MemberCardsPresentation, {
      current: {
        id: 'me',
        name: '我',
        userId: 1,
      },
      others: [{
        id: 'other',
        name: '同事',
        userId: 2,
      }],
      othersLabel: '其他成员',
    }));
    const fallbacks = [...withoutAvatar.querySelectorAll('[data-member-id] span[class*="linear-gradient"]')];
    expect(fallbacks.every(span => span.classList.contains('rounded-full'))).toBe(true);
  });

  it('renders MemberEditor avatars as circles, with or without an avatar URL', () => {
    const withAvatar = render(createElement(MemberEditorPresentation, {
      children: null,
      member: {
        avatar: 'https://example.com/me.png',
        id: 'me',
        name: '我',
        userId: 1,
      },
    }));
    expect(withAvatar.querySelector('img')?.classList.contains('rounded-full')).toBe(true);

    const withoutAvatar = render(createElement(MemberEditorPresentation, {
      children: null,
      member: {
        id: 'me',
        name: '我',
        userId: 1,
      },
    }));
    const fallback = withoutAvatar.querySelector('[data-avatar-type="fallback"]');
    expect(fallback?.classList.contains('rounded-full')).toBe(true);
  });
});
