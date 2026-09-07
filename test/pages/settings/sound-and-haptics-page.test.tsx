import type { ReactElement } from 'react';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SoundAndHapticsPage from '@/pages/sound-and-haptics/SoundAndHapticsPage';

vi.mock('antd-mobile', () => ({
  Toast: { show: vi.fn() },
}));

vi.mock('@/entities/user-app-config', () => ({
  useGetUserAppConfigQuery: () => ({
    data: {
      isOpenHapticEffect: false,
      isOpenMotionEffect: false,
      isOpenSoundEffect: false,
    },
  }),
  usePatchUserAppConfigMutation: () => [vi.fn(), { isLoading: false }],
}));

vi.mock('@/features/workspace-navigation', () => ({
  useWorkspaceBack: () => vi.fn(),
}));

vi.mock('@/features/workspace-settings', () => ({
  SettingsOverviewPresentation: ({ sections }: {
    sections: Array<{ rows: Array<{ id: string; label: string }> }>;
  }) => createElement(
    'div',
    null,
    sections.flatMap(section => section.rows).map(row => createElement(
      'span',
      { 'data-settings-row': row.id, 'key': row.id },
      row.label,
    )),
  ),
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/lib', () => ({
  audioWeb: { close: vi.fn(), download: vi.fn(), hasCache: vi.fn(), loadCache: vi.fn(), open: vi.fn() },
  hapticFeedback: { close: vi.fn(), impact: vi.fn(), open: vi.fn() },
  playSound: { click: vi.fn() },
}));

vi.mock('@/shared/ui', () => ({
  PageHeader: ({ title }: { title: string }) => createElement('header', null, title),
}));

let cleanup = () => {};

afterEach(() => cleanup());

describe('sound and haptics settings', () => {
  it('does not expose a motion preference switch', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(SoundAndHapticsPage) as ReactElement));
    cleanup = () => act(() => root.unmount());

    expect(container.querySelector('[data-settings-row="sound"]')).not.toBeNull();
    expect(container.querySelector('[data-settings-row="haptics"]')).not.toBeNull();
    expect(container.querySelector('[data-settings-row="motion"]')).toBeNull();
  });
});
