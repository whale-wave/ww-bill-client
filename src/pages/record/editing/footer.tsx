import type { FC } from 'react';
import type { recordChildren } from '@/entities/record';
import { Dialog, Toast } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { useDeleteRecordMutation } from '@/entities/record';
import { useTranslation } from '@/shared/i18n';
import styles from './footer.module.scss';

interface stateType {
  state: recordChildren;
}

const Footer: FC<stateType> = ({ state }) => {
  const { t } = useTranslation(['record', 'common']);
  const navigate = useNavigate();
  const [deleteRecordMutate] = useDeleteRecordMutation();

  const handleEdit = () => {
    navigate('/bookkeeping', { state, replace: true });
  };

  const handleDelete = () => {
    Dialog.confirm({
      content: t('record:detail.deleteWarning'),
      title: t('common:confirm.delete'),
      onConfirm: async () => {
        const res = await deleteRecordMutate(`${state.id}`);
        if (res.statusCode === 200 && res.message === '删除成功') {
          Toast.show({ content: res.message });
          navigate('/detail');
        }
      },
    });
  };

  return (
    <div className={styles.footer}>
      <div className={styles.main}>
        <button type="button" onClick={handleEdit}>{t('record:detail.edit')}</button>
        <span></span>
        <button type="button" onClick={handleDelete}>{t('record:detail.delete')}</button>
      </div>
    </div>
  );
};

export default Footer;
