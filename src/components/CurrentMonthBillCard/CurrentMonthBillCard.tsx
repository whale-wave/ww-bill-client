import React from 'react';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components';
import { playSound } from '@/modules';
import { spliceNumberByPoint, zeroFill } from '@/utils/time';

interface CurrentMonthBillCardProps {
  billRecord?: {
    month: number;
    income: number;
    expend: number;
    surplus: number;
  };
}

const CurrentMonthBillCard: React.FC<CurrentMonthBillCardProps> = ({ billRecord }) => {
  const navigate = useNavigate();

  const goTo = (path?: string) => {
    playSound.turnPage();
    path && navigate(path);
  };

  return (
    <div className={classNames('flex flex-col h-[106px] pt-[12px] px-[16px] pb-[10px] bg-[#fff] rounded-[5px]')}>
      <div
        className={classNames('flex items-center font-bold justify-between text-[17px] text-[#333233]')}
      >
        账单
        <Icon name="right" style={{ fontSize: 12 }} />
      </div>
      <div
        className={classNames('flex grow items-end')}
        onClick={() => goTo('/bill')}
      >
        <div className={classNames('flex-shrink-0 relative w-[61px] mr-[18px] text-[26px]')}>
          {zeroFill(billRecord?.month)}
          <span className="text-[14px]">月</span>
          <div className="absolute right-0 bottom-0 w-[1px] h-[22px] bg-[#959595]" style={{ transform: 'translateY(-50%)' }} />
        </div>
        <div className={classNames('flex flex-grow')}>
          <div className="grow w-1/3">
            <div className={classNames('text-[12px]')}>收入</div>
            <div className={classNames('text-[16px] one-line')}>
              {spliceNumberByPoint(billRecord?.income)[0]}
              .
              {spliceNumberByPoint(billRecord?.income)[1]}
            </div>
          </div>
          <div className="grow w-1/3">
            <div className={classNames('text-[12px]')}>支出</div>
            <div className={classNames('text-[16px] one-line')}>
              {spliceNumberByPoint(billRecord?.expend)[0]}
              .
              {spliceNumberByPoint(billRecord?.expend)[1]}
            </div>
          </div>
          <div className="grow w-1/3">
            <div className={classNames('text-[12px]')}>结余</div>
            <div className={classNames('text-[16px] one-line')}>
              {spliceNumberByPoint(billRecord?.surplus)[0]}
              .
              {spliceNumberByPoint(billRecord?.surplus)[1]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentMonthBillCard;
