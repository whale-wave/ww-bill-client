import type { ChangeEvent, CSSProperties, FC } from 'react';
import classNames from 'classnames';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components';
import { sign } from '@/entities/auth';
import { useUserStore } from '@/features/auth';
import { EmailCaptchaInput } from '@/features/email-captcha';
import { Button, NavBar } from '@/shared/ui';
import styles from './index.module.scss';

const inputStyle = {
  '--prefix-width': '73px',
} as CSSProperties;

const Sign: FC = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    emailCode: '',
  });
  const { setToken } = useUserStore(({ setToken }) => ({ setToken }));

  const navigate = useNavigate();

  const setFormValue = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSign = async () => {
    const { statusCode, data } = await sign(form);
    if (statusCode === 200) {
      setToken(data.token);
      setTimeout(navigate, 1000, '/');
    }
  };

  return (
    <div className={classNames(styles.wrapper, 'page')}>
      <NavBar back="返回" backArrow={false} onBack={() => navigate(-1)}>
        注册
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
            label="邮箱"
            value={form.email}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFormValue('email', e.target.value)}
            className="mt-3"
            placeholder="请输入邮箱"
          />
          <Input
            style={inputStyle}
            label="密码"
            value={form.password}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFormValue('password', e.target.value)}
            className="mt-3"
            placeholder="请输入密码"
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
            注册
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Sign;
