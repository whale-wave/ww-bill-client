import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/features/auth';
import { useDisplayPreference } from '@/features/display-preferences';

let cleanup: (() => void) | undefined;
const previousUserId = useAuthStore.getState().userId;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  useAuthStore.setState({ userId: previousUserId });
});

describe('local display preferences', () => {
  it('imports the old remote value once and keeps later changes local', () => {
    useAuthStore.setState({ userId: 'alice' });
    const container = document.createElement('div');
    const root = createRoot(container);
    let setVisible = (_value: boolean) => {};

    function Preference({ legacyValue }: { legacyValue?: boolean }) {
      const [visible, setValue] = useDisplayPreference('personal', 'amount-visible', legacyValue);
      setVisible = setValue;
      return createElement('span', null, String(visible));
    }

    cleanup = () => act(() => root.unmount());
    act(() => root.render(createElement(Preference, { legacyValue: true })));
    expect(container.textContent).toBe('true');
    expect(localStorage.getItem('ww:display-preference:v1:alice:personal:amount-visible')).toBe('true');

    act(() => setVisible(false));
    act(() => root.render(createElement(Preference, { legacyValue: true })));
    expect(container.textContent).toBe('false');
    expect(localStorage.getItem('ww:display-preference:v1:alice:personal:amount-visible')).toBe('false');

    act(() => root.unmount());
    const restoredRoot = createRoot(container);
    cleanup = () => act(() => restoredRoot.unmount());
    act(() => restoredRoot.render(createElement(Preference, { legacyValue: true })));
    expect(container.textContent).toBe('false');

    act(() => restoredRoot.render(createElement(Preference, {})));
    act(() => useAuthStore.setState({ userId: 'bob' }));
    expect(container.textContent).toBe('false');
    expect(localStorage.getItem('ww:display-preference:v1:bob:personal:amount-visible')).toBeNull();
  });
});
