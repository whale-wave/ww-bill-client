import React, { useMemo } from 'react';
import { AddOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import type { BottomActionActionItem } from '@/components';
import { BottomAction } from '@/components';

interface AddInvoiceButtonProps {
}

const AddInvoiceButton: React.FC<AddInvoiceButtonProps> = () => {
  const navigate = useNavigate();

  const actions = useMemo(() => {
    return [
      {
        key: 'add',
        render: () => {
          return (
            <>
              <AddOutline />
              <span>
                添加发票信息
              </span>
            </>
          );
        },
        onClick: () => {
          navigate('/invoice/create');
        },
      },
    ] as BottomActionActionItem[];
  }, []);

  return (
    <BottomAction className="h-[50px]" placeholderClassName="h-[50px]" actions={actions}></BottomAction>);
};

export default AddInvoiceButton;
