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
  it('keeps the default header, rows, share pin, and fixed action geometry while accepting household additions', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    const onBack = () => undefined;
    const onShare = () => undefined;
    const onPolicy = () => undefined;

    act(() => root.render(createElement(MemoryRouter, null, createElement(RecordDetailPresentation, {
      backLabel: 'Back',
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
    }))));
    cleanup = () => act(() => root.unmount());

    expect(container.querySelector('[data-record-detail-presentation]')).not.toBeNull();
    expect(container.querySelector('[data-category-icon="food"] use')?.getAttribute('xlink:href')).toBe('#icon-food');
    expect(container.textContent).toContain('Food');
    expect(container.textContent).toContain('Member');
    expect(container.textContent).toContain('Counted in household totals');
    expect(container.querySelector('.bwm-fixed-pin')?.textContent).toBe('Share');
    expect(container.querySelector('[data-record-detail-footer]')).not.toBeNull();
    expect(container.querySelector('[data-testid="household-record-policy"]')?.textContent).toBe('Visibility');
  });
});
