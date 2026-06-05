import type { BottomActionActionItem } from '@/components';
import { AddOutline } from 'antd-mobile-icons';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomAction } from '@/components';
import { ROUTES_PATH } from '@/constants/route';

const AddFixedExpenseButton: React.FC = () => {
  const navigate = useNavigate();

  const actions = useMemo(() => {
    return [
      {
        key: 'add',
        render: () => (
          <div className="flex items-center space-x-1 font-medium" style={{ color: '#3a87c4' }}>
            <AddOutline />
            <span>添加固定支出</span>
          </div>
        ),
        onClick: () => {
          navigate(ROUTES_PATH.FIXED_EXPENSES_CREATE.getPath());
        },
      },
    ] as BottomActionActionItem[];
  }, [navigate]);

  return (
    <BottomAction className="h-[50px]" placeholderClassName="h-[50px]" actions={actions} />
  );
};

export default AddFixedExpenseButton;
