import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import BottomAction from './BottomAction';
import type { BottomActionProps } from './BottomAction';

const meta = {
  title: 'Example/BottomAction-底部操作栏',
  component: BottomAction,
  parameters: {
  },
  tags: ['autodocs', 'ButtonAction'],
  argTypes: {
    actions: [{
      key: { control: 'text' },
      label: { control: 'text' },
    }],
    className: { control: 'text' },
    placeholderClassName: { control: 'text' },
  },
  args: { actions: [{ key: 'add', label: '添加' }, { key: 'delete', label: '删除' }], className: 'h-[50px]', placeholderClassName: 'h-[50px]' },
} satisfies Meta<BottomActionProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    actions: [{ key: 'add', label: '添加', onClick: fn() }, { key: 'delete', label: '删除', onClick: fn() }],
  },
};
