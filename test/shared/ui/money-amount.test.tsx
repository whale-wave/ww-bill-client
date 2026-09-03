import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { MoneyAmount } from '@/shared/ui';

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

function renderAmount(props: React.ComponentProps<typeof MoneyAmount>) {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(createElement(MoneyAmount, props)));
  cleanup = () => act(() => root.unmount());
  return container.firstElementChild as HTMLElement;
}

describe('money amount', () => {
  it('preserves server-provided decimal strings without turning display into a domain calculation', () => {
    expect(renderAmount({ value: '12.3400' }).textContent).toBe('¥12.3400');
    expect(renderAmount({ value: '-0.125' }).textContent).toBe('¥-0.125');
  });

  it('formats number inputs only at the display boundary', () => {
    expect(renderAmount({ value: 12 }).textContent).toBe('¥12.00');
    expect(renderAmount({ fractionDigits: 3, value: 12.5 }).textContent).toBe('¥12.500');
  });

  it('separates semantic tone and visibility masking from the display value', () => {
    const amount = renderAmount({ masked: true, tone: 'expense', value: '12.00' });

    expect(amount.textContent).toBe('••••');
    expect(amount.classList).toContain('text-finance-expense');
  });
});
