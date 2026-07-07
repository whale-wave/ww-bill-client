import type { BottomActionActionItem } from '@/shared/ui';
import { AddOutline } from 'antd-mobile-icons';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/shared/i18n';
import { BottomAction } from '@/shared/ui';

interface AddInvoiceButtonProps {
}

const AddInvoiceButton: React.FC<AddInvoiceButtonProps> = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('invoice');

  const actions = useMemo(() => {
    return [
      {
        key: 'add',
        render: () => {
          return (
            <>
              <AddOutline />
              <span>
                {t('addInvoiceInfo')}
              </span>
            </>
          );
        },
        onClick: () => {
          navigate('/invoice/create');
        },
      },
    ] as BottomActionActionItem[];
  }, [t]);

  return (
    <BottomAction className="h-[50px]" placeholderClassName="h-[50px]" actions={actions}></BottomAction>);
};

export default AddInvoiceButton;
