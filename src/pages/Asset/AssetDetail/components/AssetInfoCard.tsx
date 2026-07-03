import type { FC } from 'react';
import { Button } from 'antd-mobile';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Icon } from '@/components';
import { useGetAssetByIdQuery } from '@/hooks';
import { AssetAdjustPopup } from './AssetAdjustPopup';

export const AssetInfoCard: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data } = useGetAssetByIdQuery({ params: id! });
  const [adjustPopupVisible, setAdjustPopupVisible] = useState(false);
  const text = data?.assetGroup.type === 'sub' ? '欠款' : '余额';

  return (
    <>
      <div className="p-3 pt-0 z-[1]">
        <div className="flex flex-col relative bg-white py-3 px-4 rounded-lg space-y-2 shadow-md">
          <div className="min-h-[40px]">
            <div className="text-base text-[#333] font-bold">
              {data?.name}
              {data?.cardId ? `(${data?.cardId})` : ''}
            </div>
            <div className="text-xs text-gray-500">{data?.comment}</div>
          </div>
          <div className="flex flex-col min-h-[48px]">
            <div className="text-3xl font-bold">{data?.amount}</div>
            <div className="text-xs text-gray-500">{text}</div>
          </div>
          <div className="absolute right-4 top-3 !mt-0">
            <Icon name={data?.assetGroup.icon || ''} className="text-[28px]" />
          </div>
          <div className="absolute bottom-3 right-4">
            <Button
              shape="rounded"
              size="mini"
              color="primary"
              onClick={() => setAdjustPopupVisible(true)}
            >
              调整
              {text}
            </Button>
          </div>
        </div>
      </div>
      {data && (
        <AssetAdjustPopup
          visible={adjustPopupVisible}
          asset={data}
          onClose={() => setAdjustPopupVisible(false)}
          onMaskClick={() => setAdjustPopupVisible(false)}
        />
      )}
    </>
  );
};
