import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CategoryEntity } from '@/entities/category';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { categoryKeys } from '@/entities/category';
import { CategoryManagement } from './category-management';
import { RecordEditorPresentation, useRecordEditorController } from './record-editor';

const ledgerId = 'classification-preview';
const categories: CategoryEntity[] = [
  { id: 1, name: '餐饮', icon: 'catering' },
  { id: 2, name: '交通', icon: 'traffic' },
  { id: 3, name: '日用', icon: 'shopping' },
  { id: 11, name: '三餐', icon: 'catering', parentId: 1 },
  { id: 12, name: '水果', icon: 'catering', parentId: 1 },
  { id: 13, name: '外出大餐', icon: 'catering', parentId: 1 },
  { id: 21, name: '打车', icon: 'traffic', parentId: 2 },
  { id: 22, name: '公共交通', icon: 'traffic', parentId: 2 },
].map((item, index) => ({ ...item, createdAt: '', updatedAt: '', ledgerId, isCustom: true, iconType: 'BUILTIN', sortOrder: index, status: 'ACTIVE', type: 'sub', version: 1 }));

const meta = { title: 'Features/Classification', parameters: { layout: 'fullscreen' } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function CategoryPreview() {
  const [client] = useState(() => {
    const cache = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } });
    for (const type of ['sub', 'add'] as const)
      cache.setQueryData(categoryKeys.ledgerList(ledgerId, { status: 'ALL', type }), { statusCode: 200, data: { data: type === 'sub' ? categories : [], total: type === 'sub' ? categories.length : 0 } });
    cache.setQueryData(categoryKeys.catalog(), { statusCode: 200, data: [] });
    return cache;
  });
  return <QueryClientProvider client={client}><main className="mx-auto max-w-[390px] p-4"><CategoryManagement ledgerId={ledgerId} canManage={false} /></main></QueryClientProvider>;
}
function MultiTagPreview() {
  const controller = useRecordEditorController({ seed: { amount: '100', category: categories[3], recordType: 'sub', time: '2026-09-22T12:00:00+08:00', tagIds: ['trip', 'old'], isTagPickerVisible: true }, isEditing: true, supportsTags: true, onSubmit: async () => undefined });
  return <RecordEditorPresentation categories={categories} categoryState="ready" controller={controller} onCancel={() => undefined} tags={[{ id: 'trip', name: '出差' }, { id: 'refund', name: '可报销' }, { id: 'weekend', name: '周末' }, { id: 'old', name: '去年旅行', status: 'ARCHIVED' }]} />;
}
export const Hierarchy: Story = { render: () => <CategoryPreview /> };
export const MultipleTags: Story = { render: () => <MultiTagPreview /> };
