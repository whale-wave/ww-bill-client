import type { FC } from 'react';
import { CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { ActionMenuCard, DesignIcon } from '@/shared/ui';

const CommonFunctionCard: FC = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  return (
    <section>
      <h2 className="pb-[10px] text-[14px] font-bold leading-[21px] text-ww-ink">{t('commonFunctions.title')}</h2>
      <ActionMenuCard
        columns={3}
        items={[
          { icon: <DesignIcon name="action-asset" size={22} />, key: 'asset', label: t('commonFunctions.assetSteward'), onClick: () => navigate(ROUTES_PATH.ASSET.getPath()), tone: 'purple' },
          { icon: <DesignIcon name="action-invoice" size={22} />, key: 'invoice', label: t('commonFunctions.invoiceAssistant'), onClick: () => navigate('/invoice'), tone: 'blue' },
          { icon: <CalendarDays size={22} strokeWidth={1.8} />, key: 'fixed', label: t('commonFunctions.fixedExpenses'), onClick: () => navigate(ROUTES_PATH.FIXED_EXPENSES.getPath()), tone: 'green' },
        ]}
        variant="gradient-tiles"
      />
    </section>
  );
};

export default CommonFunctionCard;
