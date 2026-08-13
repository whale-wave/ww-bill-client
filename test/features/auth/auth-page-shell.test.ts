import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { AuthPageShell } from '@/features/auth';
import { changeLanguage, detectLanguage, useTranslation } from '@/shared/i18n';

let cleanup: (() => void) | undefined;

function TestAuthPage() {
  const { t } = useTranslation('auth');
  return createElement(
    AuthPageShell,
    {
      subtitle: t('login.subtitle'),
      title: t('login.title'),
    },
    createElement('span', null, t('login.usernameLabel')),
  );
}

function renderAuthPage() {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  act(() => root.render(createElement(TestAuthPage)));
  cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  return container;
}

afterEach(async () => {
  cleanup?.();
  cleanup = undefined;
  await changeLanguage('zh-CN');
});

describe('auth page language switch', () => {
  it('switches and persists language before the user signs in', async () => {
    await changeLanguage('zh-CN');
    const container = renderAuthPage();

    expect(container.querySelector('h1')?.textContent).toBe('登录');
    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="auth-language-switch"]')?.click();
    });

    expect(container.querySelector('h1')?.textContent).toBe('Login');
    expect(detectLanguage()).toBe('en');
  });
});
