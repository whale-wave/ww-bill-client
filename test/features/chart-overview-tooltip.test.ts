import type { ChartOverviewPoint } from '@/features/chart-overview';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { TooltipContent } from '@/features/chart-overview';

describe('chart overview aggregate tooltip', () => {
  it('keeps a calendar date stable in a negative UTC offset timezone', () => {
    vi.stubEnv('TZ', 'America/Los_Angeles');

    try {
      const point: ChartOverviewPoint = {
        amount: '20.00',
        data: [],
        tooltipMode: 'aggregate',
        value: '2026-07-21',
      };
      const tooltip = renderToStaticMarkup(createElement(TooltipContent, {
        currentAmountType: 'sub',
        data: point,
      }));

      expect(tooltip).toContain('26/07/21');
      expect(tooltip).not.toContain('26/07/20');
      expect(tooltip).toContain('data-chart-tooltip="aggregate"');
      expect(tooltip).toContain('rounded-[18px]');
      expect(tooltip).toContain('bg-ww-surface');
      expect(tooltip).not.toContain('bg-[#4e4c4d]');
    }
    finally {
      vi.unstubAllEnvs();
    }
  });

  it('renders transaction rows as a unified glass card', () => {
    const point: ChartOverviewPoint = {
      amount: '28.50',
      data: [{
        amount: '28.50',
        category: {
          createdAt: '',
          icon: 'food',
          id: 1,
          name: 'Dining',
          updatedAt: '',
        },
        createdAt: '',
        id: 7,
        remark: 'Lunch',
        time: '2026-07-21T12:00:00.000Z',
        type: 'sub',
        updatedAt: '',
        version: 1,
      }],
      displayLabel: 'July 21',
      value: '2026-07-21',
    };
    const tooltip = renderToStaticMarkup(createElement(TooltipContent, {
      currentAmountType: 'sub',
      data: point,
    }));

    expect(tooltip).toContain('data-chart-tooltip="transactions"');
    expect(tooltip).toContain('Lunch');
    expect(tooltip).toContain('lucide-cooking-pot');
    expect(tooltip).toContain('¥');
  });
});
