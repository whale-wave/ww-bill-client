import type { RecordEntry } from '@/entities/record';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RecordAdjustmentSection } from '@/features/record-adjustment';

const mutation = vi.hoisted(() => ({ run: vi.fn() }));

vi.mock('@/entities/record/hooks', () => ({
  useCreateRecordAdjustmentMutation: () => [mutation.run, { isLoading: false }],
  useDeleteRecordAdjustmentMutation: () => [mutation.run, { isLoading: false }],
  useUpdateRecordAdjustmentMutation: () => [mutation.run, { isLoading: false }],
}));

vi.mock('@/shared/i18n', () => ({
  i18n: { t: (key: string) => key },
  useTranslation: () => ({ t: (key: string) => key }),
}));

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  mutation.run.mockReset();
});

function render(
  record: Pick<RecordEntry, 'adjustments' | 'adjustmentSummary' | 'amount' | 'id' | 'linkedAsset' | 'originalAmount'>,
  canManage = false,
  supportsAssetLink = false,
) {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(createElement(RecordAdjustmentSection, {
    canManage,
    record,
    supportsAssetLink,
  })));
  cleanup = () => act(() => root.unmount());
  return container;
}

describe('record adjustment detail section', () => {
  it('shows the original-to-net summary and every linked adjustment in read-only mode', () => {
    const container = render({
      adjustmentSummary: {
        adjustedAmount: '80.00',
        cashbackAmount: '0.00',
        count: 2,
        originalAmount: '100.00',
        refundAmount: '25.00',
        supplementAmount: '5.00',
      },
      adjustments: [
        {
          adjustedAmount: '80.00',
          amount: '5.00',
          createdAt: '2026-09-08T10:00:00.000Z',
          createdBy: { id: 7 },
          id: 'adjustment-2',
          occurredAt: '2026-09-08T10:00:00.000Z',
          originalAmount: '100.00',
          recordId: 9,
          recordVersion: 4,
          remark: '补差价',
          type: 'supplement',
          updatedAt: '2026-09-08T10:00:00.000Z',
          version: 1,
        },
        {
          adjustedAmount: '80.00',
          amount: '25.00',
          createdAt: '2026-09-07T10:00:00.000Z',
          createdBy: { id: 7 },
          id: 'adjustment-1',
          occurredAt: '2026-09-07T10:00:00.000Z',
          originalAmount: '100.00',
          recordId: 9,
          recordVersion: 4,
          remark: '部分退款',
          type: 'refund',
          updatedAt: '2026-09-07T10:00:00.000Z',
          version: 2,
        },
      ],
      amount: '80.00',
      id: 9,
      originalAmount: '100.00',
    });

    expect(container.querySelector('[data-record-adjustments]')?.textContent).toContain('100.00');
    expect(container.querySelector('[data-record-adjustments]')?.textContent).toContain('80.00');
    expect(container.textContent).toContain('部分退款');
    expect(container.textContent).toContain('补差价');
    expect(container.textContent).not.toContain('adjustment.add');
    expect(container.querySelectorAll<HTMLButtonElement>('[data-record-adjustments] > div:last-of-type button')).toHaveLength(2);
    const adjustmentButtons = container.querySelectorAll<HTMLButtonElement>('[data-record-adjustments] > div:last-of-type button');
    expect(Array.from(adjustmentButtons).every(button => !button.disabled)).toBe(true);

    act(() => adjustmentButtons[0].click());
    expect(document.body.textContent).toContain('adjustment.detail');
    expect(document.body.querySelector<HTMLTextAreaElement>('#record-adjustment-remark')?.value).toBe('补差价');
  });

  it('offers adding an adjustment only when the viewer can manage the record', () => {
    const container = render({ amount: '100.00', id: 9 }, true);

    expect(container.textContent).toContain('adjustment.add');
  });

  it('omits linkedAssetId so the service can inherit the original record asset', async () => {
    const container = render({ amount: '100.00', id: 9 }, true, true);
    const addButton = Array.from(container.querySelectorAll('button'))
      .find(button => button.textContent?.includes('adjustment.add'));
    act(() => addButton?.click());
    const input = document.body.querySelector<HTMLInputElement>('#record-adjustment-amount');
    expect(input).not.toBeNull();

    act(() => {
      if (input) {
        const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        setValue?.call(input, '20.00');
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    const saveButton = Array.from(document.body.querySelectorAll('button'))
      .find(button => button.textContent?.includes('adjustment.save'));
    await act(async () => saveButton?.click());

    expect(mutation.run).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.not.objectContaining({ linkedAssetId: expect.anything() }),
      recordId: '9',
    }));
  });
});
