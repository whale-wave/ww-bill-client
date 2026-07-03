import type { FC } from 'react';
import { Card } from 'antd-mobile';
import { RightOutline } from 'antd-mobile-icons';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssetSummaryInfo } from '@/entities/asset';
import { ROUTES_PATH } from '@/shared/config/routes';

export const AssetManagerCard: FC = () => {
  const navigate = useNavigate();
  const { formatInfo } = useAssetSummaryInfo();

  const handleClick = useCallback(() => {
    navigate(ROUTES_PATH.ASSET.getPath());
  }, []);

  const data = [
    {
      title: '净资产',
      value: formatInfo.totalAsset,
    },
    {
      title: '资产',
      value: formatInfo.addAsset,
    },
    {
      title: '负债',
      value: formatInfo.subAsset,
    },
  ] as const;

  return (
    <Card
      title="资产管家"
      extra={
        <RightOutline />
      }
      bodyClassName="!pt-0"
      onClick={handleClick}
    >
      <div className="flex-grow flex pt-1 px-[12px]">
        {data.map(item => (
          <div className="flex-1 flex flex-col flex-shrink-0 space-y-1" key={item.title}>
            <div className="text-xs text-text-gray">{item.title}</div>
            <div className="text-[18px] text-text-black">{item.value}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};
