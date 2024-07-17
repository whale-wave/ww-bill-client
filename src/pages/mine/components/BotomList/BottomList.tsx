import { List } from 'antd-mobile';
import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditSOutline, ExclamationCircleOutline, SetOutline } from 'antd-mobile-icons';

interface BottomListProps {
}

const BottomList: React.FC<BottomListProps> = () => {
  const navigate = useNavigate();
  const list = useMemo(() => {
    return [
      {
        title: '设置',
        prefix: <div className="flex items-center text-[20px]"><SetOutline /></div>,
        onClick: () => {
          navigate('/settings');
        },
      },
      {
        title: '意见反馈',
        prefix: <div className="flex items-center text-[20px]"><EditSOutline /></div>,
      },
      {
        title: `关于鲸浪记账 v${import.meta.env.VITE_APP_VERSION}`,
        prefix: <div className="flex items-center text-[18px]"><ExclamationCircleOutline /></div>,
      },
    ];
  }, []);

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
