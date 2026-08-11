import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AssetManagerCard } from '@/entities/asset';
import { CurrentMonthBillCard } from '@/entities/bill';
import { CurMonthBudgetCard } from '@/entities/budget';
import { useGetUserUserInfoQuery } from '@/entities/user';
import { CommonFunctionCard } from '@/pages/discovery/ui';
import { useTranslation } from '@/shared/i18n';
import { playSound } from '@/shared/lib/play-sound';
import { TabBar } from '@/widgets/layout';

interface DiscoveryProps {
}

const Discovery: React.FC<DiscoveryProps> = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { data: userInfo } = useGetUserUserInfoQuery();
  const handleBillClick = () => {
    playSound.turnPage();
    navigate('/bill');
  };

  return (
    <div className="page-new fixed left-0 top-0 w-full">
      <header className="h-[60px] shrink-0 px-[22px] pb-4 pt-[max(8px,env(safe-area-inset-top))]">
        <h1 className="text-[20px] font-extrabold leading-[30px] text-ww-ink">{t('commonFunctions.discovery')}</h1>
      </header>
      <div className="relative flex-grow overflow-auto pb-5">
        <div className="space-y-[14px] px-[18px]">
          <CurrentMonthBillCard billRecord={userInfo?.billRecord} onClick={handleBillClick} />
          <CurMonthBudgetCard />
          <AssetManagerCard />
          <CommonFunctionCard />
        </div>
      </div>
      <TabBar active={3} />
    </div>
  );
};

export default Discovery;
