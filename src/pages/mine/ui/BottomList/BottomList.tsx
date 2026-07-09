import type { FC } from 'react';
import { List, Toast } from 'antd-mobile';
import { Info, PencilLine, Settings } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/shared/i18n';
import pkg from '../../../../../package.json';

interface BottomListProps {
}

const iconClassName = 'text-black333';

const BottomList: FC<BottomListProps> = () => {
  const { t } = useTranslation('user');
  const navigate = useNavigate();
  const list = useMemo(() => {
    return [
      {
        title: t('bottomList.settings'),
        prefix: <Settings className={iconClassName} size={18} strokeWidth={1.8} />,
        onClick: () => {
          navigate('/settings');
        },
      },
      {
        title: t('bottomList.feedback'),
        prefix: <PencilLine className={iconClassName} size={18} strokeWidth={1.8} />,
        onClick: () => {
          Toast.show({
            content: t('tabs.comingSoon'),
          });
        },
      },
      {
        title: t('bottomList.about', { version: pkg.version }),
        prefix: <Info className={iconClassName} size={18} strokeWidth={1.8} />,
      },
    ];
  }, [navigate, t]);

  return (
    <List mode="card">
      {list.map(item => (
        <List.Item key={item.title} prefix={item.prefix} onClick={item.onClick}>{item.title}</List.Item>))}
    </List>
  );
};

export default BottomList;
