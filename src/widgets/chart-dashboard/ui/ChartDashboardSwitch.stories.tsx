import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Surface } from '@/shared/ui';
import { ChartDashboardSwitch } from './ChartDashboardSwitch';

const meta = { title: 'Widgets/Chart dashboard/Compact switches', parameters: { layout: 'fullscreen' } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function ControlsPreview({ width }: { width: string }) {
  const [period, setPeriod] = useState('month');
  const [metric, setMetric] = useState('expense');
  const [asset, setAsset] = useState('netAsset');
  return (
    <section className={`${width} max-w-full bg-canvas px-[var(--ww-space-lg)] py-[var(--ww-space-sm)] text-ww-ink`} data-compact-chart-preview>
      <ChartDashboardSwitch label="统计期间" options={['周', '月', '年', '全部', '范围'].map((label, index) => ({ label, value: ['week', 'month', 'year', 'all', 'custom'][index] }))} value={period} onChange={setPeriod} />
      <Surface className="mt-[var(--ww-space-sm)] p-[var(--ww-space-lg)]" material="content">
        <div className="flex flex-wrap items-center justify-between gap-[var(--ww-space-sm)]">
          <h2 className="shrink-0 font-bold">趋势</h2>
          <ChartDashboardSwitch label="趋势指标" options={[{ label: '支出', value: 'expense' }, { label: '收入', value: 'income' }, { label: '结余', value: 'net' }]} value={metric} onChange={setMetric} />
        </div>
      </Surface>
      <Surface className="mt-[var(--ww-space-sm)] p-[var(--ww-space-lg)]" material="content">
        <div className="flex flex-wrap items-center justify-between gap-[var(--ww-space-sm)]">
          <h2 className="shrink-0 font-bold">资产</h2>
          <ChartDashboardSwitch label="资产指标" options={[{ label: '净资产', value: 'netAsset' }, { label: '总资产', value: 'asset' }, { label: '负债', value: 'liability' }]} value={asset} onChange={setAsset} />
        </div>
        <p className="text-xs text-ww-soft">2026-09-01 — 2026-09-28</p>
      </Surface>
    </section>
  );
}

export const SmallScreens: Story = {
  render: () => <div className="grid gap-[var(--ww-space-lg)]">{['w-[320px]', 'w-[375px]', 'w-[390px]', 'w-[430px]'].map(width => <ControlsPreview key={width} width={width} />)}</div>,
  play: async ({ canvasElement }) => {
    for (const preview of canvasElement.querySelectorAll<HTMLElement>('[data-compact-chart-preview]')) {
      if (preview.scrollWidth > preview.clientWidth)
        throw new Error(`Chart controls overflow the ${preview.clientWidth}px screen`);
      for (const button of preview.querySelectorAll<HTMLButtonElement>('button')) {
        const target = button.getBoundingClientRect();
        const surface = button.querySelector('span')!.getBoundingClientRect();
        if (target.height < 44 || target.width < 44)
          throw new Error('Compact chart switch lost its minimum touch target');
        if (surface.height > 32)
          throw new Error('Compact chart switch visual surface grew beyond its token');
        const bounds = preview.getBoundingClientRect();
        if (target.left < bounds.left || target.right > bounds.right)
          throw new Error('Chart switch exceeds its mobile screen');
      }
    }
  },
};
