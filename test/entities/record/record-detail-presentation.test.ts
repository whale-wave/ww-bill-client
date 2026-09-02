import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RecordDetailPresentation } from '@/entities/record';

const mocks = vi.hoisted(() => ({
  copy: vi.fn(() => true),
  toastShow: vi.fn(),
}));

vi.mock('antd-mobile', () => ({ Toast: { show: mocks.toastShow } }));
vi.mock('copy-to-clipboard', () => ({ default: mocks.copy }));

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  mocks.copy.mockClear();
  mocks.toastShow.mockClear();
});

describe('record detail presentation', () => {
  it('omits supplementary content and actions when only required props are provided', () => {
    const container = render(createElement(RecordDetailPresentation, {
      backLabel: 'Back',
      category: { icon: 'bill', name: 'Uncategorised' },
      onBack: () => undefined,
      rows: [{ label: 'Amount', value: '20.00' }],
    }));

    expect(container.querySelector('[data-record-detail-navigation]')).not.toBeNull();
    expect(container.textContent).toContain('Amount');
    expect(container.textContent).not.toContain('Member');
    expect(container.querySelector('[data-record-detail-pin]')).toBeNull();
    expect(container.querySelector('[data-record-detail-footer]')).toBeNull();
    expect(container.querySelector('[data-record-detail-supplementary]')).toBeNull();
  });

  it('keeps the new summary, information cards, share action, and floating footer while accepting household additions', () => {
    const onBack = () => undefined;
    const onShare = () => undefined;
    const onPolicy = () => undefined;

    const container = render(createElement(RecordDetailPresentation, {
      backLabel: 'Back',
      amount: '20.00',
      amountType: 'sub',
      category: { icon: 'food', name: 'Food' },
      footerActions: [
        { label: 'Share', onClick: onShare },
        { label: 'Visibility', onClick: onPolicy, testId: 'household-record-policy' },
      ],
      onBack,
      pinnedAction: { label: 'Share', onClick: onShare },
      rows: [
        { label: 'Type', value: 'Expense' },
        { label: 'Amount', value: '20.00' },
        { label: 'Date', value: '2026-07-21 Tuesday' },
        { label: 'Note', value: 'Dinner' },
      ],
      supplementaryRows: [
        { label: 'Member', value: 'Avan' },
        { label: 'Tags', value: '#meal' },
        { label: 'Counted', value: 'Counted in household totals' },
      ],
    }));

    expect(container.querySelector('[data-record-detail-presentation]')).not.toBeNull();
    expect(container.querySelector('[data-record-detail-header]')?.classList).toContain('rounded-[20px]');
    expect(container.querySelector('[data-record-detail-amount]')?.textContent).toContain('20.00');
    const category = container.querySelector('[data-record-detail-category]');
    expect(category?.classList).toContain('items-center');
    expect(container.querySelector('[data-record-detail-row]')?.classList).toContain('border-b');
    expect(container.querySelector('[data-category-icon="food"] use')?.getAttribute('xlink:href')).toBe('#icon-food');
    expect(container.textContent).toContain('Food');
    expect(container.textContent).toContain('Member');
    expect(container.textContent).toContain('Counted in household totals');
    expect(container.querySelector('[data-record-detail-pin]')?.textContent).toContain('Share');
    expect(container.querySelector('[data-record-detail-footer]')).not.toBeNull();
    expect(container.querySelector('[data-testid="household-record-policy"]')?.textContent).toBe('Visibility');
  });

  it('disables footer actions when requested', () => {
    const container = render(createElement(RecordDetailPresentation, {
      backLabel: 'Back',
      category: { icon: 'bill', name: 'Uncategorised' },
      footerActions: [{ disabled: true, label: 'Delete', onClick: () => undefined, testId: 'delete-record' }],
      onBack: () => undefined,
      rows: [{ label: 'Amount', value: '20.00' }],
    }));

    expect(container.querySelector<HTMLButtonElement>('[data-testid="delete-record"]')?.disabled).toBe(true);
  });

  it('copies designated detail values while leaving ordinary rows non-interactive', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    const container = render(createElement(RecordDetailPresentation, {
      amount: '20.00',
      backLabel: 'Back',
      category: { icon: 'bill', name: 'Uncategorised' },
      onBack: () => undefined,
      rows: [
        { copyValue: '2026-09-02 Tuesday', label: 'Date', value: '2026-09-02 Tuesday' },
        { label: 'Type', value: 'Expense' },
      ],
    }));

    const copyable = container.querySelectorAll<HTMLButtonElement>('[data-record-detail-copyable]');
    expect(copyable).toHaveLength(2);
    await act(async () => copyable[1]?.click());

    expect(writeText).toHaveBeenCalledWith('2026-09-02 Tuesday');
    expect(mocks.toastShow).toHaveBeenCalledWith(expect.objectContaining({ icon: 'success' }));
    expect(container.querySelector('[data-record-detail-row]:not(button)')?.textContent).toContain('Expense');
  });
});

function render(element: ReturnType<typeof createElement>) {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(createElement(MemoryRouter, null, element)));
  cleanup = () => act(() => root.unmount());
  return container;
}
