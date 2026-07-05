import type { BottomActionActionItem } from '@/shared/ui';
import { AddOutline } from 'antd-mobile-icons';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { BottomAction } from '@/shared/ui';

const AddFixedExpenseButton: React.FC = () => {
  const { t } = useTranslation('fixed-expense');
  const navigate = useNavigate();

  const actions = useMemo(() => {
    return [
      {
        key: 'add',
        render: () => (
          <div className="flex items-center space-x-1 font-medium" style={{ color: '#3a87c4' }}>
            <AddOutline />
            <span>{t('list.addFixedExpense')}</span>
          </div>
        ),
        onClick: () => {
          navigate(ROUTES_PATH.FIXED_EXPENSES_CREATE.getPath());
        },
      },
    ] as BottomActionActionItem[];
  }, [navigate, t]);

  return (
    <BottomAction className="h-[50px]" placeholderClassName="h-[50px]" actions={actions} />
  );
};

export default AddFixedExpenseButton;
