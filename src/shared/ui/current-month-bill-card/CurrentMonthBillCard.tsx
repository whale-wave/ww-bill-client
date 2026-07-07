import { Card } from 'antd-mobile';
import { RightOutline } from 'antd-mobile-icons';
import classNames from 'classnames';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { playSound } from '@/shared/lib/play-sound';
import { spliceNumberByPoint, zeroFill } from '@/shared/lib/time';
import { useTranslation } from '@/shared/i18n';

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
  const { t } = useTranslation(['bill', 'common']);

  const mapList = [
    {
      name: t('bill:monthCard.income'),
      leftValue: spliceNumberByPoint(billRecord?.income)[0],
      rightValue: spliceNumberByPoint(billRecord?.income)[1],
    },
    {
      name: t('bill:monthCard.expend'),
      leftValue: spliceNumberByPoint(billRecord?.expend)[0],
      rightValue: spliceNumberByPoint(billRecord?.expend)[1],
    },
    {
      name: t('bill:monthCard.surplus'),
      leftValue: spliceNumberByPoint(billRecord?.surplus)[0],
      rightValue: spliceNumberByPoint(billRecord?.surplus)[1],
    },
  ];

  const goTo = (path?: string) => {
    playSound.turnPage();
    path && navigate(path);
  };

  return (
    <Card title={t('bill:monthCard.title')} extra={<RightOutline />} onClick={() => goTo('/bill')} bodyClassName="!pt-0">
      <div className="px-[12px] pt-[4px] flex-grow flex">
        <div className={classNames('flex-shrink-0 relative w-[61px] mr-[18px] text-[26px] flex items-center')}>
          <div>
            {zeroFill(billRecord?.month)}
            <span className="text-[14px]">{t('common:dateTime.monthSuffix')}</span>
          </div>
          <div className="absolute right-0 bottom-1/2 w-[1px] h-[22px] bg-[#959595]" style={{ transform: 'translateY(50%)' }} />
        </div>
        <div className={classNames('flex flex-grow')}>
          {
            mapList.map(i => (
              <div className="grow w-1/3 space-y-2" key={i.name}>
                <div className={classNames('text-[12px]')}>{i.name}</div>
                <div className={classNames('text-[16px] one-line')}>
                  {i.leftValue}
                  .
                  {i.rightValue}
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </Card>
  );
};

export default CurrentMonthBillCard;
