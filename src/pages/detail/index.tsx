import type { Dayjs } from 'dayjs';
import type { FC } from 'react';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import List from '@/pages/detail/List';
import Top from '@/pages/detail/Top';
import { TabBar } from '@/widgets/layout';

export type numType = [Array<string>, Array<string>];

const Detail: FC = () => {
  const [selectTime, setSelectTime] = useState<Dayjs>(dayjs());
  const [numExpendIncome, setNumExpendIncome] = useState<numType | []>([]);

  const topDateTime = (arr: numType) => {
    setNumExpendIncome(arr);
  };

  useEffect(() => {
    const timeDate = sessionStorage.getItem('timeDate');
    timeDate && setSelectTime(dayjs(timeDate));
  }, []);

  return (
    <div className="page">
      <Top numExpendIncome={numExpendIncome} selectTime={selectTime} setSelectTime={setSelectTime} />
      <List selectTime={selectTime} change={topDateTime} />
      <TabBar active={0} />
    </div>
  );
};

export default Detail;
