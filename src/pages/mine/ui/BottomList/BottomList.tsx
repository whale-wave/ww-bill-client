import type { FC } from 'react';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { SettingsListCard } from '@/shared/ui';
import pkg from '../../../../../package.json';

const BottomList: FC = () => {
  const { t } = useTranslation('user');
  const navigate = useNavigate();
  const location = useLocation();
  const items = useMemo(() => [
    { key: 'ledgers', label: t('ledger:center.title'), onClick: () => navigate(ROUTES_PATH.LEDGERS.getPath()) },
    { key: 'household', label: t('household:common.title'), onClick: () => navigate(ROUTES_PATH.HOUSEHOLD.getPath()) },
    { key: 'settings', label: t('bottomList.settings'), onClick: () => navigate('/settings') },
    { key: 'feedback', label: t('bottomList.feedback'), onClick: () => navigate(ROUTES_PATH.FEEDBACK.getPath(), { state: { from: location.pathname } }) },
    { key: 'about', label: t('bottomList.about', { version: pkg.version }), showArrow: false },
  ], [location.pathname, navigate, t]);

  return <SettingsListCard density="compact" items={items} />;
};

export default BottomList;
