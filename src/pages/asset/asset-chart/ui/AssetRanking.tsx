import type { FC } from 'react';
import type { Asset } from '@/entities/asset';
import { ErrorBlock, List } from 'antd-mobile';
import classNames from 'classnames';
import { clone } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssetStatisticalRecordType, useGetAssetQuery } from '@/entities/asset';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { formatAmount, math } from '@/shared/lib';
import { IconBlock } from '../../ui';
import styles from './AssetRanking.module.scss';
import { ProgressBar } from './ProgressBar';

type AssetPercentItem = Asset & { percent: number; percentStr: string };

export const AssetRanking: FC<{ type: AssetStatisticalRecordType }> = ({ type }) => {
  const { t } = useTranslation('asset');
  const { data } = useGetAssetQuery();
  const navigate = useNavigate();

  const rankList = useMemo(() => {
    if (!data)
      return [];

    let filterType = 'add';
    switch (type) {
      case AssetStatisticalRecordType.ASSET:
        filterType = 'add';
        break;
      case AssetStatisticalRecordType.LIABILITY:
        filterType = 'sub';
        break;
    }

    const addTypeList = data.filter(i => i.assetGroup.type === filterType).toSorted((a: Asset, b: Asset) => {
      return Number(math.subtract(b.amount, a.amount).toString());
    });
    const total = addTypeList.reduce((acc, cur) => math.add(acc, cur.amount).toNumber(), 0);
    const result = addTypeList.map((i) => {
      const _i = clone(i) as AssetPercentItem;
      _i.percentStr = Number(math.multiply(math.divide(i.amount, total).toString(), 100).toString()).toFixed(1);
      _i.percent = Number(_i.percentStr) * 0.01;
      return _i;
    });
    return result;
  }, [data]);

  const handleClickItem = useCallback((item: AssetPercentItem) => () => {
    navigate(ROUTES_PATH.ASSET_DETAIL.getPath(item.id));
  }, [navigate]);

  return (
    <div className={classNames(styles['asset-ranking'], 'pt-3 pb-8 border-0 border-t-[1px] border-t-gray-100 border-solid')}>
      <div className="text-base mb-2">{type === AssetStatisticalRecordType.ASSET ? t('chart.assetRanking') : t('chart.liabilityRanking')}</div>
      <List>
        {rankList.length > 0
          ? rankList.map(i => (
              <List.Item
                key={i.id}
                arrow={false}
                prefix={<IconBlock name={i.assetGroup.icon} />}
                description={(
                  <div className="mt-1">
                    {i.comment}
                  </div>
                )}
                onClick={handleClickItem(i)}
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
            ))
          : <div><ErrorBlock status="empty" title={t('common:empty')} description="" /></div>}
      </List>
    </div>
  );
};
