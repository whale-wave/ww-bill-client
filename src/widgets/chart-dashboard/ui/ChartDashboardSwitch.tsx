import type { ReactNode } from 'react';
import { DashboardSwitchVisual } from '@ww-bill/bill-ui';

interface ChartDashboardSwitchProps<T extends string> {
  label: string;
  options: { label: ReactNode; value: T }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function ChartDashboardSwitch<T extends string>({ label, options, value, onChange, className }: ChartDashboardSwitchProps<T>) {
  return <DashboardSwitchVisual label={label} options={options} value={value} onChange={onChange} className={className} />;
}
