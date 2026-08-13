import type { Dayjs } from 'dayjs';
import type { FC } from 'react';
import dayjs from 'dayjs';
import { KeyRound } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from '@/shared/i18n';
import { FormField } from '@/shared/ui';

const COUNTDOWN_TIME_SECOND = 60;

interface WwInputVerifyCodeProps {
  className?: string;
  label?: string;
  onChange?: (value: string) => void;
  onSend?: () => Promise<boolean>;
  placeholder?: string;
  setStartTime: (time?: Dayjs) => void;
  startTime?: Dayjs;
  value: string;
}

const WwInputVerifyCode: FC<WwInputVerifyCodeProps> = ({
  className,
  label,
  onChange,
  onSend,
  placeholder,
  setStartTime,
  startTime,
  value,
}) => {
  const { t } = useTranslation('auth');
  const [now, setNow] = useState<Dayjs | undefined>(() => startTime ? dayjs() : undefined);
  const [isSending, setIsSending] = useState(false);

  const startCountdown = useCallback(() => {
    const nextStartTime = dayjs();
    setStartTime(nextStartTime);
    setNow(nextStartTime);
  }, [setStartTime]);

  const handleSend = useCallback(async () => {
    if (isSending)
      return;
    setIsSending(true);
    try {
      if (await onSend?.())
        startCountdown();
    }
    finally {
      setIsSending(false);
    }
  }, [isSending, onSend, startCountdown]);

  useEffect(() => {
    if (!startTime)
      return;
    const timer = window.setInterval(() => {
      const nextNow = dayjs();
      if (nextNow.diff(startTime, 'second') >= COUNTDOWN_TIME_SECOND) {
        window.clearInterval(timer);
        setNow(undefined);
        setStartTime(undefined);
        return;
      }
      setNow(nextNow);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [setStartTime, startTime]);

  const remainingTime = useMemo(() => {
    if (!startTime || !now)
      return 0;
    return Math.max(0, COUNTDOWN_TIME_SECOND - now.diff(startTime, 'second'));
  }, [startTime, now]);

  return (
    <FormField
      className={className}
      inputMode="numeric"
      label={label ?? t('sign.captcha')}
      maxLength={6}
      onChange={onChange}
      placeholder={placeholder ?? t('captcha.placeholder')}
      prefix={<KeyRound size={18} strokeWidth={1.8} />}
      suffix={(
        <button
          className="min-h-8 rounded-full border-0 bg-primary-light/55 px-3 text-[11px] font-bold text-primary-deep disabled:text-ww-soft"
          disabled={remainingTime > 0 || isSending}
          onClick={() => void handleSend()}
          type="button"
        >
          {remainingTime > 0
            ? t('retry.afterSeconds', { seconds: remainingTime })
            : isSending
              ? t('captchaSending')
              : t('sign.resendCaptcha')}
        </button>
      )}
      value={value}
    />
  );
};

export default WwInputVerifyCode;
