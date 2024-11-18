import type { FC } from 'react';

export const AssetInfoCard: FC = () => {
  return (
    <div className="flex flex-col bg-primary rounded-lg">
      <div>
        净资产
      </div>
      <div className="text-2xl font-bold">0.00</div>
      <div className="flex flex-row">
        <div className="flex flex-1">
          <div>资产</div>
          <div>0.00</div>
        </div>
        <div className="flex flex-1">
          <div>负债</div>
          <div>0.00</div>
        </div>
      </div>
    </div>
  );
};
