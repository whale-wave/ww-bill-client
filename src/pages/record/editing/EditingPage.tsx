import type { FC } from 'react';
import type { RecordEntry } from '@/entities/record';
import { ErrorBlock, SpinLoading } from 'antd-mobile';
import { useLocation, useParams } from 'react-router-dom';
import { useGetRecordByIdQuery } from '@/entities/record';
import Footer from '@/pages/record/editing/footer';
import List from '@/pages/record/editing/list';
import Top from '@/pages/record/editing/Top';
import { useTranslation } from '@/shared/i18n';

function isRecordCategory(value: unknown): value is RecordEntry['category'] {
  return typeof value === 'object'
    && value !== null
    && !Array.isArray(value)
    && 'createdAt' in value
    && typeof value.createdAt === 'string'
    && 'icon' in value
    && typeof value.icon === 'string'
    && 'id' in value
    && typeof value.id === 'number'
    && 'name' in value
    && typeof value.name === 'string'
    && 'updatedAt' in value
    && typeof value.updatedAt === 'string';
}

function isRecordEntry(value: unknown): value is RecordEntry {
  return typeof value === 'object'
    && value !== null
    && !Array.isArray(value)
    && 'amount' in value
    && typeof value.amount === 'string'
    && 'category' in value
    && isRecordCategory(value.category)
    && 'createdAt' in value
    && typeof value.createdAt === 'string'
    && 'id' in value
    && typeof value.id === 'number'
    && 'remark' in value
    && typeof value.remark === 'string'
    && 'time' in value
    && typeof value.time === 'string'
    && 'type' in value
    && (value.type === 'sub' || value.type === 'add')
    && 'updatedAt' in value
    && typeof value.updatedAt === 'string'
    && (!('status' in value) || typeof value.status === 'boolean');
}

const Editing: FC = () => {
  const navParams = useLocation();
  const params = useParams();
  const { t } = useTranslation();
  const { data, isLoading } = useGetRecordByIdQuery({
    params: { id: params.id ?? '' },
  });

  const state = data ?? (isRecordEntry(navParams.state) ? navParams.state : undefined);

  if (!state) {
    if (isLoading) {
      return (
        <div className="page flex justify-center items-center">
          <SpinLoading />
        </div>
      );
    }

    return (
      <div className="page flex justify-center items-center">
        <ErrorBlock status="default" title={t('common:error.loadFail')} description={false} />
      </div>
    );
  }

  return (
    <div className="page">
      <Top state={state} />
      <List state={state} />
      <Footer state={state} />
    </div>
  );
};

export default Editing;
