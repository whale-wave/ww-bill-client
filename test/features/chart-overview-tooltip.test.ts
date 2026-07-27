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
    }
    finally {
      vi.unstubAllEnvs();
    }
  });
});
