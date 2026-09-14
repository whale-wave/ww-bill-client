import type { Asset, AssetGroup } from '@/entities/asset';
import { Banknote, Check } from 'lucide-react';
import { AssetGroupAssetType, getAssetAccountTypeLabel } from '@/entities/asset';
import { useTranslation } from '@/shared/i18n';
import { cn, money } from '@/shared/lib';
import { AppSheet, PageLoadingState, SheetHeader } from '@/shared/ui';

interface DefaultAssetPickerSheetProps {
  assetGroups: AssetGroup[];
  assets: Asset[];
  isError: boolean;
  isLoading: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSelect: (assetId: string | null) => void;
  selectedAssetId: string | null;
  visible: boolean;
}

export function DefaultAssetPickerSheet({
  assetGroups,
  assets,
  isError,
  isLoading,
  isSaving,
  onClose,
  onSelect,
  selectedAssetId,
  visible,
}: DefaultAssetPickerSheetProps) {
  const { t } = useTranslation('settings');

  const renderCheck = (isSelected: boolean) => (
    <span className={cn(
      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
      isSelected ? 'bg-primary-light text-primary-deep' : 'text-transparent',
    )}
    >
      <Check aria-hidden="true" size={14} strokeWidth={2.5} />
    </span>
  );

  return (
    <AppSheet
      bodyClassName="flex max-h-[72vh] flex-col overflow-hidden"
      destroyOnClose
      onClose={onClose}
      visible={visible}
    >
      <SheetHeader
        closeLabel={t('common:nav.close')}
        description={t('defaultAsset.pickerDescription')}
        icon={<Banknote size={20} strokeWidth={1.9} />}
        onClose={onClose}
        title={t('defaultAsset.title')}
      />
      <div className="min-h-0 overflow-auto px-4 pb-[max(20px,env(safe-area-inset-bottom))]">
        <div className="space-y-2 py-3">
          <button
            aria-pressed={selectedAssetId === null}
            className={cn(
              'flex min-h-[64px] w-full items-center gap-3 rounded-[16px] border bg-white px-3 text-left',
              selectedAssetId === null ? 'border-primary' : 'border-transparent',
            )}
            data-default-asset-option="none"
            disabled={isSaving}
            onClick={() => onSelect(null)}
            type="button"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-ww-surface-tint text-ww-mid">
              <Banknote aria-hidden="true" size={18} strokeWidth={1.9} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-extrabold text-ww-ink">{t('defaultAsset.none')}</span>
              <span className="block text-[11px] font-semibold text-ww-soft">{t('defaultAsset.noneDescription')}</span>
            </span>
            {renderCheck(selectedAssetId === null)}
          </button>

          {isLoading && (
            <PageLoadingState
              compact
              label={t('defaultAsset.loading')}
              testId="default-asset-loading"
            />
          )}
          {isError && (
            <p className="px-3 py-6 text-center text-[12px] font-semibold text-feedback-danger">
              {t('defaultAsset.loadFailed')}
            </p>
          )}
          {!isLoading && !isError && assets.length === 0 && (
            <p className="px-3 py-6 text-center text-[12px] font-semibold leading-5 text-ww-mid">
              {t('defaultAsset.empty')}
            </p>
          )}
          {assets.map((asset) => {
            const isSelected = asset.id === selectedAssetId;
            return (
              <button
                aria-pressed={isSelected}
                className={cn(
                  'flex min-h-[64px] w-full items-center gap-3 rounded-[16px] border bg-white px-3 text-left',
                  isSelected ? 'border-primary' : 'border-transparent',
                )}
                data-default-asset-option={asset.id}
                disabled={isSaving}
                key={asset.id}
                onClick={() => onSelect(asset.id)}
                type="button"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-primary-light text-primary-deep">
                  <Banknote aria-hidden="true" size={18} strokeWidth={1.9} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-extrabold text-ww-ink">{asset.name}</span>
                  <span className="block truncate text-[11px] font-semibold text-ww-soft">
                    {getAssetAccountTypeLabel(asset, assetGroups)}
                  </span>
                </span>
                <span className="shrink-0 font-number text-[13px] font-bold text-ww-mid">
                  {t(
                    asset.assetGroup.assetType === AssetGroupAssetType.CREDIT
                      ? 'defaultAsset.debt'
                      : 'defaultAsset.balance',
                    { amount: money.formatNatural(asset.amount) },
                  )}
                </span>
                {renderCheck(isSelected)}
              </button>
            );
          })}
        </div>
      </div>
    </AppSheet>
  );
}
