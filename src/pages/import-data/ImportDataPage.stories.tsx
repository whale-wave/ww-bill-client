import type { Meta, StoryObj } from '@storybook/react-vite';
import type { LedgerListItem } from '@/entities/ledger';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { LedgerCapability, ledgerKeys, LedgerKind, LedgerRole, LedgerStatus } from '@/entities/ledger';
import ImportDataPage from './ImportDataPage';

const ledgerId = '11111111-1111-4111-8111-111111111111';
const personalLedger: LedgerListItem = {
  id: ledgerId,
  ownerUserId: 1,
  createdByUserId: 1,
  name: '我的账本',
  kind: LedgerKind.SYSTEM_DEFAULT,
  iconKey: 'book',
  themeKey: 'blue',
  monthStartDay: 1,
  status: LedgerStatus.ACTIVE,
  version: 1,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  myRole: LedgerRole.OWNER,
  capabilities: [LedgerCapability.RECORD_CREATE],
  activeMemberCount: 1,
  recordCount: 91,
  myMembership: { id: 'member-1', version: 1, sortOrder: 0 },
};

function ImportFixture() {
  const [queryClient] = useState(() => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
    client.setQueryData(ledgerKeys.list(), { data: [personalLedger, { ...personalLedger, id: '33333333-3333-4333-8333-333333333333', name: '旅行账本', kind: LedgerKind.CUSTOM }] });
    return client;
  });
  return (
    <div className="h-dvh">
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/import-data?ledgerId=${ledgerId}`]}>
          <ImportDataPage />
        </MemoryRouter>
      </QueryClientProvider>
    </div>
  );
}

const meta = {
  title: 'Pages/Import/Choose source',
  component: ImportFixture,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ImportFixture>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ReadyToUpload: Story = {};
