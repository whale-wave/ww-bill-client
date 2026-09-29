import type { Meta, StoryObj } from '@storybook/react-vite';
import { CircleDollarSign, WalletCards } from 'lucide-react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AppButton } from './app-button';
import { ContentStack, SectionStack } from './content-stack';
import { DesignIcon } from './design-icon';
import { DonutChart } from './donut-chart';
import { MetricGrid } from './metric-grid';
import { MoneyAmount } from './money-amount';
import { ProgressBar } from './progress-bar';
import { Surface } from './surface';
import { UserAvatar } from './user-avatar';

const meta = {
  title: 'Foundations/Core UI',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const MaterialsAndMetrics: Story = {
  render: () => (
    <main className="ww-story-page ww-story-stack">
      <Surface material="raised" className="p-5"><MoneyAmount className="text-3xl font-black" tone="expense" value={-4280.6} /></Surface>
      <Surface material="floating" className="p-5"><MetricGrid items={[{ key: 'income', label: '收入', value: '8,260.00', tone: 'income' }, { key: 'expense', label: '支出', value: '4,280.60', tone: 'expense' }, { key: 'surplus', label: '结余', value: '3,979.40', tone: 'primary' }]} /></Surface>
      <Surface material="content" className="p-5"><ProgressBar percent={68} /></Surface>
      <DonutChart
        amount="4,280.60"
        amountSize={20}
        label="本月支出"
        marker="storybook"
        chart={<div className="h-full rounded-full bg-[conic-gradient(var(--ww-pink-color)_0_68%,var(--ww-theme-color-light)_68%)]" />}
        legend={(
          <div className="space-y-2 text-sm text-ww-mid">
            <p>餐饮 68%</p>
            <p>交通 32%</p>
          </div>
        )}
      />
      <ContentStack>
        <UserAvatar name="鲸浪用户" size={48} />
        <DesignIcon name="discovery-bill" size={24} />
      </ContentStack>
      <SectionStack>
        <span>区块间距</span>
        <span>遵循 SectionStack 默认规则</span>
      </SectionStack>
    </main>
  ),
};

export const ButtonStates: Story = {
  render: () => (
    <main className="ww-story-page ww-story-stack">
      <AppButton fullWidth onClick={fn()}>保存账单</AppButton>
      <AppButton fullWidth variant="secondary">次要操作</AppButton>
      <AppButton fullWidth variant="danger">删除账单</AppButton>
      <AppButton fullWidth loading loadingLabel="正在保存">保存账单</AppButton>
      <AppButton fullWidth disabled>不可用操作</AppButton>
      <AppButton aria-label="钱包" size="compact"><WalletCards size={20} /></AppButton>
    </main>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '保存账单' }));
    await expect(canvas.getByRole('button', { name: '正在保存' })).toBeDisabled();
  },
};

export const EmptyAndAvatarFallback: Story = {
  render: () => (
    <main className="ww-story-page flex items-center justify-around">
      <UserAvatar name="鲸浪用户" size={64} />
      <UserAvatar name="" size={64} />
      <CircleDollarSign className="text-primary-deep" size={36} />
    </main>
  ),
};
