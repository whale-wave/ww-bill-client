import type { ChangeEvent, FC } from 'react';
import { Toast } from 'antd-mobile';
import classNames from 'classnames';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '@/entities/user';
import { useTranslation } from '@/shared/i18n';
import { Button, Input, NavBar } from '@/shared/ui';
import styles from './index.module.scss';

const Password: FC = () => {
  const { t } = useTranslation('user');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [rePassword, setRePassword] = useState('');

  const navigate = useNavigate();

  const handleOldPassword = (e: ChangeEvent<HTMLInputElement>) => {
    setOldPassword(e.target.value);
  };

  const handleRePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRePassword(e.target.value);
  };

  const handleNewPassword = (e: ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };

  const handleChangePassword = async () => {
    if (newPassword !== rePassword) {
      return Toast.show(t('password.passwordMismatch'));
    }
    const { statusCode } = await changePassword({
      password: oldPassword,
      newPassword,
    });
    if (statusCode === 200)
      setTimeout(navigate, 1000, -1);
  };

  return (
    <div className={classNames(styles.wrapper, 'page')}>
      <NavBar back={t('common:nav.back')} backArrow={false} onBack={() => navigate(-1)}>
        {t('password.title')}
      </NavBar>
      <main
        className={classNames('flex-grow flex justify-center items-center')}
      >
        <div
          className={classNames(
            styles.box,
            'flex flex-col justify-center items-center',
          )}
        >
          <Input
            label={t('password.oldPassword')}
            value={oldPassword}
            onChange={handleOldPassword}
            type="password"
            placeholder={t('password.oldPasswordPlaceholder')}
          />
          <Input
            label={t('password.newPassword')}
            type="password"
            value={newPassword}
            onChange={handleNewPassword}
            className="mt-3"
            placeholder={t('password.newPasswordPlaceholder')}
          />
          <Input
            label={t('password.confirmPassword')}
            className="mt-3"
            value={rePassword}
            type="password"
            onChange={handleRePasswordChange}
            placeholder={t('password.confirmPasswordPlaceholder')}
          />
          <Button
            block
            style={{ margin: '50px 0 14px 0' }}
            onClick={handleChangePassword}
          >
            {t('password.done')}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Password;
