import type { FC } from 'react';
import type { InputProps } from '@/shared/ui';
import { useRef, useState } from 'react';
import { getToolsEmailApi } from '@/entities/tools';
import { useTranslation } from '@/shared/i18n';
import { Input } from '@/shared/ui';

const WAIT_TIME = 60;

export const EmailCaptchaInput: FC<
  InputProps & {
    email?: string;
    sendEmailApi?: (email: string) => Promise<any>;
  }
> = (props) => {
  const { t } = useTranslation('auth');
  const sendEmailApi = props.sendEmailApi || getToolsEmailApi;

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

    if (typeof email !== 'string')
      return;

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
      label={t('captcha')}
      className="mt-3"
      placeholder={t('emailCaptcha.placeholder')}
      suffix={(
        <>
          {sendEmailStatus
            ? (
                <span style={{ color: '#ddd' }}>
                  {t('retry.afterSeconds', { seconds: sendEmailWaitTime })}
                </span>
              )
            : (
                <span onClick={handleEmail}>{t('getCaptcha')}</span>
              )}
        </>
      )}
    />
  );
};
