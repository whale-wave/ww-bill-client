import type { Meta, StoryObj } from '@storybook/react-vite';
import { CalendarDays, CreditCard, Settings2 } from 'lucide-react';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { AppButton } from './app-button';
import { AppModal, AppSheet, SheetHeader } from './app-overlay';
import { ActionField, FormField, SelectField } from './form-field';
import { IllustratedEmptyState } from './illustrated-empty-state';
import { PageLoadingState } from './page-loading-state';

const meta = {
  title: 'Shared/Forms and feedback',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function FormExample() {
  const [name, setName] = useState('鲸浪用户');
  const [category, setCategory] = useState('food');
  return (
    <main className="ww-story-page ww-story-stack">
      <FormField label="账本名称" onChange={setName} placeholder="输入账本名称" value={name} />
      <FormField errorMessage="密码至少需要 8 位" label="密码" placeholder="输入密码" type="password" value="secret" />
      <SelectField label="默认分类" onChange={setCategory} options={[{ label: '餐饮', value: 'food' }, { label: '交通', value: 'traffic' }]} value={category} />
      <ActionField label="结算日" onClick={() => undefined} value="每月 1 日" />
    </main>
  );
}

export const Fields: Story = {
  render: () => <FormExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'show password' }));
    await expect(canvas.getByRole('button', { name: 'hide password' })).toBeVisible();
    await userEvent.selectOptions(canvas.getByLabelText('默认分类'), 'traffic');
    await expect(canvas.getByLabelText('默认分类')).toHaveValue('traffic');
  },
};

function OverlayExample() {
  const [sheetVisible, setSheetVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <main className="ww-story-page ww-story-stack">
      <AppButton fullWidth onClick={() => setSheetVisible(true)}>打开底部操作</AppButton>
      <AppButton fullWidth variant="secondary" onClick={() => setModalVisible(true)}>打开确认弹窗</AppButton>
      <AppSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} onMaskClick={() => setSheetVisible(false)}>
        <div className="max-h-[60dvh] overflow-y-auto px-5 pb-8">
          <SheetHeader closeLabel="关闭" onClose={() => setSheetVisible(false)} title="选择操作" />
          <p className="py-8 text-ww-mid">长内容在 Sheet 内滚动，关闭后不保留状态。</p>
          <AppButton fullWidth onClick={() => setSheetVisible(false)}>完成</AppButton>
        </div>
      </AppSheet>
      <AppModal actions={[{ key: 'confirm', text: '确认', onClick: () => setModalVisible(false) }]} content="此操作仅在 Storybook 本地状态中执行。" title="确认操作" visible={modalVisible} onClose={() => setModalVisible(false)} />
    </main>
  );
}

export const Overlays: Story = {
  render: () => <OverlayExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '打开底部操作' }));
    await expect(within(document.body).getByText('选择操作')).toBeVisible();
  },
};

export const LoadingAndEmpty: Story = {
  render: () => (
    <main className="ww-story-page ww-story-stack">
      <PageLoadingState label="正在读取账本" />
      <IllustratedEmptyState actionLabel="新建记录" description="开始记录每一笔收支。" icon={<CreditCard size={38} />} onAction={() => undefined} title="还没有记录" />
      <IllustratedEmptyState icon={<CalendarDays size={30} />} title="暂无日程" variant="quiet" />
      <IllustratedEmptyState icon={<Settings2 size={30} />} title="设置为空" variant="quiet" />
    </main>
  ),
};
