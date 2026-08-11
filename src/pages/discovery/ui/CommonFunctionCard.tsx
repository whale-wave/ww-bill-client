import type { FC } from 'react';
import { Toast } from 'antd-mobile';
import { CalendarOutline, ReceivePaymentOutline, TextOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { ActionMenuCard, Icon } from '@/shared/ui';

const CommonFunctionCard: FC = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  return (
    <section>
      <h2 className="pb-[10px] text-[14px] font-bold leading-[21px] text-ww-ink">{t('commonFunctions.title')}</h2>
      <ActionMenuCard
        columns={4}
        items={[
          { icon: <Icon name="asset-steward" />, key: 'asset', label: t('commonFunctions.assetSteward'), onClick: () => navigate(ROUTES_PATH.ASSET.getPath()), tone: 'purple' },
          { icon: <TextOutline />, key: 'invoice', label: t('commonFunctions.invoiceAssistant'), onClick: () => navigate('/invoice'), tone: 'blue' },
          { icon: <ReceivePaymentOutline />, key: 'exchange', label: t('commonFunctions.exchangeRateConverter'), onClick: () => Toast.show({ content: t('commonFunctions.comingSoon') }), tone: 'pink' },
          { icon: <CalendarOutline />, key: 'fixed', label: t('commonFunctions.fixedExpenses'), onClick: () => navigate(ROUTES_PATH.FIXED_EXPENSES.getPath()), tone: 'green' },
        ]}
        variant="gradient-tiles"
      />
    </section>
  );
};

export default CommonFunctionCard;
