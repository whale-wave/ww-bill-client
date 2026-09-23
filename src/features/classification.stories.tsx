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
  { id: 14, name: '蔬菜', icon: 'catering', parentId: 1 },
  { id: 15, name: '牛奶', icon: 'catering', parentId: 1 },
  { id: 16, name: '夜宵', icon: 'catering', parentId: 1 },
  { id: 21, name: '打车', icon: 'traffic', parentId: 2 },
  { id: 22, name: '公共交通', icon: 'traffic', parentId: 2 },
].map((item, index) => ({ ...item, createdAt: '', updatedAt: '', ledgerId, isCustom: true, iconType: 'BUILTIN', sortOrder: index, status: 'ACTIVE', type: 'sub', version: 1 }));

const meta = { title: 'Features/Classification', parameters: { layout: 'fullscreen' } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function CategoryPreview({ canManage = false }: { canManage?: boolean }) {
  const [client] = useState(() => {
    const cache = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } });
    for (const type of ['sub', 'add'] as const)
      cache.setQueryData(categoryKeys.ledgerList(ledgerId, { status: 'ALL', type }), { statusCode: 200, data: { data: type === 'sub' ? categories : [], total: type === 'sub' ? categories.length : 0 } });
    cache.setQueryData(categoryKeys.catalog(), { statusCode: 200, data: [] });
    return cache;
  });
  return <QueryClientProvider client={client}><main className="mx-auto max-w-[390px] p-4"><CategoryManagement ledgerId={ledgerId} canManage={canManage} /></main></QueryClientProvider>;
}
function MultiTagPreview() {
  const controller = useRecordEditorController({ seed: { amount: '100', category: categories[3], recordType: 'sub', time: '2026-09-22T12:00:00+08:00', tagIds: ['trip', 'old'], isTagPickerVisible: true }, isEditing: true, supportsTags: true, onSubmit: async () => undefined });
  return <div className="h-dvh"><RecordEditorPresentation categories={categories} categoryState="ready" controller={controller} onCancel={() => undefined} tags={[{ id: 'trip', name: '出差' }, { id: 'refund', name: '可报销' }, { id: 'weekend', name: '周末' }, { id: 'old', name: '去年旅行', status: 'ARCHIVED' }]} /></div>;
}
function RecordEditorPreview({ items = categories, selectedCategory, withDetails = false }: { items?: CategoryEntity[]; selectedCategory?: CategoryEntity; withDetails?: boolean }) {
  const controller = useRecordEditorController({
    seed: {
      amount: withDetails ? '38.50' : undefined,
      category: selectedCategory,
      location: withDetails ? { accuracy: 15, latitude: 31.23, longitude: 121.47, name: '南京西路', capturedAt: '2026-09-22T12:00:00+08:00' } : undefined,
      recordType: 'sub',
      remark: withDetails ? '下午茶' : undefined,
      tagIds: withDetails ? ['weekend'] : undefined,
      time: '2026-09-22T12:00:00+08:00',
    },
    supportsTags: true,
    onSubmit: async () => undefined,
  });
  return <div className="h-dvh"><RecordEditorPresentation assetAccounts={[]} categories={items} categoryState="ready" controller={controller} onCancel={() => undefined} onManageCategories={() => undefined} tags={[{ id: 'weekend', name: '周末' }]} /></div>;
}
export const Hierarchy: Story = { render: () => <CategoryPreview /> };
export const EditableHierarchy: Story = { render: () => <CategoryPreview canManage /> };
export const SingleScreenHierarchy: Story = { render: () => <RecordEditorPreview /> };
export const ExpandedSubcategories: Story = {
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLButtonElement>('[data-record-editor-category="1"]')?.click();
  },
  render: () => <RecordEditorPreview />,
};
export const SelectedSubcategory: Story = { render: () => <RecordEditorPreview selectedCategory={categories[3]} /> };
export const CompactDetails: Story = { render: () => <RecordEditorPreview selectedCategory={categories[3]} withDetails /> };
export const LeafCategories: Story = { render: () => <RecordEditorPreview items={categories.filter(category => !category.parentId).slice(0, 3)} /> };
export const MultipleTags: Story = { render: () => <MultiTagPreview /> };
