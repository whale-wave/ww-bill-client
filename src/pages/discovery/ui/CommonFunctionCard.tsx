import { useTranslation } from '@/shared/i18n';
import { Card, Toast } from 'antd-mobile';
import { CalendarOutline, ReceivePaymentOutline, TextOutline } from 'antd-mobile-icons';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/shared/config/routes';
import { Icon } from '@/shared/ui';

interface CommonFunctionCardProps {}

interface FunctionItem {
  name: string;
  icon: React.ReactNode;
  onClick?: () => void;
  path?: string;
}

const CommonFunctionCard: React.FC<CommonFunctionCardProps> = () => {
  const navigate = useNavigate();

  const functionList = [
    {
      name: '资产管家',
      icon: <Icon name="asset-steward" />,
      onClick: () => {
        navigate(ROUTES_PATH.ASSET.getPath());
      },
    },
    {
      name: '发票助手',
      icon: <TextOutline />,
      path: '/invoice',
    },
    {
      name: '固定支出',
      icon: <CalendarOutline />,
      onClick: () => {
        navigate(ROUTES_PATH.FIXED_EXPENSES.getPath());
      },
    },
    // {
    //   name: '房贷计算器',
    //   icon: 'invoice',
    //   path: '/invoice',
    // },
    {
      name: '汇率换算器',
      icon: <ReceivePaymentOutline />,
      onClick: () => {
        Toast.show({
          content: '敬请期待',
        });
      },
    },
  ] as FunctionItem[];

  const onFunctionItemClick = useCallback((functionItem: FunctionItem) => () => {
    if (functionItem.path)
      navigate(functionItem.path);
    functionItem.onClick?.();
  }, []);

  return (
    <Card title="常用功能" bodyClassName="!pt-0">
      <div className="flex-grow flex pt-1">
        {functionList.map(fnItem => (
          <div
            key={fnItem.name}
            className="flex flex-col justify-center items-center text-[12px] w-1/4 space-y-3"
            onClick={onFunctionItemClick(fnItem)}
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
