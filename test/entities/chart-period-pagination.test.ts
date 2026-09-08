import type { ChartPeriodOptionsPage } from '@/entities/chart';
import type { SuccessResponse } from '@/shared/api';
import { describe, expect, it } from 'vitest';
import { flattenChartPeriodOptions } from '@/entities/chart';

describe('chart period pagination', () => {
  it('deduplicates adjacent pages and exposes period options oldest first', () => {
    const response = (current: number, data: Array<{ anchorDate: string; key: string }>) => ({
      data: {
        current,
        data: data.map(item => ({ ...item, month: Number(item.key.slice(5)), period: 'month' as const, year: Number(item.key.slice(0, 4)) })),
        pageSize: 2,
        total: 3,
      },
      message: 'ok',
      statusCode: 200 as const,
    }) satisfies SuccessResponse<ChartPeriodOptionsPage>;

    expect(flattenChartPeriodOptions([
      response(1, [
        { anchorDate: '2026-03-01', key: '2026-03' },
        { anchorDate: '2026-02-01', key: '2026-02' },
      ]),
      response(2, [
        { anchorDate: '2026-02-01', key: '2026-02' },
        { anchorDate: '2026-01-01', key: '2026-01' },
      ]),
    ]).map(option => option.key)).toEqual(['2026-01', '2026-02', '2026-03']);
  });
});
