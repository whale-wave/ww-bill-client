import type { FC } from 'react';
import type { RecordEntry } from '@/entities/record';
import { ErrorBlock, Toast } from 'antd-mobile';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CategoryIcon } from '@/entities/category';
import {
  readPersonalRecordDetailNavigationState,
  RecordDetailPresentation,
  useDeleteRecordMutation,
  useGetRecordByIdQuery,
} from '@/entities/record';
import { RecordAttachmentSection } from '@/entities/record/ui/RecordAttachmentSection';
import { useTranslation } from '@/shared/i18n';
import { getTimedate, getTimeDateYear, getWeekByDay } from '@/shared/lib/date-time';
import { playSound } from '@/shared/lib/play-sound';
import { confirmDangerousAction, PageLoadingState } from '@/shared/ui';

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
    && 'version' in value
    && typeof value.version === 'number'
    && Number.isInteger(value.version)
    && value.version >= 0
    && (!('status' in value) || typeof value.status === 'boolean');
}

const Editing: FC = () => {
  const navParams = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { t } = useTranslation(['record', 'common']);
  const { data, isLoading } = useGetRecordByIdQuery({
    params: { id: params.id ?? '' },
  });
  const [deleteRecordMutate, deleteState] = useDeleteRecordMutation();

  const state = data ?? (isRecordEntry(navParams.state) ? navParams.state : undefined);
  const personalRecordDetailNavigation = readPersonalRecordDetailNavigationState(navParams.state);

  if (!state) {
    if (isLoading) {
      return <PageLoadingState label={t('common:nav.loading')} testId="editing-loading" />;
    }

    return (
      <div className="page flex justify-center items-center">
        <ErrorBlock status="default" title={t('common:error.loadFail')} description={false} />
      </div>
    );
  }

  const handleBack = () => {
    playSound.turnPage();
    if (personalRecordDetailNavigation) {
      navigate('/detail', { replace: true });
    }
    else if (state.status) {
      navigate('/detail');
    }
    else {
      navigate(-1);
    }
  };

  const handleEdit = () => {
    navigate('/bookkeeping', {
      replace: true,
      state: { ...state, ...personalRecordDetailNavigation },
    });
  };

  const handleDelete = async () => {
    const confirmed = await confirmDangerousAction({
      cancelText: t('common:nav.cancel'),
      confirmText: t('record:detail.delete'),
      description: t('record:detail.deleteWarning'),
      title: t('common:confirm.delete'),
    });
    if (!confirmed)
      return;
    try {
      const res = await deleteRecordMutate({ id: `${state.id}`, version: state.version });
      Toast.show({ content: res.message || t('common:confirm.deleteSuccess'), icon: 'success' });
      navigate('/detail', { replace: true });
    }
    catch {
      Toast.show({ content: t('common:api.requestFailed'), icon: 'fail' });
    }
  };

  const date = new Date(state.time);
  const timeDate = getTimeDateYear(date);
  const weekByDay = getWeekByDay(getTimedate(date));

  return (
    <RecordDetailPresentation
      amount={state.amount}
      amountType={state.type}
      backLabel={t('common:nav.back')}
      category={state.category}
      categoryIcon={<CategoryIcon categoryName={state.category.name} iconKey={state.category.icon} size={36} />}
      footerActions={[
        { label: t('record:detail.edit'), onClick: handleEdit },
        {
          disabled: deleteState.isLoading,
          label: deleteState.isLoading ? t('common:loading') : t('record:detail.delete'),
          onClick: () => void handleDelete(),
          tone: 'danger',
        },
      ]}
      onBack={handleBack}
      rows={[
        { label: t('record:edit.type'), value: state.type === 'sub' ? t('record:type.expense') : t('record:type.income') },
        { label: t('record:edit.date'), value: `${timeDate}  ${weekByDay}` },
        { label: t('record:edit.remark'), value: state.remark },
      ]}
      supplementaryContent={state.attachments?.length
        ? <RecordAttachmentSection attachments={state.attachments} />
        : undefined}
      supplementaryRows={state.tags?.length
        ? [{ label: '标签', value: state.tags.map(tag => `#${tag.name}`).join(' ') }]
        : []}
    />
  );
};

export default Editing;
