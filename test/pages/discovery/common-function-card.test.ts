import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CommonFunctionCard from '@/pages/discovery/ui/CommonFunctionCard';

vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => ({
      'commonFunctions.assetSteward': '资产管家',
      'commonFunctions.fixedExpenses': '固定支出',
      'commonFunctions.invoiceAssistant': '发票助手',
      'commonFunctions.title': '常用功能',
    })[key] ?? key,
  }),
}));

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('common function card', () => {
  it('hides the unimplemented exchange-rate converter', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(CommonFunctionCard)));
    cleanup = () => act(() => root.unmount());

    expect(container.querySelectorAll('button')).toHaveLength(3);
    expect(container.textContent).toContain('发票助手');
    expect(container.textContent).toContain('固定支出');
    expect(container.textContent).not.toContain('汇率换算器');
  });
});
