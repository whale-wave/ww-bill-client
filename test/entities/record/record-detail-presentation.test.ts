import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { RecordDetailPresentation } from '@/entities/record';

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
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
});

function render(element: ReturnType<typeof createElement>) {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(createElement(MemoryRouter, null, element)));
  cleanup = () => act(() => root.unmount());
  return container;
}
