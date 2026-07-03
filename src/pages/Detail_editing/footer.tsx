import type { FC } from 'react';
import type { recordChildren } from '@/entities/record';
import { Toast } from 'antd-mobile';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Popup from '@/components/Popup';
import { useDeleteRecordMutation } from '@/entities/record';
import styles from './footer.module.scss';

interface stateType {
  state: recordChildren;
}

const Footer: FC<stateType> = ({ state }) => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [deleteRecordMutate] = useDeleteRecordMutation();

  const handleEdit = () => {
    navigate('/bookkeeping', { state, replace: true });
  };

  const handleDelete = () => {
    setShowPopup(true);
  };

  const handleConfirmDelete = async () => {
    const res = await deleteRecordMutate(`${state.id}`);
    if (res.statusCode === 200 && res.message === '删除成功') {
      Toast.show({ content: res.message });
      navigate('/detail');
    }
  };

  const handleCancelDelete = () => {
    setShowPopup(false);
  };

  return (
    <div className={styles.footer}>
      <div className={styles.main}>
        <button type="button" onClick={handleEdit}>编辑</button>
        <span></span>
        <button type="button" onClick={handleDelete}>删除</button>
      </div>
      <Popup
        showPopup={showPopup}
        change={handleConfirmDelete}
        cancel={handleCancelDelete}
      />
    </div>
  );
};

export default Footer;
