import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { resolvePublicMediaUrl } from '@/shared/lib/public-media-url';
import { UserAvatar } from '@/shared/ui/user-avatar';

let cleanup: (() => void) | undefined;

function render(element: React.ReactNode) {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(element));
  cleanup = () => act(() => root.unmount());
  return {
    container,
    rerender: (next: React.ReactNode) => act(() => root.render(next)),
  };
}

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('resolvePublicMediaUrl', () => {
  it('resolves a site media path against the current web origin', () => {
    expect(resolvePublicMediaUrl('/api/media/public/550e8400-e29b-41d4-a716-446655440000/avatar-v1'))
      .toBe('http://localhost/api/media/public/550e8400-e29b-41d4-a716-446655440000/avatar-v1');
  });

  it('leaves legacy and non-media URLs untouched', () => {
    expect(resolvePublicMediaUrl('https://cdn.example.com/avatar.png')).toBe('https://cdn.example.com/avatar.png');
    expect(resolvePublicMediaUrl(null)).toBeNull();
  });
});

describe('userAvatar', () => {
  it('renders a visible icon fallback for an empty avatar', () => {
    const { container } = render(createElement(UserAvatar, {
      alt: 'Avan',
      fallback: 'icon',
      name: 'Avan',
      size: 48,
    }));
    const fallback = container.querySelector('[data-user-avatar="fallback"]');
    expect(fallback).not.toBeNull();
    expect(fallback?.querySelector('[data-design-icon="avatar-user"]')).not.toBeNull();
    expect((fallback as HTMLElement).style.width).toBe('48px');
    expect((fallback as HTMLElement).style.height).toBe('48px');
  });

  it('switches a failed image to the initial fallback without retrying it', () => {
    const { container } = render(createElement(UserAvatar, {
      name: '张三',
      size: 42,
      src: '/api/media/public/550e8400-e29b-41d4-a716-446655440000/avatar-v1',
    }));
    const image = container.querySelector<HTMLImageElement>('img');
    expect(image?.src).toBe('http://localhost/api/media/public/550e8400-e29b-41d4-a716-446655440000/avatar-v1');
    act(() => image?.dispatchEvent(new Event('error')));
    expect(container.querySelector('[data-user-avatar="fallback"]')?.textContent).toBe('张');
    expect(container.querySelector('img')).toBeNull();
  });

  it('recovers when the source changes after a failed image', () => {
    const { container, rerender } = render(createElement(UserAvatar, {
      name: '张三',
      src: 'https://cdn.example.com/bad.png',
    }));
    const first = container.querySelector<HTMLImageElement>('img');
    act(() => first?.dispatchEvent(new Event('error')));
    expect(container.querySelector('img')).toBeNull();
    rerender(createElement(UserAvatar, {
      name: '张三',
      src: 'https://cdn.example.com/good.png',
    }));
    expect(container.querySelector<HTMLImageElement>('img')?.src).toBe('https://cdn.example.com/good.png');
  });
});
