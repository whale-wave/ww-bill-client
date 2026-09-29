import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Ledger, LedgerTemplate } from './ledger';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AssetSummaryCardPresentation } from './asset';
import { CurrentMonthBillCard } from './bill';
import { BudgetEntityLevel, BudgetEntityType } from './budget';
import BudgetItem from './budget/ui/BudgetItem';
import { CurrentBudgetSummaryCardPresentation } from './budget/ui/CurMonthBudgetCard';
import { LedgerCard } from './ledger/ui/LedgerCard';
import { LedgerTemplateCard } from './ledger/ui/LedgerTemplateCard';
import { RecordOverviewPresentation } from './record/ui/RecordOverviewPresentation';
import { UserSummaryCard } from './user';

const meta = {
  title: 'Entities/Presentations',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const ledger: Ledger = {
  id: 'ledger-storybook',
  ownerUserId: 1,
  createdByUserId: 1,
  name: '与家人共享的九月日常账本',
  kind: 'CUSTOM' as Ledger['kind'],
  templateKey: 'custom',
  iconKey: 'ledger',
  themeKey: 'glass',
  monthStartDay: 1,
  status: 'ACTIVE' as Ledger['status'],
  version: 1,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  myRole: 'OWNER' as Ledger['myRole'],
  capabilities: [],
};

const template: LedgerTemplate = {
  key: 'custom',
  version: 1,
  name: '自定义账本',
  description: '适合记录家庭、旅行和个人的日常收支。',
  iconKey: 'ledger',
  themeKey: 'glass',
  defaultName: '我的账本',
  categoryProfileKey: 'default',
};

export const SummaryCards: Story = {
  render: () => (
    <main className="ww-story-page ww-story-stack">
      <AssetSummaryCardPresentation asset="168260.26" liability="40520.80" netAsset="127739.46" title="资产管理" />
      <CurrentMonthBillCard billRecord={{ month: 9, income: 8260, expend: 4280.6, surplus: 3979.4 }} />
      <CurrentBudgetSummaryCardPresentation data={{ id: 'month', amount: '4280.60', budgetAmount: '6000.00', remaining: '1719.40', remainingPercentage: '28.66' }} title="9 月预算" />
      <CurrentBudgetSummaryCardPresentation data={{ id: 'over', amount: '7200.00', budgetAmount: '6000.00', remaining: '-1200.00', remainingPercentage: '0' }} title="超支预算" />
      <UserSummaryCard checkIn name="鲸浪用户" numberInfo={{ checkInAll: 108, checkInKeep: 7, recordCount: 1280 }} onProfileClick={() => undefined} />
    </main>
  ),
};

export const BudgetAndLedger: Story = {
  render: () => (
    <main className="ww-story-page ww-story-stack">
      <BudgetItem budgetEntityType={BudgetEntityType.MONTH} data={{ id: 'budget', title: '本月总预算', amount: '4280.60', budgetAmount: '6000.00', remaining: '1719.40', remainingPercentage: '28.66' }} type={BudgetEntityLevel.SUMMARY} />
      <LedgerCard kindLabel="自定义账本" ledger={ledger} roleLabel="创建者" statusLabel="正常" templateLabel="自定义" themeLabel="玻璃鲸浪" onClick={() => undefined} />
      <LedgerTemplateCard description={template.description} name={template.name} template={template} themeLabel="玻璃鲸浪" onClick={() => undefined} />
    </main>
  ),
};

export const RecordStates: Story = {
  render: () => (
    <main className="ww-story-page !p-0">
      <RecordOverviewPresentation
        emptyActionLabel="新建记录"
        emptyDescription="今天还没有收支记录"
        emptyTitle="暂无记录"
        groups={[]}
        header={{
          metrics: [{ key: 'income', label: '收入', value: '¥ 280.00' }, { key: 'expense', label: '支出', value: '¥ 86.00' }],
          period: { label: '本月', value: <strong className="text-xl">¥ 194.00</strong> },
          renderTitle: className => <h1 className={className}>九月账单</h1>,
          shortcuts: [],
        }}
        onEmptyAction={fn()}
        state="ready"
      />
    </main>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '新建记录' }));
    await expect(canvas.getByRole('button', { name: '新建记录' })).toBeVisible();
  },
};
