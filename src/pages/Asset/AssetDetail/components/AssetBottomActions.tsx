import type { FC } from 'react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from 'antd-mobile';
import type { BottomActionActionItem } from '@/components';
import { ROUTES_PATH } from '@/constants';
import { BottomAction } from '@/components';

export const AssetBottomActions: FC = () => {
  const navigate = useNavigate();

  const actions = useMemo(() => {
    return [
      // {
      //   key: 'transfer',
      //   render: () => { return '转账'; },
      //   onClick: () => { },
      // },
      {
        key: 'setting',
        render: () => {
          return '设置';
        },
        onClick: () => {
          navigate(ROUTES_PATH.ASSET_ADD_FORM.getPath());
        },
      },
      {
        key: 'delete',
        render: () => {
          return '删除资产';
        },
        onClick: () => {
          Dialog.confirm({
            title: '确认删除该资产?',
            content: '删除后, 所有的资产变动记录也将一同被删除',
            confirmText: '确认删除',
            onConfirm: () => {
              setTimeout(() => {
                navigate(-1);
              }, 250);
            },
          });
        },
      },
    ] as BottomActionActionItem[];
  }, []);
  return (
    <div>
      <BottomAction className="h-[50px]" placeholderClassName="h-[50px]" actions={actions}></BottomAction>
    </div>
  );
};
