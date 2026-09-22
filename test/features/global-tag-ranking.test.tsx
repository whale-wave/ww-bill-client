import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GlobalTagRanking } from '@/features/chart-overview/ui/GlobalTagRanking';

const queries = vi.hoisted(() => ({
  personal: vi.fn(),
  ledger: vi.fn(),
  household: vi.fn(),
}));

vi.mock('@/entities/chart', () => ({
  useTagRankingQuery: queries.personal,
  useLedgerTagRankingQuery: queries.ledger,
}));
vi.mock('@/entities/household', () => ({ useHouseholdTagRankingQuery: queries.household }));
vi.mock('@/features/chart-overview/ui/TagRankingSection', () => ({ TagRankingSection: () => null }));

beforeEach(() => {
  for (const query of Object.values(queries)) {
    query.mockReset();
    query.mockReturnValue({ data: undefined, isLoading: false, isError: false });
  }
});

afterEach(() => document.body.replaceChildren());

describe('global tag ranking request boundaries', () => {
  it.each(['personal', 'ledger', 'household'] as const)('excludes injected component props from %s request parameters', (scope) => {
    const element = GlobalTagRanking({
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      type: 'sub',
      ...(scope === 'ledger' ? { ledgerId: 'ledger-1' } : {}),
      ...(scope === 'household' ? { householdId: 'household-1' } : {}),
    });
    if (!element)
      throw new Error('Expected a scoped ranking component');
    // Locator adds attributes to the child component JSX in development builds.
    const injectedProps = { 'data-locatorjs-id': '/src/example.tsx::1', 'aria-label': 'debug' };
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    try {
      act(() => root.render(createElement(element.type, { ...element.props, ...injectedProps })));
      const filters = {
        type: 'sub',
        startDate: '2026-09-01T00:00:00+08:00',
        endDate: '2026-09-30T16:00:00.000Z',
      };
      const expected = scope === 'personal'
        ? { params: filters }
        : scope === 'ledger'
          ? { params: { ledgerId: 'ledger-1', filters } }
          : { params: { householdId: 'household-1', filters: {
              startDate: filters.startDate,
              endDate: '2026-09-30T23:59:59+08:00',
              metric: 'expense',
            } } };
      expect(queries[scope]).toHaveBeenCalledWith(expected);
      for (const otherScope of ['personal', 'ledger', 'household'] as const) {
        if (otherScope !== scope)
          expect(queries[otherScope]).not.toHaveBeenCalled();
      }
    }
    finally {
      act(() => root.unmount());
    }
  });
});
