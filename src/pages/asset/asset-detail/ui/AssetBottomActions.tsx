import type { FC } from 'react';
import type { BottomActionActionItem } from '@/shared/ui';
import { Dialog, Toast } from 'antd-mobile';
import { DeleteOutline, SetOutline } from 'antd-mobile-icons';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDeleteAssetByIdMutation } from '@/entities/asset';
import { isSuccessApi } from '@/shared/api';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { BottomAction } from '@/shared/ui';

export const AssetBottomActions: FC = () => {
  const { t } = useTranslation('asset');
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
              <div>{t('setting')}</div>
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
              <div>{t('deleteAsset')}</div>
            </div>
          );
        },
        onClick: () => {
          Dialog.confirm({
            title: t('confirmDeleteTitle'),
            content: t('confirmDeleteContent'),
            confirmText: t('confirmDelete'),
            onConfirm: async () => {
              try {
                Toast.show({
                  icon: 'loading',
                  content: t('deleting'),
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
