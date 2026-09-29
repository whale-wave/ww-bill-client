import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NotificationDetailContent, NotificationMarkdownPreview } from '@/entities/notification';

const openExternalUrl = vi.hoisted(() => vi.fn(async () => undefined));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/lib', () => ({
  openExternalUrl,
  resolvePublicMediaUrl: (url: string) => url,
}));

vi.mock('@/shared/ui', () => ({ ImagePreview: () => null }));

vi.mock('@/shared/ui/public-media-image', () => ({
  usePublicMediaObjectUrl: (url: string) => ({ loading: false, url }),
}));

let cleanup: (() => void) | undefined;

function renderContent(content: string) {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(createElement(NotificationDetailContent, { content })));
  cleanup = () => act(() => root.unmount());
  return container;
}

function renderPreview(content: string) {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(createElement(NotificationMarkdownPreview, { content })));
  cleanup = () => act(() => root.unmount());
  return container;
}

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  openExternalUrl.mockReset();
});

describe('notificationDetailContent', () => {
  it('renders Markdown and GitHub Flavored Markdown structures', () => {
    const container = renderContent([
      '## 本次更新',
      '',
      '- **新增**：预算提醒',
      '- ~~旧版入口~~ 已下线',
      '',
      '| 平台 | 状态 |',
      '| --- | --- |',
      '| Web | 已发布 |',
    ].join('\n'));

    expect(container.querySelector('h2')?.textContent).toBe('本次更新');
    expect(container.querySelector('strong')?.textContent).toBe('新增');
    expect(container.querySelector('del')?.textContent).toBe('旧版入口');
    expect(container.querySelector('table')?.textContent).toContain('Web');
  });

  it('opens safe external links through the app bridge', async () => {
    const container = renderContent('[查看详情](https://example.com/release)');
    const link = container.querySelector<HTMLAnchorElement>('a');

    expect(link?.getAttribute('href')).toBe('https://example.com/release');
    await act(async () => link?.click());
    expect(openExternalUrl).toHaveBeenCalledWith('https://example.com/release');
  });

  it('does not render raw HTML or unsafe link protocols', () => {
    const container = renderContent('<script>alert(1)</script>\n\n[危险链接](javascript:alert(1))\n\n![远程图片](https://tracker.example/pixel.png)');

    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('a')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain('远程图片');
  });

  it('creates a non-interactive plain-text preview from Markdown', () => {
    const container = renderPreview('## 本次更新\n\n- **新增**：[预算提醒](https://example.com)');

    expect(container.textContent).toContain('本次更新');
    expect(container.textContent).toContain('新增：预算提醒');
    expect(container.textContent).not.toContain('##');
    expect(container.textContent).not.toContain('**');
    expect(container.querySelector('a')).toBeNull();
  });
});
