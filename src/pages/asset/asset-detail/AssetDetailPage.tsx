import type { FC } from 'react';
import { Skeleton } from 'antd-mobile';
import { FileWarning } from 'lucide-react';
import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetAssetByIdQuery } from '@/entities/asset';
import { useTranslation } from '@/shared/i18n';
import { IllustratedEmptyState, Surface } from '@/shared/ui';
import { AssetPageFrame } from '../ui';
import { AssetBottomActions, AssetInfoCard, AssetRecordList } from './ui';

const AssetDetail: FC = () => {
  const { t } = useTranslation('asset');
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const query = useGetAssetByIdQuery({
    params: id,
    options: { enabled: Boolean(id) },
  });
  const onBack = useCallback(() => navigate(-1), [navigate]);

  return (
    <AssetPageFrame
      backLabel={t('common:nav.back')}
      footer={query.data ? <AssetBottomActions assetId={query.data.id} /> : undefined}
      onBack={onBack}
      subtitle={t('detail.subtitle')}
      title={t('detail.title')}
    >
      {query.isLoading && (
        <Surface className="p-5" material="content">
          <Skeleton.Title animated />
          <Skeleton.Paragraph animated lineCount={6} />
        </Surface>
      )}
      {!query.isLoading && (query.isError || !query.data) && (
        <Surface material="content">
          <IllustratedEmptyState
            actionLabel={query.isError ? t('retry') : undefined}
            description={query.isError ? t('detail.loadErrorDescription') : t('detail.notFoundDescription')}
            icon={<FileWarning className="text-primary-deep" size={40} strokeWidth={1.6} />}
            onAction={query.isError ? () => void query.refetch() : undefined}
            title={query.isError ? t('detail.loadError') : t('detail.notFound')}
          />
        </Surface>
      )}
      {!query.isLoading && query.data && (
        <div className="space-y-4">
          <AssetInfoCard asset={query.data} />
          <AssetRecordList assetId={query.data.id} />
        </div>
      )}
    </AssetPageFrame>
  );
};

export default AssetDetail;
