import type { Topic } from '@/entities/topic';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TopicItem } from '@/entities/topic';

vi.mock('@/shared/i18n', () => ({
  i18n: { t: (key: string) => key },
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/ui', () => ({
  Icon: ({ name }: { name: string }) => createElement('span', null, name),
}));

const topic = {
  commentCount: 2,
  content: '鲸浪话题内容',
  createdAt: '2026-09-03T00:00:00.000Z',
  id: 9,
  images: ['https://example.com/topic.png'],
  isLike: false,
  likeCount: 3,
  shareCount: 1,
  updatedAt: '2026-09-03T00:00:00.000Z',
  user: {
    avatar: 'https://example.com/avatar.png',
    id: 7,
    name: '鲸浪用户',
  },
} satisfies Topic;

let cleanup: (() => void) | undefined;

function renderTopic(props: Partial<Parameters<typeof TopicItem>[0]> = {}) {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(createElement(TopicItem, { data: topic, ...props })));
  cleanup = () => act(() => root.unmount());
  return container;
}

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('topic item', () => {
  it('separates avatar, topic, image, and footer actions into native buttons', () => {
    const onAvatar = vi.fn();
    const onComment = vi.fn();
    const onImg = vi.fn();
    const onLike = vi.fn();
    const onOpen = vi.fn();
    const onShare = vi.fn();
    const container = renderTopic({ onAvatar, onClick: onOpen, onComment, onImg, onLike, onShare });
    const buttons = container.querySelectorAll('button');

    expect(buttons).toHaveLength(7);
    expect([...buttons].every(button => button.type === 'button')).toBe(true);

    [...buttons].forEach(button => act(() => button.click()));

    expect(onAvatar).toHaveBeenCalledWith(7);
    expect(onOpen).toHaveBeenCalledTimes(2);
    expect(onImg).toHaveBeenCalledWith(0, topic.images[0]);
    expect(onShare).toHaveBeenCalledWith(9);
    expect(onComment).toHaveBeenCalledWith(9);
    expect(onLike).toHaveBeenCalledWith(9);
  });

  it('leaves a presentation-only card unfocusable', () => {
    const container = renderTopic();
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });
});
