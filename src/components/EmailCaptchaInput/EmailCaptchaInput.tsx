import { FC, useRef, useState } from 'react';
import { Input, InputProps } from '../Input';
import { getEmailCaptchaAPi } from '@/api';

const WAIT_TIME = 60;

export const EmailCaptchaInput: FC<
  InputProps & {
    email?: string;
    sendEmailApi?: (email: string) => Promise<any>;
  }
> = (props) => {
  const sendEmailApi = props.sendEmailApi || getEmailCaptchaAPi;

  const sendEmailWaitTimeRef = useRef(WAIT_TIME);
  const [sendEmailWaitTime, setSendEmailWaitTime] = useState(WAIT_TIME);
  const [sendEmailStatus, setSendEmailStatus] = useState(false);
  const waitSendEmail = () => {
    setSendEmailWaitTime(sendEmailWaitTimeRef.current--);
    const timer = setInterval(() => {
      setSendEmailWaitTime(sendEmailWaitTimeRef.current--);
      if (sendEmailWaitTimeRef.current <= 0) {
        clearInterval(timer);
        setSendEmailStatus(false);
        sendEmailWaitTimeRef.current = WAIT_TIME;
        setSendEmailWaitTime(WAIT_TIME);
      }
    }, 1000);
  };
  const handleEmail = async () => {
    const { email } = props;

    if (typeof email !== 'string') return;

    const res = await sendEmailApi(email);
    const canSend = res.statusCode === 200;
    if (canSend) {
      setSendEmailStatus(canSend);
      waitSendEmail();
    }
  };

  return (
    <Input
      {...props}
      label="验证码"
      className="mt-3"
      placeholder="请输入邮箱验证码"
      suffix={
        <>
          {sendEmailStatus ? (
            <span style={{ color: '#ddd' }}>{sendEmailWaitTime}秒后重试</span>
          ) : (
            <span onClick={handleEmail}>获取验证码</span>
          )}
        </>
      }
    />
  );
};
