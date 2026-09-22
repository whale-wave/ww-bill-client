import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { UserNotificationStatus, UserNotificationType } from './types';
import { NotificationDetailModal } from './ui/NotificationDetailModal';

const meta = {
  title: 'Entities/Notification',
  component: NotificationDetailModal,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof NotificationDetailModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const announcement = {
  content: [
    '# 智能预算提醒正式上线',
    '',
    '为了帮助你更轻松地管理日常支出，鲸浪记账现已上线 **智能预算提醒** 功能。',
    '',
    '## 功能亮点',
    '',
    '- **预算进度实时掌握**',
    '',
    '  随时查看本月预算使用情况，了解剩余额度。',
    '',
    '- **关键节点主动提醒**',
    '',
    '  当预算使用达到设定比例时，系统会及时提醒，避免不知不觉超支。',
    '',
    '- **分类预算更清晰**',
    '',
    '  可针对餐饮、交通、购物等分类分别设置预算，让消费计划更加具体。',
    '',
    '## 如何使用',
    '',
    '1. 进入 **账本**',
    '2. 打开 **预算管理**',
    '3. 设置总预算或分类预算',
    '4. 保存后即可查看预算进度和提醒',
  ].join('\n'),
  createdAt: '2026-09-22T02:23:00.000Z',
  id: 'notification-story',
  payload: {},
  status: UserNotificationStatus.UNREAD,
  title: '新功能上线｜智能预算提醒，让每一笔支出更有计划',
  type: UserNotificationType.SYSTEM_ANNOUNCEMENT,
  updatedAt: '2026-09-22T02:23:00.000Z',
  version: 1,
};

export const RichAnnouncement: Story = {
  args: {
    notification: announcement,
    onClose: () => undefined,
    timeLabel: '刚刚',
    typeLabel: '系统公告',
  },
  render: args => (
    <main className="min-h-dvh bg-[var(--ww-page-gradient)] p-[var(--ww-space-xl)]">
      <div className="mx-auto mt-24 h-72 max-w-sm rounded-[var(--ww-radius-card)] bg-white/70 shadow-ww" />
      <NotificationDetailModal {...args} />
    </main>
  ),
  play: async () => {
    const screen = within(document.body);
    await expect(screen.getByRole('heading', { name: announcement.title })).toBeVisible();
    await expect(screen.getByRole('button', { name: '确认' })).toBeVisible();
  },
};
