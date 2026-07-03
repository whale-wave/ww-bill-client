import type { FC } from 'react';
import { ActionSheet, Toast } from 'antd-mobile';
import classNames from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadFile } from '@/api';
import { useGetUserUserInfoQuery, usePutUserUserInfoMutation } from '@/entities/user';
import choseFile from '@/shared/lib/chose-file';
import { Button, List, Modal, NavBar } from '@/shared/ui';
import { useUserStore } from '@/store';
import styles from './index.module.scss';

const UserInfo: FC = () => {
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const { data } = useGetUserUserInfoQuery();
  const [putUserUserInfoMutate] = usePutUserUserInfoMutation();

  const { logOut, setUserInfo, userInfo } = useUserStore(
    ({ logOut, userInfo, setUserInfo }) => ({
      logOut,
      setUserInfo,
      userInfo,
    }),
  );
  const [name, setName] = useState(userInfo!.name);

  const onGoToPassword = useCallback(() => navigate('/password'), []);

  const onLogout = () => {
    logOut();
    navigate('/login');
  };

  const onCancelModal = () => {
    setModalVisible(false);
    setName(userInfo!.name);
  };

  const onOpenChangeNameModel = () => {
    setModalVisible(true);
  };

  const onChangeName = async () => {
    const { statusCode } = await putUserUserInfoMutate({
      name,
      avatar: userInfo!.avatar,
    });
    if (statusCode === 200) {
      setModalVisible(false);
    }
  };

  const handleChangeAvatar = async () => {
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
      name: userInfo!.name,
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
  }, []);

  useEffect(() => {
    if (!data)
      return;
    setUserInfo(data);
  }, [data]);

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
                src={userInfo?.avatar}
                alt={userInfo?.name}
              />
            </div>
          )}
        >
          头像
        </List.Item>
        <List.Item clickable arrow={false} extra={userInfo?.username}>
          账号ID
        </List.Item>
        <List.Item
          clickable
          extra={userInfo?.email}
          onClick={onChangeEmailActionSheet}
        >
          邮箱
        </List.Item>
        <List.Item extra={userInfo?.name} onClick={onOpenChangeNameModel}>
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
