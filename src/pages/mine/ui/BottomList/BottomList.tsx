import { List, Toast } from 'antd-mobile';
import { EditSOutline, ExclamationCircleOutline, SetOutline } from 'antd-mobile-icons';
import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/shared/i18n';
import pkg from '../../../../../package.json';

interface BottomListProps {
}

const BottomList: React.FC<BottomListProps> = () => {
  const { t } = useTranslation('user');
  const navigate = useNavigate();
  const list = useMemo(() => {
    return [
      {
        title: t('bottomList.settings'),
        prefix: <div className="flex items-center text-xl"><SetOutline /></div>,
        onClick: () => {
          navigate('/settings');
        },
      },
      {
        title: t('bottomList.feedback'),
        prefix: <div className="flex items-center text-xl"><EditSOutline /></div>,
        onClick: () => {
          Toast.show({
            content: t('tabs.comingSoon'),
          });
        },
      },
      {
        title: t('bottomList.about', { version: pkg.version }),
        prefix: <div className="flex items-center text-lg"><ExclamationCircleOutline /></div>,
      },
    ];
  }, [t]);

  useEffect(() => {
  }, []);

  return (
    <List mode="card">
      {list.map(item => (
        <List.Item key={item.title} prefix={item.prefix} onClick={item.onClick}>{item.title}</List.Item>))}
    </List>
  );
};

export default BottomList;
