import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';

interface ChartDashboardSwitchProps<T extends string> {
  label: string;
  options: { label: ReactNode; value: T }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function ChartDashboardSwitch<T extends string>({ label, options, value, onChange, className }: ChartDashboardSwitchProps<T>) {
  return (
    <div aria-label={label} className={cn('relative isolate flex min-w-0 max-w-full items-center', className)} role="group">
      <span aria-hidden="true" data-chart-switch-track className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[var(--ww-component-chart-switch-visible-height)] -translate-y-1/2 rounded-[var(--ww-component-chart-switch-radius)] bg-[var(--ww-component-chart-switch-background)]" />
      {options.map(option => (
        <button
          aria-pressed={value === option.value}
          className="flex min-h-[var(--ww-component-button-hit-target-min)] min-w-[var(--ww-component-button-hit-target-min)] flex-1 items-center justify-center border-0 bg-transparent p-0 focus-visible:rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          <span
            data-chart-switch-option
            className={cn(
              'flex h-[var(--ww-component-chart-switch-visible-height)] w-full items-center justify-center whitespace-nowrap rounded-[var(--ww-component-chart-switch-active-radius)] px-[var(--ww-space-sm)] text-[length:var(--ww-component-button-font-size-compact)]',
              value === option.value ? 'bg-[var(--ww-component-chart-switch-active)] font-bold text-[color:var(--ww-component-chart-switch-active-foreground)]' : 'text-[color:var(--ww-component-chart-switch-inactive-foreground)]',
            )}
          >
            {option.label}
          </span>
        </button>
      ))}
    </div>
  );
}
