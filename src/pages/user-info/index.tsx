import type { FC } from 'react';
import { ActionSheet, SpinLoading, Toast } from 'antd-mobile';
import classNames from 'classnames';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetUserUserInfoQuery, usePutUserUserInfoMutation } from '@/entities/user';
import { useAuthStore } from '@/features/auth';
import { uploadFile } from '@/shared/api';
import choseFile from '@/shared/lib/chose-file';
import { Button, List, Modal, NavBar } from '@/shared/ui';
import styles from './index.module.scss';

const UserInfo: FC = () => {
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const { data: userInfo } = useGetUserUserInfoQuery();
  const [putUserUserInfoMutate] = usePutUserUserInfoMutation();
  const { logOut } = useAuthStore(({ logOut }) => ({ logOut }));
  const [name, setName] = useState('');

  const onGoToPassword = useCallback(() => navigate('/password'), []);

  const onLogout = () => {
    logOut();
    navigate('/login');
  };

  const onCancelModal = () => {
    setModalVisible(false);
    if (userInfo)
      setName(userInfo.name);
  };

  const onOpenChangeNameModel = () => {
    if (userInfo)
      setName(userInfo.name);
    setModalVisible(true);
  };

  const onChangeName = async () => {
    if (!userInfo)
      return;
    const { statusCode } = await putUserUserInfoMutate({
      name,
      avatar: userInfo.avatar,
    });
    if (statusCode === 200) {
      setModalVisible(false);
    }
  };

  const handleChangeAvatar = async () => {
    if (!userInfo)
      return;
    const files = await choseFile();
    const formData = new FormData();
    if (!files)
      return;
    formData.append('file', files[0]);
    const { statusCode, data } = await uploadFile(formData);

    if (statusCode !== 200) {
      Toast.show({ content: '更新失败', icon: 'fail' });
      return;
    }

    await putUserUserInfoMutate({
      name: userInfo.name,
      avatar: data.url,
    });
  };

  const onChangeEmailActionSheet = useCallback(() => {
    const actionSheet = ActionSheet.show({
      actions: [
        {
          text: '更换邮箱',
          key: 'edit',
          onClick: () => {
            navigate(`/settings/email/change/captcha?email=${userInfo?.email}`);
            actionSheet.close();
          },
        },
      ],
      cancelText: '取消',
    });
  }, [navigate, userInfo]);

  if (!userInfo) {
    return (
      <div className={classNames('page')} style={{ background: '#f2f2f7' }}>
        <NavBar back="返回" onBack={() => navigate(-1)}>
          个人信息
        </NavBar>
        <div className="flex justify-center items-center py-20">
          <SpinLoading />
        </div>
      </div>
    );
  }

  return (
    <div className={classNames('page')} style={{ background: '#f2f2f7' }}>
      <NavBar back="返回" onBack={() => navigate(-1)}>
        个人信息
      </NavBar>
      <Modal visible={modalVisible} onOk={onChangeName} onClose={onCancelModal}>
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
          extra={(
            <div
              className={classNames(
                styles.avatar,
                'rounded-full overflow-hidden',
              )}
            >
              <img
                className="w-full h-full object-cover"
                src={userInfo.avatar}
                alt={userInfo.name}
              />
            </div>
          )}
        >
          头像
        </List.Item>
        <List.Item clickable arrow={false} extra={userInfo.username}>
          账号ID
        </List.Item>
        <List.Item
          clickable
          extra={userInfo.email}
          onClick={onChangeEmailActionSheet}
        >
          邮箱
        </List.Item>
        <List.Item extra={userInfo.name} onClick={onOpenChangeNameModel}>
          昵称
        </List.Item>
      </List>
      <List style={{ margin: '10px 0' }}>
        <List.Item onClick={onGoToPassword}>修改密码</List.Item>
      </List>
      <Button size="full" className={styles.out} onClick={onLogout}>
        退出登录
      </Button>
    </div>
  );
};
export default UserInfo;
