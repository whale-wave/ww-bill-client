import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useRecordEditorSettingsNavigation } from '@/features/record-editor';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  useLocation: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useLocation: mocks.useLocation,
  useNavigate: () => mocks.navigate,
}));

afterEach(() => {
  mocks.navigate.mockReset();
  mocks.useLocation.mockReset();
});

function SettingsNavigationProbe({ reopenTagPicker }: { reopenTagPicker?: boolean }) {
  const openSettings = useRecordEditorSettingsNavigation(() => ({
    isTagPickerVisible: true,
    recordType: 'sub',
    time: '2026-08-30T00:00:00.000Z',
  }));
  return createElement('button', {
    onClick: () => openSettings('/ledgers/ledger-a/settings/categories', { reopenTagPicker }),
    type: 'button',
  });
}

describe('record editor settings navigation', () => {
  it('does not restore the tag picker after category settings', () => {
    mocks.useLocation.mockReturnValue({ pathname: '/bookkeeping', search: '', state: null });
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(SettingsNavigationProbe, { reopenTagPicker: false })));

    act(() => container.querySelector('button')?.click());

    expect(mocks.navigate).toHaveBeenCalledWith('/ledgers/ledger-a/settings/categories', {
      replace: true,
      state: expect.objectContaining({
        recordEditorSettingsNavigation: expect.objectContaining({
          draft: expect.objectContaining({ isTagPickerVisible: false }),
        }),
      }),
    });
    act(() => root.unmount());
  });
});
