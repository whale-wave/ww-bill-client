import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { NavBar } from '@/shared/ui';
import { AssetBottomActions, AssetInfoCard, AssetRecordList } from './ui';

const AssetDetail: FC = () => {
  const { t } = useTranslation('asset');
  const navigate = useNavigate();
  return (
    <div className="page bg-primary overflow-auto">
      <NavBar className="z-10" back={t('back')} onBack={() => navigate(-1)}>{t('detail.title') }</NavBar>
      <div className="fixed bottom-0 left-0 right-0 h-[70vh] bg-white"></div>
      <div className="flex-grow mt-[52px] bg-white z-[2] relative">
        <div className="absolute top-0 left-1/2 bg-primary rounded-bl-[20%] rounded-br-[20%] h-[60px] w-[100vw]" style={{ transform: 'translateX(-50%)' }}></div>
        <AssetInfoCard />
        <AssetRecordList />
      </div>
      <AssetBottomActions />
    </div>
  );
};

export default AssetDetail;
