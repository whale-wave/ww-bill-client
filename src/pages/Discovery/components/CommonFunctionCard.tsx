import React from 'react';
import { Icon } from '@/components';

interface CommonFunctionCardProps {
}

const CommonFunctionCard: React.FC<CommonFunctionCardProps> = () => {
  const functionList = [
    {
      name: '资产管家',
      icon: 'assets',
      path: '/assets',
    },
    {
      name: '发票助手',
      icon: 'invoice',
      path: '/invoice',
    },
  ];

  return (
    <div className="card-rounded bg-[#fff]">
      {functionList.map(fnItem => (
        <div key={fnItem.name}>
          <Icon name={fnItem.icon} />
          <span>{fnItem.name}</span>
        </div>
      ))}
    </div>
  );
};

export default CommonFunctionCard;
