import type { FC } from 'react';
import type { Asset } from '@/entities/asset';
import { Toast } from 'antd-mobile';
import { ArrowLeftRight, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeleteAssetByIdMutation } from '@/entities/asset';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { confirmAppAction } from '@/shared/ui';
import { AssetTransferPopup } from './AssetTransferPopup';

export const AssetBottomActions: FC<{ asset: Asset }> = ({ asset }) => {
  const { t } = useTranslation('asset');
  const navigate = useNavigate();
  const id = asset.id;
  const [isTransferVisible, setIsTransferVisible] = useState(false);

  const [deleteAssetByIdMutate, deleteState] = useDeleteAssetByIdMutation();

  const handleDelete = async () => {
    if (!id || deleteState.isLoading)
      return;
    const confirmed = await confirmAppAction({
      cancelText: t('common:nav.cancel'),
      confirmText: t('confirmDelete'),
      description: t('confirmDeleteContent'),
      icon: <Trash2 size={22} strokeWidth={1.8} />,
      title: t('confirmDeleteTitle'),
      tone: 'danger',
    });
    if (!confirmed)
      return;
    try {
      await deleteAssetByIdMutate(id);
      Toast.show({ icon: 'success', content: t('detail.deleteSuccess') });
      navigate(-1);
    }
    catch {
      Toast.show({ icon: 'fail', content: t('detail.deleteFailed') });
    }
  };

  return (
    <>
      <footer className="relative z-20 grid shrink-0 grid-cols-3 gap-2 border-0 border-t border-solid border-white/70 bg-white/72 px-[12px] pb-[max(12px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
        <button
          className="flex h-[48px] items-center justify-center gap-1.5 rounded-[16px] border border-solid border-primary-light bg-primary-light/55 text-[13px] font-extrabold text-primary-deep shadow-ww-xs"
          onClick={() => setIsTransferVisible(true)}
          type="button"
        >
          <ArrowLeftRight size={17} strokeWidth={1.9} />
          {t('transfer.action')}
        </button>
        <button
          className="flex h-[48px] items-center justify-center gap-2 rounded-[16px] border border-solid border-border-primary bg-white/85 text-[13px] font-extrabold text-primary-deep shadow-ww-xs disabled:opacity-45"
          disabled={!id}
          onClick={() => id && navigate(ROUTES_PATH.ASSET_ADD_FORM.getPath(id))}
          type="button"
        >
          <Pencil size={17} strokeWidth={1.9} />
          {t('detail.edit')}
        </button>
        <button
          className="flex h-[48px] items-center justify-center gap-2 rounded-[16px] border border-solid border-feedback-danger bg-feedback-danger-surface/90 text-[13px] font-extrabold text-feedback-danger shadow-ww-xs disabled:opacity-45"
          disabled={!id || deleteState.isLoading}
          onClick={() => void handleDelete()}
          type="button"
        >
          <Trash2 size={17} strokeWidth={1.9} />
          {t('deleteAsset')}
        </button>
      </footer>
      <AssetTransferPopup
        asset={asset}
        onClose={() => setIsTransferVisible(false)}
        visible={isTransferVisible}
      />
    </>
  );
};
