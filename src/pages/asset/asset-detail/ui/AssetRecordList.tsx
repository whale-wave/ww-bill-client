import type { FC } from 'react';
import type { AssetRecord } from '@/entities/asset';
import { DatePicker, Dialog, ErrorBlock, List } from 'antd-mobile';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetAssetRecordQuery } from '@/entities/asset';
import { Icon } from '@/shared/ui';

export const AssetRecordList: FC = () => {
  const params = useParams();
  const { id } = params as { id: string };

  const [selectMonth, setSelectMonth] = useState(dayjs());
  const startTime = useMemo(() => dayjs(selectMonth).startOf('month').valueOf(), [selectMonth]);
  const endTime = useMemo(() => dayjs(selectMonth).endOf('month').valueOf(), [selectMonth]);

  const { data: list } = useGetAssetRecordQuery({ params: {
    assetId: id,
    startTime,
    endTime,
  }, options: {
    enabled: !!id,
  } });
  const dayListGroup = useMemo(() => {
    if (!list)
      return [];

    const dayListMap = list.reduce((acc, cur) => {
      const day = dayjs(cur.createdAt).startOf('day').valueOf();
      acc[day] = acc[day] || [];
      acc[day].push(cur);
      return acc;
    }, {} as Record<string, AssetRecord[]>);

    const sortKeys = Object.keys(dayListMap).sort((a, b) => Number(b) - Number(a));
    // Start of Selection
    return sortKeys.map(key => ({
      date: dayjs(Number(key)).format('MM月DD日 dddd'),
      list: dayListMap[key],
    }));
  }, [list]);

  const handleSelectMonth = useCallback(() => {
    DatePicker.prompt({
      precision: 'month',
      defaultValue: selectMonth.toDate(),
      onConfirm: (val) => {
        setSelectMonth(dayjs(val));
      },
    });
  }, [selectMonth]);

  const handleClickRecord = useCallback((record: AssetRecord) => () => {
    Dialog.alert({
      title: record.name,
      content: record.comment,
    });
  }, []);

  return (
    <div className={classNames('mt-3')}>
      <div className="flex items-center justify-between px-3">
        <div className="text-base font-bold">收支明细</div>
        <div className="flex items-center text-xm space-x-1" onClick={handleSelectMonth}>
          <div>{selectMonth.format('YYYY年MM月')}</div>
          <Icon name="show-bottom" className="text-[10px]" />
        </div>
      </div>
      {
        dayListGroup.length > 0
          ? dayListGroup.map(({ date, list }) => (
              <List header={date} key={date}>
                {list.map(record => (
                  <List.Item key={record.id} onClick={handleClickRecord(record)} description={record.comment} prefix={<div className="text-[20px] rounded-full bg-gray-50 w-[40px] h-[40px] flex items-center justify-center"><Icon name="budget" /></div>} extra={`${record.type === 'sub' ? '-' : '+'}${record.amount}`}>
                    {record.name}
                  </List.Item>
                ))}
              </List>
            ))
          : <div className="mt-[100px]"><ErrorBlock status="empty" /></div>
      }
    </div>
  );
};
