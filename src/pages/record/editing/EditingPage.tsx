import type { FC } from 'react';
import type { RecordEntry } from '@/entities/record';
import { Dialog, ErrorBlock, SpinLoading, Toast } from 'antd-mobile';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { RecordDetailPresentation, useDeleteRecordMutation, useGetRecordByIdQuery } from '@/entities/record';
import { useTranslation } from '@/shared/i18n';
import { getTimedate, getTimeDateYear, getWeekByDay } from '@/shared/lib/date-time';
import { playSound } from '@/shared/lib/play-sound';

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
  const [deleteRecordMutate] = useDeleteRecordMutation();

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

  const handleBack = () => {
    playSound.turnPage();
    if (state.status) {
      navigate('/detail');
    }
    else {
      navigate(-1);
    }
  };

  const handleShare = () => {
    navigate('/share', {
      state: { record: state },
    });
  };

  const handleEdit = () => {
    navigate('/bookkeeping', { state, replace: true });
  };

  const handleDelete = () => {
    Dialog.confirm({
      content: t('record:detail.deleteWarning'),
      title: t('common:confirm.delete'),
      onConfirm: async () => {
        const res = await deleteRecordMutate({ id: `${state.id}`, version: state.version });
        if (res.statusCode === 200 && res.message === '删除成功') {
          Toast.show({ content: res.message });
          navigate('/detail');
        }
      },
    });
  };

  const date = new Date(state.time);
  const timeDate = getTimeDateYear(date);
  const weekByDay = getWeekByDay(getTimedate(date));

  return (
    <RecordDetailPresentation
      backLabel={t('common:nav.back')}
      category={state.category}
      footerActions={[
        { label: t('record:detail.edit'), onClick: handleEdit },
        { label: t('record:detail.delete'), onClick: handleDelete },
      ]}
      onBack={handleBack}
      pinnedAction={{ label: t('record:edit.share'), onClick: handleShare }}
      rows={[
        { label: t('record:edit.type'), value: state.type === 'sub' ? t('record:type.expense') : t('record:type.income') },
        { label: t('record:edit.amount'), value: state.amount },
        { label: t('record:edit.date'), value: `${timeDate}  ${weekByDay}` },
        { label: t('record:edit.remark'), value: state.remark },
      ]}
    />
  );
};

export default Editing;
