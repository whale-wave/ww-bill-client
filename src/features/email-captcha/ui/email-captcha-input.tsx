import type { FC } from 'react';
import type { FormFieldProps } from '@/shared/ui';
import { KeyRound } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { getToolsEmailApi } from '@/entities/tools';
import { useTranslation } from '@/shared/i18n';
import { FormField } from '@/shared/ui';

const WAIT_TIME = 60;

interface SendEmailResponse {
  statusCode: number;
}

interface EmailCaptchaInputProps extends Omit<FormFieldProps, 'label' | 'onChange' | 'prefix' | 'suffix' | 'value'> {
  email?: string;
  onChange: (value: string) => void;
  sendEmailApi?: (email: string) => Promise<SendEmailResponse>;
  value: string;
}

export const EmailCaptchaInput: FC<EmailCaptchaInputProps> = ({
  email,
  onChange,
  sendEmailApi = getToolsEmailApi,
  value,
  ...fieldProps
}) => {
  const { t } = useTranslation('auth');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (remainingSeconds <= 0)
      return;

    const timer = window.setTimeout(() => {
      setRemainingSeconds(seconds => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [remainingSeconds]);

  const handleSend = useCallback(async () => {
    if (!email || isSending || remainingSeconds > 0)
      return;

    setIsSending(true);
    try {
      const response = await sendEmailApi(email);
      if (response.statusCode === 200)
        setRemainingSeconds(WAIT_TIME);
    }
    finally {
      setIsSending(false);
    }
  }, [email, isSending, remainingSeconds, sendEmailApi]);

  const sendLabel = remainingSeconds > 0
    ? t('retry.afterSeconds', { seconds: remainingSeconds })
    : isSending
      ? t('captchaSending')
      : t('getCaptcha');

  return (
    <FormField
      {...fieldProps}
      inputMode="numeric"
      label={t('sign.captcha')}
      maxLength={6}
      onChange={onChange}
      placeholder={t('emailCaptcha.placeholder')}
      prefix={<KeyRound size={18} strokeWidth={1.8} />}
      suffix={(
        <button
          className="min-h-8 rounded-full border-0 bg-primary-light/55 px-3 text-[11px] font-bold text-primary-deep disabled:text-ww-soft"
          disabled={!email || isSending || remainingSeconds > 0}
          onClick={() => void handleSend()}
          type="button"
        >
          {sendLabel}
        </button>
      )}
      value={value}
    />
  );
};
