import type { FC } from 'react';
import { THEME_COLOR } from '@/assets/styles/reset';

export const ProgressBar: FC<{
  color?: string;
  percent: number;
}> = ({ color = THEME_COLOR, percent }) => {
  const clampedPercent = Number.isFinite(percent)
    ? Math.min(1, Math.max(0, percent))
    : 0;

  return (
    <div className="h-[5px] flex-grow">
      <div
        className="h-full rounded-full"
        style={{
          background: color,
          minWidth: 4,
          width: `${clampedPercent * 100}%`,
        }}
      />
    </div>
  );
};
