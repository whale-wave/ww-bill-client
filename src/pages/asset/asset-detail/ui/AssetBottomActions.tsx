import type { FC } from 'react';
import type { Asset } from '@/entities/asset';
import { ArrowLeftRight, Pencil, Trash2 } from 'lucide-react';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeleteAssetByIdMutation } from '@/entities/asset';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { AppButton, confirmAppAction } from '@/shared/ui';
import { showAppError } from '@/shared/ui/app-feedback';
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
      navigate(-1);
    }
    catch {
      showAppError({ icon: 'fail', content: t('detail.deleteFailed') });
    }
  };

  return (
    <>
      <footer className="relative z-20 grid shrink-0 grid-cols-3 gap-2 border-0 border-t border-solid border-white/70 bg-white/72 px-[12px] pb-[max(12px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
        <AppButton
          fullWidth
          onClick={() => setIsTransferVisible(true)}
          variant="secondary"
        >
          <ArrowLeftRight size={17} strokeWidth={1.9} />
          {t('transfer.action')}
        </AppButton>
        <AppButton
          disabled={!id}
          fullWidth
          onClick={() => id && navigate(ROUTES_PATH.ASSET_ADD_FORM.getPath(id))}
          variant="secondary"
        >
          <Pencil size={17} strokeWidth={1.9} />
          {t('detail.edit')}
        </AppButton>
        <AppButton
          disabled={!id || deleteState.isLoading}
          fullWidth
          loading={deleteState.isLoading}
          onClick={() => void handleDelete()}
          variant="danger"
        >
          <Trash2 size={17} strokeWidth={1.9} />
          {t('deleteAsset')}
        </AppButton>
      </footer>
      <AssetTransferPopup
        asset={asset}
        onClose={() => setIsTransferVisible(false)}
        visible={isTransferVisible}
      />
    </>
  );
};
