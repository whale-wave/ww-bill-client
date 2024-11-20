import { Button } from 'antd-mobile';
import type { FC } from 'react';
import { Icon } from '@/components';

export const AssetInfoCard: FC = () => {
  return (
    <div className="p-3 pt-0 z-[1]">
      <div className="flex flex-col relative bg-white py-3 px-4 rounded-lg space-y-5 shadow-md">
        <div className="text-sm text-gray-500">贷款</div>
        <div className="flex flex-col min-h-[48px]">
          <div className="text-2xl font-bold">49243234.00</div>
          <div className="text-xs text-gray-500">欠款</div>
        </div>
        <div className="absolute right-4 top-3 !mt-0">
          <Icon name="custom-assets" className="text-[28px]" />
        </div>
        <div className="absolute bottom-3 right-4">
          <Button shape="rounded" size="mini" color="primary">调整金额</Button>
        </div>
      </div>
    </div>
  );
};
