import type { FC } from 'react';
import { IosProgressbar } from '@/shared/ui/ios-progressbar';

export const ProgressBar: FC<{
  color?: string;
  percent: number;
}> = ({ color, percent }) => <IosProgressbar className="h-full min-h-[5px] flex-grow" color={color} percent={percent} />;
