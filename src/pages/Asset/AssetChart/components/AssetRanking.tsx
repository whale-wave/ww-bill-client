import { List } from 'antd-mobile';
import { type FC, useMemo } from 'react';
import { clone } from 'lodash-es';
import classNames from 'classnames';
import { IconBlock } from '../../components';
import { ProgressBar } from './ProgressBar';
import styles from './AssetRanking.module.scss';
import { useGetAssetQuery } from '@/hooks';
import { formatAmount, math } from '@/utils';
import type { Asset } from '@/api';

export const AssetRanking: FC = () => {
  const { data } = useGetAssetQuery();

  const rankList = useMemo(() => {
    if (!data)
      return [];

    const addTypeList = data.filter(i => i.assetGroup.type === 'add').toSorted((a: Asset, b: Asset) => {
      return Number(math.subtract(b.amount, a.amount).toString());
    });
    const total = addTypeList.reduce((acc, cur) => math.add(acc, cur.amount).toNumber(), 0);
    const result = addTypeList.map((i) => {
      type AssetPercentItem = Asset & { percent: number; percentStr: string };
      const _i = clone(i) as AssetPercentItem;
      _i.percentStr = Number(math.multiply(math.divide(i.amount, total).toString(), 100).toString()).toFixed(1);
      _i.percent = Number(_i.percentStr) * 0.01;
      return _i;
    });
    return result;
  }, [data]);

  return (
    <div className={classNames(styles['asset-ranking'], 'py-3 border-0 border-t-[1px] border-t-gray-100 border-solid')}>
      <div className="text-base mb-2">资产排行榜</div>
      <List>
        {rankList.map(i => (
          <List.Item
            key={i.id}
            prefix={<IconBlock name={i.assetGroup.icon} />}
            description={(
              <div className="mt-1">
                {i.comment}
              </div>
            )}
          >
            <div>
              <div className="flex justify-between">
                <div className="flex space-x-2">
                  <div>
                    {i.name}
                  </div>
                  <div>
                    {i.percentStr}
                    %
                  </div>
                </div>
                <div>{formatAmount(Number(i.amount))}</div>
              </div>
              <div>
                <ProgressBar percent={i.percent} />
              </div>
            </div>
          </List.Item>
        ))}
      </List>
    </div>
  );
};
