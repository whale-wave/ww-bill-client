import { useTranslation } from '@/shared/i18n';
import type { ChangeEvent, CSSProperties, FC } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sign } from '@/entities/auth';
import { userKeys } from '@/entities/user';
import { useAuthStore } from '@/features/auth';
import { EmailCaptchaInput } from '@/features/email-captcha';
import { Button, Input, NavBar } from '@/shared/ui';
import styles from './index.module.scss';

const inputStyle = {
  '--prefix-width': '73px',
} as CSSProperties;

const Sign: FC = () => {
  const { t } = useTranslation('auth');
  const [form, setForm] = useState({
    email: '',
    password: '',
    emailCode: '',
  });
  const queryClient = useQueryClient();
  const { setToken } = useAuthStore(({ setToken }) => ({ setToken }));

  const navigate = useNavigate();

  const setFormValue = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSign = async () => {
    const { statusCode, data } = await sign(form);
    if (statusCode === 200) {
      setToken(data.token);
      queryClient.setQueryData(userKeys.info(), {
        statusCode: 200,
        message: '',
        data: data.userInfo,
      });
      setTimeout(navigate, 1000, '/');
    }
  };

  return (
    <div className={classNames(styles.wrapper, 'page')}>
      <NavBar back={t('common:nav.back')} backArrow={false} onBack={() => navigate(-1)}>
        {t('sign.title')}
      </NavBar>
      <main
        className={classNames(
          'flex-grow flex justify-center items-center px-[28px]',
        )}
      >
        <div
          className={classNames(
            styles.box,
            'flex flex-col justify-center items-center',
          )}
        >
          <Input
            style={inputStyle}
            label={t('sign.email')}
            value={form.email}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFormValue('email', e.target.value)}
            className="mt-3"
            placeholder={t('validation.emailRequired')}
          />
          <Input
            style={inputStyle}
            label={t('sign.password')}
            value={form.password}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFormValue('password', e.target.value)}
            className="mt-3"
            placeholder={t('validation.passwordRequired')}
          />
          <EmailCaptchaInput
            email={form.email}
            style={inputStyle}
            value={form.emailCode}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFormValue('emailCode', e.target.value)}
          />
          <Button
            block
            style={{ margin: '40px 0 14px 0' }}
            onClick={handleSign}
          >
            {t('sign.submit')}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Sign;
