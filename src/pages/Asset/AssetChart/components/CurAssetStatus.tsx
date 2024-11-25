import { Pie } from '@ant-design/charts';
import type { FC } from 'react';

export const CurAssetStatus: FC = () => {
  const config = {
    data: [
      { type: '分类一', value: 27 },
      { type: '分类二', value: 25 },
    ],
    angleField: 'value',
    colorField: 'type',
    innerRadius: 0.6,
    label: false,
    tooltip: false,
    annotations: [
      {
        type: 'text',
        style: {
          text: '总资产',
          x: '50%',
          y: '50%',
          textAlign: 'center',
          fontSize: 20,
          fontStyle: 'bold',
        },
      },
    ],
  };

  return (
    <div>
      <div>当前资产状况</div>
      <Pie
        {...config}
        autoFit
        legend={{
          color: {
            position: 'bottom',
          },
        }}
      />
    </div>
  );
};
