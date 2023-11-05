import Content from '@/pages/bill/components/Content';
import { useBillQuery } from '@/service/record';
import { Button } from 'bw-mobile';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { BillTabs } from '@/pages/bill/BillTabs';
import { BillRecordCard } from '@/pages/bill/BillRecordCard';

const Bill = () => {
  const [selectDate, setSelectDate] = useState(new Date());
  const { data, isLoading, isSuccess } = useBillQuery(dayjs(selectDate).year());
  const navigate = useNavigate();

  function onBack() {
    navigate(-1);
  }

  function getList(data: any) {
    return Object.keys(data)
      .sort((a, b) => +b - +a)
      .map((m) => ({
        month: `${m}月`,
        income: data[m].income,
        expand: data[m].expand,
        balance: data[m].balance,
      }));
  }

  if (isLoading) {
    return <div>loading</div>;
  }

  if (!isSuccess) {
    return <div>loading fail</div>;
  }
  return (
    <div className="page">
      <div className={'px-3 flex-grow'}>
        <BillTabs date={selectDate} setDate={setSelectDate} />
        <BillRecordCard />
        <Content data={getList(data?.data.month)} />
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
