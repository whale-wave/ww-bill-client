import type { Meta, StoryObj } from '@storybook/react-vite';
import { CheckCircle2 } from 'lucide-react';
import { LedgerJoinRequestStatus } from '../entities/ledger';
import { TagRankingSection } from './chart-overview/ui/TagRankingSection';
import { HouseholdPageState } from './household/ui/HouseholdPageState';
import { HouseholdSummaryCard } from './household/ui/HouseholdSummaryCard';
import { CollaborationQueryState, CollaborationStatusBadge } from './ledger-collaboration/ui';

const meta = {
  title: 'Features/Presentation states',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const HouseholdAndCollaboration: Story = {
  render: () => (
    <main className="ww-story-page ww-story-stack">
      <HouseholdSummaryCard expenseLabel="支出" incomeLabel="收入" netLabel="结余" summary={{ income: '8260.00', expense: '4280.60', net: '3979.40' }} />
      <HouseholdPageState errorDescription="暂时无法加载家庭账本。" errorTitle="加载失败" isError={false} isLoading={false} loadingLabel="正在加载" retryLabel="重试"><div className="rounded-ww bg-white p-4 text-ww-ink">家庭账本内容</div></HouseholdPageState>
      <CollaborationQueryState description="尚未收到成员申请。" title="暂无协作请求" type="empty" />
      <div className="flex items-center gap-2">
        <CollaborationStatusBadge label="待处理" status={LedgerJoinRequestStatus.PENDING} />
        <CollaborationStatusBadge label="已通过" status={LedgerJoinRequestStatus.APPROVED} />
        <CheckCircle2 className="text-finance-income" size={18} />
      </div>
    </main>
  ),
};

export const ChartStates: Story = {
  render: () => (
    <main className="ww-story-page ww-story-stack">
      <TagRankingSection isLoading />
      <TagRankingSection data={{ totalAmount: '1280.20', items: [{ key: 'food', tagId: 'food', name: '餐饮', amount: '800.20', percentage: 62.5 }, { key: 'travel', tagId: 'travel', name: '出行', amount: '480.00', percentage: 37.5 }] }} />
      <TagRankingSection isError />
    </main>
  ),
};
