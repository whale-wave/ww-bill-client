import type { Meta, StoryObj } from '@storybook/react-vite';
import type { SharkImportPreview, SharkImportRow } from '@/entities/record-import';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SharkImportPreviewPage from './SharkImportPreviewPage';

const ledgerId = '11111111-1111-4111-8111-111111111111';
const batchId = '22222222-2222-4222-8222-222222222222';

const rows: SharkImportRow[] = [
  { sourceRow: 2, include: true, date: '2026-09-19', type: 'sub', categoryName: '餐饮', categoryId: 1, sourceAccount: '未关联', amount: '28.50', remark: '中午饭', tagNames: ['大茶壶'], assetId: null, assetMode: 'NONE', issues: [], warnings: [] },
  { sourceRow: 3, include: true, date: '2026-09-19', type: 'sub', categoryName: '交通', categoryId: null, sourceAccount: '中信银行(5608)-信用卡', amount: '18.00', remark: '回家打车', tagNames: [], assetId: null, assetMode: 'UNRESOLVED', issues: [{ field: 'assetId', message: '请选择资产账户或明确选择不关联' }], warnings: [] },
  { sourceRow: 4, include: true, date: '2026-09-18', type: 'add', categoryName: '工资', categoryId: 2, sourceAccount: '未关联', amount: '12,800.00', remark: '九月工资', tagNames: [], assetId: null, assetMode: 'NONE', issues: [], warnings: [] },
  { sourceRow: 5, include: false, date: '2026-09-17', type: 'sub', categoryName: '购物', categoryId: 3, sourceAccount: '未关联', amount: '89.00', remark: '日用品', tagNames: [], assetId: null, assetMode: 'NONE', issues: [], warnings: ['本文件的这一行已导入'] },
];

const preview: SharkImportPreview = {
  id: batchId,
  revision: 1,
  status: 'DRAFT',
  expiresAt: '2026-09-22T00:00:00.000Z',
  assetLinkAllowed: true,
  rows,
  assets: [{ id: '33333333-3333-4333-8333-333333333333', name: '中信银行', cardId: '622200005608', groupName: '信用卡' }],
  summary: { included: 3, income: '12800', expense: '46.50', newCategories: 1, newTags: 1, problems: 1, linked: 0, posted: 0, linkOnly: 0 },
  result: null,
};

const otherLedgerPreview: SharkImportPreview = {
  ...preview,
  assetLinkAllowed: false,
  assets: [],
  rows: rows.map(row => ({
    ...row,
    assetId: null,
    assetMode: 'NONE',
    issues: row.issues.filter(issue => issue.field !== 'assetId'),
  })),
  summary: { ...preview.summary, problems: 0 },
};

function PreviewFixture({ data }: { data: SharkImportPreview }) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
    client.setQueryData(['record-import', 'shark', ledgerId, batchId], data);
    return client;
  });
  return (
    <div className="h-dvh">
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/import-data/shark/${batchId}?ledgerId=${ledgerId}`]}>
          <Routes>
            <Route element={<SharkImportPreviewPage />} path="/import-data/shark/:batchId" />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </div>
  );
}

const meta = {
  title: 'Pages/Import/Shark preview',
  component: PreviewFixture,
  args: { data: preview },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PreviewFixture>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NeedsReview: Story = {};
export const OtherLedger: Story = { args: { data: otherLedgerPreview } };
