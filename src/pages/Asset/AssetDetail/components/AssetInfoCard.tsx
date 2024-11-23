import { Button } from 'antd-mobile';
import type { FC } from 'react';
import { useParams } from 'react-router-dom';
import { Icon } from '@/components';
import { useGetAssetByIdQuery } from '@/hooks';

export const AssetInfoCard: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data } = useGetAssetByIdQuery({ params: id! });

  return (
    <div className="p-3 pt-0 z-[1]">
      <div className="flex flex-col relative bg-white py-3 px-4 rounded-lg space-y-2 shadow-md">
        <div className="min-h-[40px]">
          <div className="text-base text-[#333] font-bold">{data?.name}</div>
          <div className="text-xs text-gray-500">{data?.comment}</div>
        </div>
        <div className="flex flex-col min-h-[48px]">
          <div className="text-3xl font-bold">{data?.amount}</div>
          <div className="text-xs text-gray-500">余额</div>
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
