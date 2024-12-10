import { Modal } from 'antd-mobile';
import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useImmer } from 'use-immer';
import { useSocket } from '@/hooks';

const NotifyModal: FC = () => {
  const { connect, disconnect } = useSocket();

  const [curIndex] = useState(0);
  const [notifyList, setNotifyList] = useImmer<any[]>([
    {
      id: '3123123123',
      type: 'version',
      title: 'v0.1.21 版本新增特性',
      content: '1. 增加 资产管家 功能, 实现统一管理所有资产\n2. 增加 资产 图标, 清晰了解资产状态',
    },
    {
      id: '3123123',
      type: 'notice',
      title: '系统通知',
      image: 'https://img1.baidu.com/it/u=2693733305,4035903587&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=1200',
      content: '最近一直杂事较多, 一直没时间开发新功能~ 看看美女补偿一下',
    },
  ]);
  const curNotify = useMemo(() => {
    if (notifyList.length === 0 || curIndex >= notifyList.length)
      return;

    return notifyList[curIndex];
  }, [curIndex, notifyList]);

  const handleNext = useCallback(() => {
    setNotifyList((draft) => {
      draft.shift();
    });
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNotifyList((draft) => {
        const newNotify = {
          id: Date.now(),
          type: 'version',
          title: `v${Math.random().toFixed(2)} 版本新增特性`,
          content: '1. 增加 资产管家 功能, 实现统一管理所有资产\n2. 增加 资产 图标, 清晰了解资产状态',
        };
        draft.push(newNotify);
      });
    }, 3000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <Modal
      visible={!!curNotify}
      title={curNotify?.title}
      image={curNotify?.image}
      content={curNotify?.content}
      maskStyle={{ opacity: 0.4 }}
      closeOnMaskClick
      closeOnAction
      onClose={handleNext}
      actions={[
        {
          key: 'confirm',
          primary: true,
          text: '我知道了',
        },
      ]}
    />
  );
};

export default NotifyModal;
