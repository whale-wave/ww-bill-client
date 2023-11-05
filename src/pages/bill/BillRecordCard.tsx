import { Card } from 'antd-mobile';

export const BillRecordCard = () => {
  return (
    <Card className={'bg-primary py-2 mb-2'} bodyClassName={'space-y-1 px-2'}>
      <div>年结余</div>
      <div className={'text-lg'}>44048.87</div>
      <div className={'flex'}>
        <div className={'w-[50%] space-x-1'}>
          <span>年收入</span>
          <span>66971.49</span>
        </div>
        <div className={'w-[50%] space-x-1'}>
          <span>年支出</span>
          <span>22922.62</span>
        </div>
      </div>
    </Card>
  );
};
