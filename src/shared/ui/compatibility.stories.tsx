import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import Button from './button';
import Comment from './comment';
import FixedPin from './fixed-pin';
import Gap from './gap';
import Icon from './icon';
import Input from './input';
import List from './list';
import { ListItem } from './list/list-item';
import Mask from './mask';
import NavBar from './nav-bar';
import Share from './share';
import { TabList } from './tab-list';
import WwButton from './ww-button/ww-button';

const meta = {
  title: 'Compatibility/Legacy UI',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function LegacyControls() {
  const [selected, setSelected] = useState('month');
  const [shareVisible, setShareVisible] = useState(false);
  return (
    <main className="ww-story-page ww-story-stack">
      <p className="text-sm text-ww-mid">兼容组件保留给既有页面；新页面优先使用 Shared 目录中的组件。</p>
      <Button onClick={() => undefined}>旧版按钮</Button>
      <WwButton onClick={() => undefined}>旧版主操作</WwButton>
      <Input label="旧版输入框" placeholder="输入内容" />
      <TabList onChange={setSelected} selectValue={selected} tabs={[{ name: '本月', value: 'month' }, { name: '本年', value: 'year' }]} />
      <List mode="card"><ListItem arrow clickable extra="已开启" prefix={<Icon name="setting" />}>旧版列表项</ListItem></List>
      <Comment data={{ commentCount: 8, isLike: false, likeCount: 12, shareCount: 4 }} />
      <Button onClick={() => setShareVisible(true)}>打开旧版分享</Button>
      <Share shares={[{ id: 1, name: '微信', color: '#65c466' }, { id: 2, name: '复制链接', color: '#6fc2dc' }]} visible={shareVisible} onClose={() => setShareVisible(false)} />
      <Mask color="black" opacity="thin" visible={false} />
      <Gap height={8} />
      <FixedPin onClick={() => undefined}>固定操作</FixedPin>
    </main>
  );
}

export const ExistingComponents: Story = {
  render: () => (
    <MemoryRouter>
      <NavBar back="返回">兼容组件</NavBar>
      <LegacyControls />
    </MemoryRouter>
  ),
};
