import type { FC } from 'react';
import { Toast } from 'antd-mobile';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { SettingsListCard } from '@/shared/ui';
import pkg from '../../../../../package.json';

const BottomList: FC = () => {
  const { t } = useTranslation('user');
  const navigate = useNavigate();
  const items = useMemo(() => [
    { key: 'ledgers', label: t('ledger:center.title'), onClick: () => navigate(ROUTES_PATH.LEDGERS.getPath()) },
    { key: 'household', label: t('household:common.title'), onClick: () => navigate(ROUTES_PATH.HOUSEHOLD.getPath()) },
    { key: 'settings', label: t('bottomList.settings'), onClick: () => navigate('/settings') },
    { key: 'feedback', label: t('bottomList.feedback'), onClick: () => Toast.show({ content: t('tabs.comingSoon') }) },
    { key: 'about', label: t('bottomList.about', { version: pkg.version }), showArrow: false },
  ], [navigate, t]);

  return <SettingsListCard density="compact" items={items} />;
};

export default BottomList;
