import choseFile from '@/utils/choseFile';
import { Toast } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import React, { FC, useCallback, useState } from 'react';
import classNames from 'classnames';
import { Button, List, Modal, NavBar } from 'bw-mobile';
import { putUserUserInfoApi, uploadFile } from '@/api';
import styles from './index.module.scss';
import { useUserStore } from '@/store';

const userInfo: FC = () => {
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const { logOut, updateUserInfo, userInfo } = useUserStore(
    ({ logOut, updateUserInfo, userInfo }) => ({
      logOut,
      updateUserInfo,
      userInfo,
    }),
  );
  const [name, setName] = useState(userInfo!.name);

  const toPassword = useCallback(() => navigate('/password'), []);

  const handleLogOut = () => {
    logOut();
    navigate('/detail');
  };

  const onCancelModal = () => {
    setModalVisible(false);
    setName(userInfo!.name);
  };

  const handleChangeName = () => {
    setModalVisible(true);
  };

  const changeName = async () => {
    const { statusCode } = await putUserUserInfoApi({
      name,
      avatar: userInfo!.avatar,
    });
    if (statusCode === 200) {
      updateUserInfo({ name, avatar: userInfo!.avatar });
      setModalVisible(false);
    }
  };

  const handleChangeAvatar = async () => {
    const files = await choseFile();
    const formData = new FormData();
    if (!files) return;
    formData.append('file', files[0]);
    const { statusCode, data } = await uploadFile(formData);
    if (statusCode !== 200) {
      Toast.show({ content: '更新失败', icon: 'fail' });
      return;
    }
    const { statusCode: status } = await putUserUserInfoApi({
      name: userInfo!.name,
      avatar: data.url,
    });
    if (status === 200) {
      updateUserInfo({ name: userInfo!.name, avatar: data.url });
    }
  };

  return (
    <div className={classNames('page')} style={{ background: '#f2f2f7' }}>
      <NavBar back="返回" onBack={() => navigate(-1)}>
        个人信息
      </NavBar>
      <Modal visible={modalVisible} onOk={changeName} onClose={onCancelModal}>
        <div className={styles.modal}>
          <input
            className={styles['modal-input']}
            value={name}
            onChange={({ target: { value } }) => setName(value)}
            placeholder="请输入2-12位昵称"
          />
        </div>
      </Modal>
      <div style={{ height: 10 }} />
      <List>
        <List.Item
          onClick={handleChangeAvatar}
          arrow={false}
          extra={
            <div
              className={classNames(
                styles.avatar,
                'rounded-full overflow-hidden',
              )}
            >
              <img
                className="w-full h-full object-cover"
                src={userInfo?.avatar}
                alt={userInfo?.name}
              />
            </div>
          }
        >
          头像
        </List.Item>
        <List.Item clickable arrow={false} extra={userInfo?.username}>
          账号ID
        </List.Item>
        <List.Item clickable arrow={false} extra={userInfo?.email}>
          邮箱
        </List.Item>
        <List.Item extra={userInfo?.name} onClick={handleChangeName}>
          昵称
        </List.Item>
      </List>
      <List style={{ margin: '10px 0' }}>
        <List.Item onClick={toPassword}>修改密码</List.Item>
      </List>
      <Button size="full" className={styles.out} onClick={handleLogOut}>
        退出登录
      </Button>
    </div>
  );
};
export default userInfo;
