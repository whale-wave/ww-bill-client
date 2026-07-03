import type { FC } from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetRecordBillQuery } from '@/entities/record';
import { BillRecordCard } from '@/pages/Bill/BillRecordCard';
import { BillTabs } from '@/pages/Bill/BillTabs';
import Content from '@/pages/Bill/components/Content';
import { useBillPageStore } from '@/pages/Bill/store';
import { Button } from '@/shared/ui';

const Bill: FC = () => {
  const navigate = useNavigate();

  const selectDate = useBillPageStore(({ selectDate }) => selectDate);
  const isMonthTabType = useBillPageStore(({ getIsMonthTabType }) => getIsMonthTabType());

  const onBack = () => {
    navigate(-1);
  };

  const params = useMemo(() => {
    if (isMonthTabType)
      return { type: 'year' as const, year: dayjs(selectDate).year() };
    return { type: 'all' as const };
  }, [selectDate, isMonthTabType]);

  const { data } = useGetRecordBillQuery({
    params,
  });

  const list = useMemo(() => {
    if (!data?.list)
      return [];

    return Object.keys(data.list)
      .sort((a, b) => +b - +a)
      .map(m => ({
        month: `${m}${isMonthTabType ? '月' : '年'}`,
        income: data.list[m].income,
        expand: data.list[m].expand,
        balance: data.list[m].balance,
      }));
  }, [data]);

  return (
    <div className="page">
      <div className="flex-grow flex flex-col overflow-hidden">
        <BillTabs />
        <div className="overflow-auto px-3 ">
          <BillRecordCard data={data?.all} />
          <Content data={list} />
        </div>
      </div>
      <div className={classNames('flex-shrink-0')}>
        <Button size="full" onClick={onBack}>
          返回
        </Button>
      </div>
    </div>
  );
};

export default Bill;
