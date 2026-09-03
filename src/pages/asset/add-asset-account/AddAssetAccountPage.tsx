import type { FC } from 'react';
import { Button, Skeleton } from 'antd-mobile';
import { ChevronRight, Layers3, WalletCards } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGetAssetGroupQuery } from '@/entities/asset';
import { useTranslation } from '@/shared/i18n';
import { IllustratedEmptyState, Surface } from '@/shared/ui';
import { AssetPageFrame, IconBlock } from '../ui';
import { getAssetGroupNavigationPath, getAssetGroupParentId } from './model/asset-group-navigation';

const AddAssetAccount: FC = () => {
  const { t } = useTranslation('asset');
  const navigate = useNavigate();
  const [query] = useSearchParams();
  const parentId = getAssetGroupParentId(query);
  const groupsQuery = useGetAssetGroupQuery();

  const groups = useMemo(() => {
    if (parentId)
      return groupsQuery.data.filter(group => group.parentId === parentId);
    return groupsQuery.data.filter(group => group.level === 0);
  }, [groupsQuery.data, parentId]);

  const parent = useMemo(
    () => groupsQuery.data.find(group => group.id === parentId),
    [groupsQuery.data, parentId],
  );

  const handleAddAsset = useCallback((item: (typeof groups)[number]) => () => {
    navigate(getAssetGroupNavigationPath(item, groupsQuery.data));
  }, [groupsQuery.data, navigate]);

  return (
    <AssetPageFrame
      backLabel={t('common:nav.back')}
      onBack={() => navigate(-1)}
      subtitle={parent ? t('group.chooseSubtype') : t('group.subtitle')}
      title={parent?.name ?? t('addAccount')}
    >
      {groupsQuery.isLoading && (
        <Surface className="p-5" material="content">
          <Skeleton.Title animated />
          <Skeleton.Paragraph animated lineCount={5} />
        </Surface>
      )}

      {!groupsQuery.isLoading && groupsQuery.isError && (
        <Surface material="content">
          <IllustratedEmptyState
            actionLabel={t('retry')}
            description={t('group.loadErrorDescription')}
            icon={<Layers3 className="text-primary-deep" size={40} strokeWidth={1.6} />}
            onAction={() => void groupsQuery.refetch()}
            title={t('group.loadError')}
          />
        </Surface>
      )}

      {!groupsQuery.isLoading && !groupsQuery.isError && groups.length === 0 && (
        <Surface material="content">
          <IllustratedEmptyState
            description={t('group.emptyDescription')}
            icon={<WalletCards className="text-primary-deep" size={40} strokeWidth={1.6} />}
            title={t('group.empty')}
          />
        </Surface>
      )}

      {!groupsQuery.isLoading && !groupsQuery.isError && groups.length > 0 && (
        <div className="space-y-3">
          <Surface className="flex items-center gap-3 px-4 py-3.5" material="raised">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-white/75 text-primary-deep shadow-ww-xs">
              <Layers3 size={21} strokeWidth={1.8} />
            </span>
            <p className="text-[11px] font-semibold leading-5 text-ww-mid">{t('group.description')}</p>
          </Surface>

          <Surface className="overflow-hidden" material="content">
            {groups.map((group, index) => (
              <button
                className={`flex min-h-[76px] w-full items-center gap-3 border-0 bg-transparent px-4 text-left active:bg-primary-light/20 ${index ? 'border-t border-solid border-border-primary' : ''}`}
                key={group.id}
                onClick={handleAddAsset(group)}
                type="button"
              >
                <IconBlock name={group.icon} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-black text-ww-ink">{group.name}</span>
                  <span className="mt-0.5 block line-clamp-2 text-[10px] font-semibold leading-4 text-ww-soft">
                    {group.description || t('group.defaultDescription')}
                  </span>
                </span>
                <ChevronRight className="shrink-0 text-ww-ghost" size={17} strokeWidth={2} />
              </button>
            ))}
          </Surface>
          <Button
            block
            className="!mt-4 !h-[48px] !rounded-[16px] !border !border-solid !border-border-primary !bg-white/75 !text-[12px] !font-extrabold !text-ww-mid !shadow-ww-xs"
            onClick={() => navigate(-1)}
          >
            {t('common:nav.cancel')}
          </Button>
        </div>
      )}
    </AssetPageFrame>
  );
};

export default AddAssetAccount;
