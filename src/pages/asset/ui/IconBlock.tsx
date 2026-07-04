import type { FC } from 'react';
import { Icon } from '@/shared/ui';

export const IconBlock: FC<{ name: string }> = ({ name }) => {
  return <div className="flex justify-center items-center bg-gray-100 rounded-md w-[40px] h-[40px]"><Icon className="text-2xl" name={name} /></div>;
};
