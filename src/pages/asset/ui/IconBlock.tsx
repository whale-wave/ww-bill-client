import type { FC } from 'react';
import { Icon } from '@/shared/ui';

export const IconBlock: FC<{ name: string }> = ({ name }) => {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-[13px] border border-solid border-white/70 bg-[linear-gradient(145deg,#e2f6ff,#f4efff)] text-primary-deep shadow-ww-xs">
      <Icon className="text-[21px]" name={name} />
    </div>
  );
};
