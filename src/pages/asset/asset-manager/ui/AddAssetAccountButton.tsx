import type { FC } from 'react';
import { Plus } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/shared/config/routes';
import { AppButton } from '@/shared/ui';

export const AddAssetAccountButton: FC = () => {
  const { t } = useTranslation('asset');
  const navigate = useNavigate();

  const handleAddAssetAccount = useCallback(() => {
    navigate(ROUTES_PATH.ASSET_ADD_ACCOUNT.getPath());
  }, [navigate]);

  return (
    <AppButton
      className="ww-theme-primary-action"
      data-testid="asset-add-account"
      fullWidth
      onClick={handleAddAssetAccount}
    >
      <Plus size={18} strokeWidth={2.2} />
      <span>{t('addAccount')}</span>
    </AppButton>
  );
};
