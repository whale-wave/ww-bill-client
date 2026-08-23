import type { FC } from 'react';
import type { SuccessResponse } from '@/shared/api';
import type { FormFieldProps } from '@/shared/ui';
import { KeyRound } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { getToolsEmailApi } from '@/entities/tools';
import { useTranslation } from '@/shared/i18n';

import { FormField } from '@/shared/ui';

const WAIT_TIME = 60;

interface EmailCaptchaInputProps extends Omit<FormFieldProps, 'label' | 'onChange' | 'prefix' | 'suffix' | 'value'> {
  cooldownStartedAt?: number;
  email?: string;
  label?: string;
  onChange: (value: string) => void;
  onSend?: () => Promise<boolean>;
  placeholder?: string;
  sendEmailApi?: (email: string) => Promise<SuccessResponse<unknown>>;
  value: string;
}

export const EmailCaptchaInput: FC<EmailCaptchaInputProps> = ({
  email,
  cooldownStartedAt,
  label,
  onChange,
  onSend,
  placeholder,
  sendEmailApi = getToolsEmailApi,
  value,
  ...fieldProps
}) => {
  const { t } = useTranslation('auth');
  const [cooldownUntil, setCooldownUntil] = useState(() => cooldownStartedAt ? cooldownStartedAt + WAIT_TIME * 1000 : 0);
  const [now, setNow] = useState(() => Date.now());
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (cooldownUntil <= now)
      return;

    const timer = window.setTimeout(() => {
      setNow(Date.now());
    }, Math.min(1000, cooldownUntil - now));
    return () => window.clearTimeout(timer);
  }, [cooldownUntil, now]);

  const remainingSeconds = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));

  const handleSend = useCallback(async () => {
    if (!email || isSending || remainingSeconds > 0)
      return;

    setIsSending(true);
    try {
      const isSuccess = onSend
        ? await onSend()
        : (await sendEmailApi(email)).statusCode === 200;
      if (isSuccess)
        setCooldownUntil(Date.now() + WAIT_TIME * 1000);
    }
    catch {}
    finally {
      setIsSending(false);
    }
  }, [email, isSending, onSend, remainingSeconds, sendEmailApi]);

  const sendLabel = remainingSeconds > 0
    ? t('retry.afterSeconds', { seconds: remainingSeconds })
    : isSending
      ? t('captchaSending')
      : t('getCaptcha');

  return (
    <FormField
      {...fieldProps}
      inputMode="numeric"
      label={label ?? t('sign.captcha')}
      maxLength={6}
      onChange={onChange}
      placeholder={placeholder ?? t('emailCaptcha.placeholder')}
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
