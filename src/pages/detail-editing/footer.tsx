import type { FC } from 'react';
import type { recordChildren } from '@/entities/record';
import { Dialog, Toast } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { useDeleteRecordMutation } from '@/entities/record';
import styles from './footer.module.scss';

interface stateType {
  state: recordChildren;
}

const Footer: FC<stateType> = ({ state }) => {
  const navigate = useNavigate();
  const [deleteRecordMutate] = useDeleteRecordMutation();

  const handleEdit = () => {
    navigate('/bookkeeping', { state, replace: true });
  };

  const handleDelete = () => {
    Dialog.confirm({
      content: '删除后数据不可恢复!',
      title: '确认删除',
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
        <button type="button" onClick={handleEdit}>编辑</button>
        <span></span>
        <button type="button" onClick={handleDelete}>删除</button>
      </div>
    </div>
  );
};

export default Footer;
