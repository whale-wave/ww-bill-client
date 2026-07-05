import { useTranslation } from '@/shared/i18n';
import type { FC } from 'react';
import type { BottomActionActionItem } from '@/shared/ui';
import { Dialog, Toast } from 'antd-mobile';
import { DeleteOutline, SetOutline } from 'antd-mobile-icons';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDeleteAssetByIdMutation } from '@/entities/asset';
import { isSuccessApi } from '@/shared/api';
import { ROUTES_PATH } from '@/shared/config/routes';
import { BottomAction } from '@/shared/ui';

export const AssetBottomActions: FC = () => {
  const navigate = useNavigate();
  const { id: _id } = useParams<{ id: string }>();
  const id = _id!;

  const [deleteAssetByIdMutate] = useDeleteAssetByIdMutation();

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
          return (
            <div className="flex items-center space-x-1">
              <SetOutline className="text-lg" />
              <div>设置</div>
            </div>
          );
        },
        onClick: () => {
          navigate(ROUTES_PATH.ASSET_ADD_FORM.getPath(id));
        },
      },
      {
        key: 'delete',
        render: () => {
          return (
            <div className="flex items-center space-x-1">
              <DeleteOutline className="text-lg" />
              <div>删除资产</div>
            </div>
          );
        },
        onClick: () => {
          Dialog.confirm({
            title: '确认删除该资产?',
            content: '删除后, 所有的资产变动记录也将一同被删除',
            confirmText: '确认删除',
            onConfirm: async () => {
              try {
                Toast.show({
                  icon: 'loading',
                  content: '删除中...',
                  duration: 0,
                });
                const res = await deleteAssetByIdMutate(id);
                if (isSuccessApi(res)) {
                  setTimeout(() => {
                    navigate(-1);
                  }, 250);
                }
              }
              finally {
                Toast.clear();
              }
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
