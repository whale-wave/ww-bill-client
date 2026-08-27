import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLedgerTagsQuery } from '@/entities/ledger-data/hooks';

const queryMocks = vi.hoisted(() => ({
  options: [] as Array<{ enabled?: boolean }>,
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const original = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...original,
    useQuery: (options: { enabled?: boolean }) => {
      queryMocks.options.push(options);
      return { data: undefined };
    },
  };
});

describe('category-scoped ledger tag query', () => {
  beforeEach(() => {
    queryMocks.options.length = 0;
  });

  it('does not request tags before a record category is selected', () => {
    useLedgerTagsQuery({
      params: { ledgerId: 'ledger-a' },
      queryOptions: { enabled: true },
    });

    expect(queryMocks.options).toEqual([
      expect.objectContaining({ enabled: false }),
    ]);
  });

  it('requests tags after a valid category is selected', () => {
    useLedgerTagsQuery({
      params: { categoryId: 12, ledgerId: 'ledger-a' },
      queryOptions: { enabled: true },
    });

    expect(queryMocks.options).toEqual([
      expect.objectContaining({ enabled: true }),
    ]);
  });
});
