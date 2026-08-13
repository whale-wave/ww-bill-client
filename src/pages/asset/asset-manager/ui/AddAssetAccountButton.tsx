import type { FC } from 'react';
import { Plus } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/shared/config/routes';

export const AddAssetAccountButton: FC = () => {
  const { t } = useTranslation('asset');
  const navigate = useNavigate();

  const handleAddAssetAccount = useCallback(() => {
    navigate(ROUTES_PATH.ASSET_ADD_ACCOUNT.getPath());
  }, [navigate]);

  return (
    <button
      className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[16px] border-0 bg-[linear-gradient(135deg,#6fc2dc,#4aaac4)] text-[15px] font-bold text-white shadow-ww active:opacity-85"
      data-testid="asset-add-account"
      onClick={handleAddAssetAccount}
      type="button"
    >
      <Plus size={18} strokeWidth={2.2} />
      <span>{t('addAccount')}</span>
    </button>
  );
};
