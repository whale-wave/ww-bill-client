import React from 'react';
import { ReceivePaymentOutline, TextOutline } from 'antd-mobile-icons';
import { Card } from 'antd-mobile';
import { Icon } from '@/components';

interface CommonFunctionCardProps {}

const CommonFunctionCard: React.FC<CommonFunctionCardProps> = () => {
  const functionList = [
    {
      name: '资产管家',
      icon: <Icon name="asset-steward" />,
      path: '/assets',
    },
    {
      name: '发票助手',
      icon: <TextOutline />,
      // path: '/invoice',
    },
    // {
    //   name: '房贷计算器',
    //   icon: 'invoice',
    //   path: '/invoice',
    // },
    {
      name: '汇率换算器',
      icon: <ReceivePaymentOutline />,
      // path: '/invoice',
    },
  ];

  return (
    <Card title="常用功能" bodyClassName="!pt-0">
      <div className="flex-grow flex pt-1">
        {functionList.map(fnItem => (
          <div
            key={fnItem.name}
            className="flex flex-col justify-center items-center text-[12px] w-1/4 space-y-3"
          >
            <div className="rounded-full w-[42px] h-[42px] bg-[#f6f6f6] flex justify-center items-center text-[24px]">
              {fnItem.icon}
            </div>
            <span>{fnItem.name}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default CommonFunctionCard;
